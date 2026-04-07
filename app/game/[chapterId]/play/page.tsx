'use client'
// app/game/[chapterId]/play/page.tsx
// Halaman quiz aktif — timer global chapter, persisted via localStorage.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { getChapterBySlug, type Chapter } from '@/lib/chapters'
import { questionsApi, sessionsApi, answersApi } from '@/lib/gameApi'
import type { Question, Session } from '@/lib/gameApi'
import { useGameTimer } from '@/hooks/useGameTimer'
import GameTimer from '@/components/game/GameTimer'
import AnswerInput from '@/components/game/AnswerInput'
import HintPenaltyModal from '@/components/game/HintPenaltyModal'

// ── localStorage helpers ──────────────────────────────────────────
const LS_KEY = 'ws_play_session'

interface StoredSession {
  sessionId: string
  chapterSlug: string
  startedAt: string      // ISO string
  chapterTimerSeconds: number
  // Detik yang sudah dipotong oleh hint (akumulasi)
  penalisedSeconds: number
}

function saveSession(data: StoredSession) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearSession() {
  try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
}

/**
 * Hitung sisa waktu dari startedAt + penalisedSeconds.
 * Mengembalikan detik tersisa (bisa 0 jika sudah habis).
 */
function calcTimeLeft(stored: StoredSession): number {
  const elapsedMs = Date.now() - new Date(stored.startedAt).getTime()
  const elapsedSec = Math.floor(elapsedMs / 1000)
  const used = elapsedSec + stored.penalisedSeconds
  return Math.max(0, stored.chapterTimerSeconds - used)
}

// ── Hint Penalty Modal ────────────────────────────────────────────
// (komponen sudah ada di components/game/HintPenaltyModal.tsx)

// ── Question Card ─────────────────────────────────────────────────
function QuestionCard({
  question,
  index,
  total,
  chapter,
  isUrgent,
}: {
  question: Question
  index: number
  total: number
  chapter: Chapter
  isUrgent: boolean
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', textAlign: 'center', marginBottom: 36 }}
      >
        {/* Location badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            marginBottom: 20,
            padding: '6px 14px',
            background: `${chapter.color}10`,
            border: `1px solid ${chapter.color}30`,
            borderRadius: 20,
          }}
        >
          <span style={{ fontSize: '0.75rem' }}>📍</span>
          <span
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.62rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: chapter.color,
            }}
          >
            {question.location_name}
          </span>
        </div>

        {/* Question text */}
        <h2
          style={{
            fontFamily: 'var(--font-barlow)',
            fontWeight: 900,
            fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)',
            textTransform: 'uppercase',
            lineHeight: 1.08,
            color: isUrgent ? '#ec2b25' : 'var(--ws-cream)',
            marginBottom: 12,
            transition: 'color 0.5s',
          }}
        >
          {question.question_text}
        </h2>

        {/* Format label */}
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.78rem',
            color: 'rgba(221,219,216,0.35)',
          }}
        >
          Format:{' '}
          <span style={{ color: 'rgba(221,219,216,0.6)' }}>
            {
              {
                any: 'Teks / Foto / Video',
                text: 'Teks',
                photo: 'Foto',
                video: 'Video',
              }[question.answer_type]
            }
          </span>
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Correct flash overlay ─────────────────────────────────────────
function CorrectFlash({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.15, 0] }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        background: color,
        pointerEvents: 'none',
        zIndex: 200,
      }}
    />
  )
}

// ── Main Play Page ────────────────────────────────────────────────
export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const slug = typeof params.chapterId === 'string' ? params.chapterId : ''
  const chapter = getChapterBySlug(slug)

  // ── State ─────────────────────────────────────────────────────
  type PageState = 'init' | 'ready' | 'done' | 'error'
  const [pageState, setPageState] = useState<PageState>('init')
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<{
    passed: boolean
    hint?: string
  } | null>(null)
  const [flashColor, setFlashColor] = useState<string | null>(null)

  // Hint state
  const [showHintText, setShowHintText] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const [skipHintConfirm, setSkipHintConfirm] = useState(false)

  // Stored session ref (untuk update penalisedSeconds)
  const storedRef = useRef<StoredSession | null>(null)

  // ── Timer ─────────────────────────────────────────────────────
  // Diinisialisasi ke 0 dulu, di-set ulang setelah kalkulasi timeLeft
  const timer = useGameTimer(chapter?.timer_seconds ?? 88 * 60)

  // ── Auth guard ────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?from=/game/${slug}/play`)
    }
  }, [user, authLoading, router, slug])

  // ── Init: cek localStorage → session aktif atau redirect ──────
  useEffect(() => {
    if (authLoading || !user || !chapter) return

    const stored = loadSession()

    if (!stored || stored.chapterSlug !== slug) {
      // Tidak ada session aktif untuk chapter ini → ke briefing
      router.replace(`/game/${slug}`)
      return
    }

    // Hitung sisa waktu
    const timeLeft = calcTimeLeft(stored)

    if (timeLeft <= 0) {
      // Waktu sudah habis saat user refresh
      clearSession()
      router.replace(`/game/done?chapter=${slug}&reason=expired`)
      return
    }

    // Session valid — load questions dan lanjut
    storedRef.current = stored

    Promise.all([
      questionsApi.list(),
      // Kita tidak perlu re-fetch session dari backend,
      // cukup reconstruct minimal Session object dari localStorage
    ])
      .then(([qRes]) => {
        setQuestions(qRes.questions)
        setSession({ id: stored.sessionId } as Session)
        // Reset & start timer dari sisa waktu
        timer.reset(timeLeft)
        setTimeout(() => timer.start(), 100)
        setPageState('ready')
      })
      .catch(() => setPageState('error'))
  }, [authLoading, user, chapter, slug]) // eslint-disable-line

  // ── Saat timer habis → selesai ────────────────────────────────
  useEffect(() => {
    if (pageState !== 'ready') return
    if (!timer.expired) return

    handleFinish('expired')
  }, [timer.expired, pageState]) // eslint-disable-line

  // ── Reset hint state saat soal berganti ───────────────────────
  useEffect(() => {
    setLastResult(null)
    setShowHintText(false)
    setShowHintModal(false)
  }, [qIndex])

  // ── Finish: tutup session, clear localStorage, redirect ───────
  const handleFinish = useCallback(
    async (reason: 'done' | 'expired') => {
      timer.pause()
      if (session) {
        try { await sessionsApi.finish(session.id) } catch { /* ignore */ }
      }
      clearSession()
      router.replace(
        `/game/done?chapter=${slug}&reason=${reason}&timeLeft=${timer.timeLeft}`
      )
    },
    [session, slug, timer, router]
  )

  // ── Submit jawaban ────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (type: 'text' | 'photo' | 'video', value: string | File) => {
      if (!session) return
      const question = questions[qIndex]
      setLoading(true)

      try {
        const result =
          type === 'text'
            ? await answersApi.submitText(session.id, question.id, value as string)
            : await answersApi.submitFile(session.id, question.id, type, value as File)

        setLastResult({ passed: result.passed })

        if (result.passed) {
          // Flash hijau
          setFlashColor('#4ade80')
          setTimeout(() => setFlashColor(null), 600)

          // Advance ke soal berikutnya setelah 1.3 detik
          setTimeout(() => {
            if (qIndex + 1 >= questions.length) {
              handleFinish('done')
            } else {
              setQIndex((i) => i + 1)
            }
          }, 1300)
        } else {
          // Flash merah + penalti 3 menit
          setFlashColor('#ec2b25')
          setTimeout(() => setFlashColor(null), 600)

          const wrongPenalty = 3 * 60 // 3 menit
          timer.penalise(wrongPenalty)

          if (storedRef.current) {
            storedRef.current = {
              ...storedRef.current,
              penalisedSeconds: storedRef.current.penalisedSeconds + wrongPenalty,
            }
            saveSession(storedRef.current)
          }
        }
      } catch (e: unknown) {
        setLastResult({
          passed: false,
          hint: e instanceof Error ? e.message : 'Gagal terhubung ke server',
        })
      } finally {
        setLoading(false)
      }
    },
    [session, questions, qIndex, handleFinish]
  )

  // ── Hint handlers ─────────────────────────────────────────────
  const handleHintClick = () => {
    if (skipHintConfirm) {
      applyHintPenalty()
    } else {
      setShowHintModal(true)
    }
  }

  const handleHintConfirm = (dontShowAgain: boolean) => {
    if (dontShowAgain) setSkipHintConfirm(true)
    setShowHintModal(false)
    applyHintPenalty()
  }

  const applyHintPenalty = () => {
    if (!chapter) return
    const penalty = chapter.hint_penalty_seconds
    timer.penalise(penalty)
    setShowHintText(true)

    // Update penalisedSeconds di localStorage
    if (storedRef.current) {
      storedRef.current = {
        ...storedRef.current,
        penalisedSeconds: storedRef.current.penalisedSeconds + penalty,
      }
      saveSession(storedRef.current)
    }
  }

  // ── Loading / error states ────────────────────────────────────
  if (!chapter) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070d0e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            color: 'var(--ws-gray)',
            fontSize: '0.9rem',
          }}
        >
          Chapter tidak ditemukan.
        </p>
        <Link
          href="/game/chapters"
          style={{
            fontFamily: 'var(--font-barlow)',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--ws-red)',
            textDecoration: 'none',
          }}
        >
          ← Kembali
        </Link>
      </div>
    )
  }

  if (authLoading || pageState === 'init') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070d0e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{
              width: 32,
              height: 32,
              border: `2px solid ${chapter.color}30`,
              borderTopColor: chapter.color,
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: '0.62rem',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--ws-gray)',
            }}
          >
            Memuat soal...
          </p>
        </div>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070d0e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-barlow)',
            fontWeight: 900,
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            color: 'var(--ws-red)',
          }}
        >
          Gagal Memuat
        </p>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            color: 'var(--ws-gray)',
            fontSize: '0.85rem',
          }}
        >
          Periksa koneksi internet kamu dan coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'var(--ws-red)',
            border: 'none',
            borderRadius: 4,
            padding: '10px 24px',
            color: 'white',
            fontFamily: 'var(--font-barlow)',
            fontWeight: 700,
            fontSize: '0.72rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const question = questions[qIndex]
  const color = chapter.color

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070d0e',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Correct flash overlay ── */}
      <AnimatePresence>
        {flashColor && <CorrectFlash color={flashColor} />}
      </AnimatePresence>

      {/* ── Hint penalty modal ── */}
      <AnimatePresence>
        {showHintModal && chapter && (
          <HintPenaltyModal
            penaltySeconds={chapter.hint_penalty_seconds}
            onConfirm={handleHintConfirm}
            onCancel={() => setShowHintModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Background: foto chapter, sangat gelap ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={chapter.bg_image}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(60%) brightness(0.1) contrast(1.2)',
          }}
        />
        {/* Radial glow dari chapter color */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 55% 40% at 50% 100%, ${color}12 0%, transparent 60%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7,13,14,0.88)',
          }}
        />
      </div>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(221,219,216,0.06)',
          background: 'rgba(7,13,14,0.92)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: '0 48px',
            height: 72,
          }}
        >
          {/* LEFT: chapter info + LIVE badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 16,
              paddingRight: 36,
            }}
          >
            {/* Chapter name */}
            <div style={{ textAlign: 'right' }}>
              <p
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: color,
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {chapter.title}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.6rem',
                  color: 'rgba(221,219,216,0.3)',
                  letterSpacing: '0.05em',
                }}
              >
                {chapter.city}
              </p>
            </div>

            {/* LIVE dot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: `${color}12`,
                border: `1px solid ${color}30`,
                borderRadius: 20,
                padding: '4px 10px',
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  display: 'block',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: color,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 700,
                  fontSize: '0.55rem',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color,
                }}
              >
                LIVE
              </span>
            </div>
          </div>

          {/* CENTER: Logo */}
          <Link href="/game" style={{ flexShrink: 0, display: 'block' }}>
            <div style={{ width: 160, height: 64 }}>
              <img
                src="/assets/logo-white.png"
                alt="Wondershock Theatre"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </Link>

          {/* RIGHT: timer + user */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 36,
              gap: 20,
            }}
          >
            {/* Global Chapter Timer — pindah ke navbar saat quiz */}
            <GameTimer
              display={timer.display}
              pct={timer.pct}
              urgent={timer.urgent}
              warning={timer.warning}
              expired={timer.expired}
              totalSeconds={chapter.timer_seconds}
            />

            <div style={{ flex: 1 }} />

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 900,
                    fontSize: '0.65rem',
                    color: 'white',
                    flexShrink: 0,
                    transition: 'background 0.5s',
                  }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.75rem',
                    color: 'rgba(221,219,216,0.5)',
                  }}
                >
                  {user?.name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '88px max(5%, 24px) 48px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 680,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* ── Progress bar soal ── */}
          <div style={{ width: '100%', marginBottom: 40 }}>
            {/* Counter row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    color: color,
                    lineHeight: 1,
                    transition: 'color 0.3s',
                  }}
                >
                  {qIndex + 1}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-barlow)',
                    fontSize: '0.85rem',
                    color: 'rgba(221,219,216,0.2)',
                  }}
                >
                  / {questions.length}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.62rem',
                    color: 'rgba(221,219,216,0.25)',
                    letterSpacing: '0.1em',
                    marginLeft: 4,
                  }}
                >
                  soal
                </span>
              </div>

              {/* Soal selesai indicators */}
              <div style={{ display: 'flex', gap: 4 }}>
                {questions.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i < qIndex ? 16 : 6,
                      height: 4,
                      borderRadius: 2,
                      background:
                        i < qIndex
                          ? color
                          : i === qIndex
                          ? `${color}60`
                          : 'rgba(255,255,255,0.08)',
                      transition: 'all 0.4s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: 2,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{
                  width: `${((qIndex) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: '100%',
                  background: `linear-gradient(to right, ${color}80, ${color})`,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          {/* ── Question card ── */}
          <QuestionCard
            question={question}
            index={qIndex}
            total={questions.length}
            chapter={chapter}
            isUrgent={timer.urgent}
          />

          {/* ── Answer Input ── */}
          <motion.div
            key={`answer-${qIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            style={{ width: '100%' }}
          >
            <AnswerInput
              question={question}
              onSubmit={handleSubmit}
              loading={loading}
              lastResult={lastResult}
            />
          </motion.div>

          {/* ── Hint ── */}
          {question.hint && (
            <motion.div
              key={`hint-${qIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ marginTop: 20, width: '100%', maxWidth: 560 }}
            >
              {!showHintText ? (
                <button
                  onClick={handleHintClick}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(246,188,5,0.2)',
                    borderRadius: 20,
                    padding: '7px 20px',
                    color: 'rgba(246,188,5,0.55)',
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 700,
                    fontSize: '0.62rem',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.borderColor =
                      'rgba(246,188,5,0.5)'
                    ;(e.currentTarget as HTMLElement).style.color = '#f6bc05'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.borderColor =
                      'rgba(246,188,5,0.2)'
                    ;(e.currentTarget as HTMLElement).style.color =
                      'rgba(246,188,5,0.55)'
                  }}
                >
                  <span>💡</span>
                  <span>Tampilkan Hint</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontWeight: 400,
                      fontSize: '0.58rem',
                      color: 'rgba(246,188,5,0.35)',
                      letterSpacing: '0.05em',
                      textTransform: 'none',
                    }}
                  >
                    (−{Math.floor(chapter.hint_penalty_seconds / 60)} mnt)
                  </span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(246,188,5,0.05)',
                      borderLeft: '3px solid rgba(246,188,5,0.45)',
                      borderRadius: '0 6px 6px 0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: '0.7rem' }}>💡</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-barlow)',
                          fontWeight: 700,
                          fontSize: '0.55rem',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          color: 'rgba(246,188,5,0.5)',
                        }}
                      >
                        Hint
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.7,
                      }}
                    >
                      {question.hint}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Timer urgent overlay saat ≤5 menit ── */}
      <AnimatePresence>
        {timer.urgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(ellipse 100% 50% at 50% 100%, rgba(236,43,37,0.08) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}