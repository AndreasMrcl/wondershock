'use client'
// app/game/page.tsx

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { questionsApi, sessionsApi, answersApi, tokenHelper } from '@/lib/gameApi'
import type { Question, Session } from '@/lib/gameApi'
import { useAuth } from '@/lib/authContext'
import { useGameTimer } from '@/hooks/useGameTimer'
import GameTimer from '@/components/game/GameTimer'
import AnswerInput from '@/components/game/AnswerInput'

type Phase = 'loading' | 'briefing' | 'quiz' | 'done'

// ── BRIEFING ──────────────────────────────────────────────────────
function BriefingScreen({ userName, questionCount, onStart }: {
  userName: string; questionCount: number; onStart: () => void
}) {
  const rules = [
    { icon: '⏱', label: 'Timer per soal', desc: 'Mulai saat soal tampil' },
    { icon: '✏', label: 'Teks / Foto / Video', desc: 'Sesuai format soal' },
    { icon: '❌', label: 'Salah = −30 detik', desc: 'Coba ulang sampai benar' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}
      style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '1.5px solid rgba(236,43,37,0.5)',
          boxShadow: '0 0 32px rgba(236,43,37,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px', fontSize: '2rem',
          background: 'rgba(236,43,37,0.06)',
        }}
      >🎭</motion.div>

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
          letterSpacing: '0.35em', textTransform: 'uppercase',
          color: 'var(--ws-red)', marginBottom: 14,
        }}
      >City Hunt Quiz</motion.p>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
          textTransform: 'uppercase', lineHeight: 0.92,
          color: 'var(--ws-cream)', marginBottom: 24,
        }}
      >
        SIAP,<br />
        <span style={{ color: 'var(--ws-red)' }}>{userName.split(' ')[0].toUpperCase()}?</span>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
        style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem',
          color: 'var(--ws-gray)', lineHeight: 1.8, marginBottom: 40,
        }}
      >
        <span style={{ color: 'var(--ws-sand)', fontWeight: 600 }}>{questionCount} soal</span> menunggumu di luar sana.
        Jawab dengan teks, foto, atau video.<br />
        Kamu harus menjawab benar sebelum lanjut ke soal berikutnya.
      </motion.p>

      {/* Rules */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 44 }}
      >
        {rules.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.48 + i * 0.07 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '18px 12px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{item.icon}</div>
            <p style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.68rem', letterSpacing: '1.5px',
              color: 'var(--ws-cream)', textTransform: 'uppercase', marginBottom: 5,
            }}>{item.label}</p>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem',
              color: 'var(--ws-gray)', lineHeight: 1.5,
            }}>{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(236,43,37,0.35)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '16px 56px',
            background: 'var(--ws-red)', border: 'none', borderRadius: 5,
            color: 'white', fontFamily: 'var(--font-barlow)',
            fontWeight: 700, fontSize: '0.9rem', letterSpacing: '3px',
            textTransform: 'uppercase', cursor: 'pointer',
            transition: 'box-shadow 0.3s',
          }}
        >MULAI HUNT →</motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── DONE ──────────────────────────────────────────────────────────
function DoneScreen({ userName, total }: { userName: string; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', maxWidth: 520, width: '100%' }}
    >
      {/* Trophy */}
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.1, 1] }}
        transition={{ delay: 0.3, duration: 1 }}
        style={{ fontSize: '4rem', marginBottom: 28, display: 'block' }}
      >🏆</motion.div>

      {/* Confetti dots */}
      <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[...Array(12)].map((_, i) => (
          <motion.div key={i}
            initial={{ y: '110%', x: `${8 + i * 7.5}%`, opacity: 1 }}
            animate={{ y: '-20%', opacity: [1, 1, 0] }}
            transition={{ delay: 0.2 + i * 0.06, duration: 1.6, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: 0,
              width: i % 3 === 0 ? 8 : 5, height: i % 3 === 0 ? 8 : 5,
              borderRadius: i % 2 === 0 ? '50%' : 2,
              background: i % 3 === 0 ? 'var(--ws-red)' : i % 3 === 1 ? 'var(--ws-gold)' : 'var(--ws-sand)',
            }}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
          letterSpacing: '0.35em', textTransform: 'uppercase',
          color: 'var(--ws-red)', marginBottom: 14,
        }}
      >Hunt Selesai!</motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
        style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
          textTransform: 'uppercase', lineHeight: 0.92,
          color: 'var(--ws-cream)', marginBottom: 20,
        }}
      >
        LUAR BIASA,<br />
        <span style={{ color: 'var(--ws-red)' }}>{userName.split(' ')[0].toUpperCase()}!</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }}
        style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem',
          color: 'var(--ws-gray)', lineHeight: 1.8, marginBottom: 16,
        }}
      >
        Kamu telah menyelesaikan semua{' '}
        <span style={{ color: 'var(--ws-sand)', fontWeight: 600 }}>{total} soal</span>.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.52 }}
        style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
          color: 'rgba(221,219,216,0.4)', lineHeight: 1.7, marginBottom: 44,
        }}
      >
        Terima kasih sudah ikut City Hunt<br />bersama Wondershock Theatre!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '13px 28px',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'var(--ws-cream)', borderRadius: 4,
          fontFamily: 'var(--font-barlow)', fontWeight: 700,
          fontSize: '0.72rem', letterSpacing: '2px',
          textTransform: 'uppercase', textDecoration: 'none',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ws-red)'; (e.currentTarget as HTMLElement).style.color = 'var(--ws-red)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)' }}
        >← Beranda</Link>

        <Link href="/events" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '13px 28px',
          background: 'var(--ws-red)', border: '1px solid var(--ws-red)',
          color: 'white', borderRadius: 4,
          fontFamily: 'var(--font-barlow)', fontWeight: 700,
          fontSize: '0.72rem', letterSpacing: '2px',
          textTransform: 'uppercase', textDecoration: 'none',
        }}>Lihat Acara →</Link>
      </motion.div>
    </motion.div>
  )
}

// ── QUIZ ──────────────────────────────────────────────────────────
function QuizScreen({ questions, session, onDone }: {
  questions: Question[]; session: Session; onDone: () => void
}) {
  const [qIndex, setQIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [lastResult, setLastResult] = useState<{ passed: boolean; hint?: string } | null>(null)
  const [passedCorrect, setPassedCorrect] = useState(false)
  const question = questions[qIndex]
  const timer = useGameTimer(question.timer_seconds)

  useEffect(() => {
    timer.reset(question.timer_seconds)
    setLastResult(null); setShowHint(false); setPassedCorrect(false)
    const t = setTimeout(() => timer.start(), 300)
    return () => clearTimeout(t)
  }, [qIndex]) // eslint-disable-line

  useEffect(() => {
    if (timer.expired && !passedCorrect) setTimeout(advanceQuestion, 1200)
  }, [timer.expired]) // eslint-disable-line

  const advanceQuestion = () => {
    if (qIndex + 1 >= questions.length) { sessionsApi.finish(session.id).catch(() => {}); onDone() }
    else setQIndex(i => i + 1)
  }

  const handleSubmit = useCallback(async (type: 'text' | 'photo' | 'video', value: string | File) => {
    setLoading(true)
    try {
      const result = type === 'text'
        ? await answersApi.submitText(session.id, question.id, value as string)
        : await answersApi.submitFile(session.id, question.id, type, value as File)
      setLastResult({ passed: result.passed, hint: result.hint })
      if (result.passed) { setPassedCorrect(true); timer.pause(); setTimeout(advanceQuestion, 1400) }
      else if (result.penalty_seconds) timer.penalise(result.penalty_seconds)
    } catch (e: unknown) {
      setLastResult({ passed: false, hint: e instanceof Error ? e.message : 'Gagal terhubung ke server' })
    } finally { setLoading(false) }
  }, [question, session, timer, qIndex, questions.length]) // eslint-disable-line

  const answerTypeLabel = {
    any: 'Teks / Foto / Video',
    text: 'Tulisan',
    photo: 'Foto',
    video: 'Video',
  }[question.answer_type] ?? 'Teks / Foto / Video'

  return (
    <div style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Top bar: soal progress + timer */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-barlow)', fontSize: '0.62rem',
            letterSpacing: '2px', color: 'var(--ws-gray)',
            textTransform: 'uppercase',
          }}>
            Soal
          </span>
          <span style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: '1rem', color: 'var(--ws-cream)',
          }}>{qIndex + 1}</span>
          <span style={{
            fontFamily: 'var(--font-barlow)', fontSize: '0.62rem',
            color: 'rgba(221,219,216,0.25)',
          }}>/ {questions.length}</span>
        </div>
        <GameTimer display={timer.display} pct={timer.pct} urgent={timer.urgent} expired={timer.expired} />
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', height: 2,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 2, marginBottom: 40, overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: 'var(--ws-red)', borderRadius: 2 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', textAlign: 'center', marginBottom: 40 }}
        >
          {/* Location badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            marginBottom: 24,
            padding: '6px 14px',
            background: 'rgba(246,188,5,0.08)',
            border: '1px solid rgba(246,188,5,0.2)',
            borderRadius: 20,
          }}>
            <span style={{ fontSize: '0.75rem' }}>📍</span>
            <span style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.62rem', letterSpacing: '2px',
              textTransform: 'uppercase', color: 'var(--ws-gold)',
            }}>{question.location_name}</span>
          </div>

          {/* Question text */}
          <h2 style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(1.7rem, 4.5vw, 3rem)',
            textTransform: 'uppercase', lineHeight: 1.05,
            color: passedCorrect ? '#4ade80' : timer.urgent ? 'var(--ws-red)' : 'var(--ws-cream)',
            marginBottom: 14, transition: 'color 0.4s',
          }}>
            {passedCorrect ? '✓ BENAR!' : question.question_text}
          </h2>

          {/* Format label */}
          {!passedCorrect && (
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
              color: 'rgba(221,219,216,0.4)',
            }}>
              Format jawaban:{' '}
              <span style={{ color: 'var(--ws-sand)' }}>{answerTypeLabel}</span>
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Answer input + hint */}
      <AnimatePresence>
        {!passedCorrect && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <AnswerInput question={question} onSubmit={handleSubmit} loading={loading} lastResult={lastResult} />

            {/* Hint */}
            {question.hint && (
              <div style={{ marginTop: 20, width: '100%', maxWidth: 560 }}>
                <button
                  onClick={() => setShowHint(s => !s)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(246,188,5,0.25)',
                    borderRadius: 20, padding: '7px 20px',
                    color: 'rgba(246,188,5,0.6)',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.62rem', letterSpacing: '1.5px',
                    textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ws-gold)'; (e.currentTarget as HTMLElement).style.color = 'var(--ws-gold)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(246,188,5,0.25)'; (e.currentTarget as HTMLElement).style.color = 'rgba(246,188,5,0.6)' }}
                >
                  💡 {showHint ? 'Sembunyikan' : 'Tampilkan'} Hint
                </button>

                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 10, overflow: 'hidden' }}
                    >
                      <div style={{
                        padding: '14px 18px',
                        background: 'rgba(246,188,5,0.06)',
                        borderLeft: '3px solid rgba(246,188,5,0.5)',
                        borderRadius: '0 6px 6px 0',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '0.83rem',
                          color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
                        }}>{question.hint}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function GamePage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [phase, setPhase] = useState<Phase>('loading')
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login?from=/game'); return }
    questionsApi.list()
      .then(r => { setQuestions(r.questions); setPhase('briefing') })
      .catch(() => { setPhase('briefing') })
  }, [user, authLoading]) // eslint-disable-line

  const handleStart = async () => {
    try {
      const res = await sessionsApi.start()
      setSession(res.session); setPhase('quiz')
    } catch { alert('Gagal memulai sesi. Coba refresh halaman.') }
  }

  const handleLogout = () => { logout(); router.push('/') }

  if (authLoading || (phase === 'loading' && user)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ws-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--ws-red)', borderRadius: '50%' }}
        />
      </div>
    )
  }

  return (
    <div className="game-page" style={{ minHeight: '100vh', background: '#070d0e', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient red glow top */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(236,43,37,0.14) 0%, transparent 65%)',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid rgba(221,219,216,0.06)',
        background: 'rgba(7,13,14,0.92)', backdropFilter: 'blur(14px)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 48px',
          height: 80,
        }}>

          {/* KIRI: Chapters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 32, paddingRight: 36 }}>
            <Link href="/game/chapters" style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.72rem', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--ws-sand)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-sand)'}
            >Chapters</Link>

            {/* Live badge — only during quiz */}
            {phase === 'quiz' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(236,43,37,0.1)',
                  border: '1px solid rgba(236,43,37,0.25)',
                  borderRadius: 20, padding: '4px 12px',
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: 'var(--ws-red)' }}
                />
                <span style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.58rem', letterSpacing: '2px',
                  textTransform: 'uppercase', color: 'var(--ws-red)',
                }}>LIVE</span>
              </motion.div>
            )}
          </div>

          {/* TENGAH: Logo */}
          <Link href="/" style={{ flexShrink: 0, display: 'block' }}>
            <div style={{ position: 'relative', width: 180, height: 72 }}>
              <img
                src="/assets/logo-white.png"
                alt="Wondershock Theatre"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </Link>

          {/* KANAN: Rewards + user + keluar */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 36, gap: 24 }}>
            <Link href="/game/rewards" style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.72rem', letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--ws-gold)',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.75'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <span style={{ fontSize: '0.85rem' }}>🏆</span> Rewards
            </Link>

            <div style={{ flex: 1 }} />

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--ws-red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-barlow)', fontWeight: 900,
                  fontSize: '0.65rem', color: 'white', flexShrink: 0,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
                  color: 'rgba(221,219,216,0.55)',
                }}>{user.name.split(' ')[0]}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4, padding: '6px 14px',
                color: 'rgba(221,219,216,0.4)',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.6rem', letterSpacing: '1.5px',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(236,43,37,0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--ws-red)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(221,219,216,0.4)' }}
            >Keluar</button>
          </div>

        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px max(5%, 24px) 60px',
        position: 'relative', zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          {phase === 'briefing' && user && (
            <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BriefingScreen userName={user.name} questionCount={questions.length} onStart={handleStart} />
            </motion.div>
          )}
          {phase === 'quiz' && session && questions.length > 0 && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <QuizScreen questions={questions} session={session} onDone={() => setPhase('done')} />
            </motion.div>
          )}
          {phase === 'done' && user && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DoneScreen userName={user.name} total={questions.length} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}