'use client'
// app/game/page.tsx — updated: auth diambil dari AuthContext, bukan form sendiri

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
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      style={{ maxWidth: 580, width: '100%', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--ws-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '1.8rem' }}>
        🎭
      </motion.div>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--ws-red)', marginBottom: 12 }}>
        CITY HUNT QUIZ
      </motion.p>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', textTransform: 'uppercase', lineHeight: 0.95, color: 'var(--ws-cream)', marginBottom: 20 }}>
        SIAP,<br /><span style={{ color: 'var(--ws-red)' }}>{userName.split(' ')[0].toUpperCase()}?</span>
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
        style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--ws-gray)', lineHeight: 1.7, marginBottom: 36 }}>
        {questionCount} soal menunggumu di luar sana.<br />
        Jawab dengan teks, foto, atau video.<br />
        Kamu harus menjawab benar sebelum lanjut. Jawaban salah mengurangi timer.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
        {[
          { icon: '⏱', label: 'Timer per soal', desc: 'Mulai saat soal tampil' },
          { icon: '✏', label: 'Teks / Foto / Video', desc: 'Sesuai format soal' },
          { icon: '❌', label: 'Salah = -30 detik', desc: 'Coba ulang sampai benar' },
        ].map(item => (
          <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{item.icon}</div>
            <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--ws-cream)', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)' }}>{item.desc}</p>
          </div>
        ))}
      </motion.div>
      <motion.button onClick={onStart} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        style={{ padding: '16px 48px', background: 'var(--ws-red)', border: 'none', borderRadius: 5, color: 'white', fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', cursor: 'pointer' }}>
        MULAI HUNT →
      </motion.button>
    </motion.div>
  )
}

// ── DONE ──────────────────────────────────────────────────────────
function DoneScreen({ userName, total }: { userName: string; total: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
      <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ delay: 0.4, duration: 0.8 }}
        style={{ fontSize: '4rem', marginBottom: 24 }}>🎉</motion.div>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--ws-red)', marginBottom: 12 }}>SELESAI!</p>
      <h2 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4rem)', textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 16 }}>
        LUAR BIASA,<br /><span style={{ color: 'var(--ws-red)' }}>{userName.split(' ')[0].toUpperCase()}!</span>
      </h2>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--ws-gray)', lineHeight: 1.7, marginBottom: 40 }}>
        Kamu telah menyelesaikan semua {total} soal.<br />
        Terima kasih sudah ikut City Hunt bersama Wondershock Theatre!
      </p>
      <Link href="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 32px',
        border: '1px solid rgba(255,255,255,0.15)', color: 'var(--ws-cream)',
        fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.75rem',
        letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ws-red)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      >← Kembali ke Beranda</Link>
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

  return (
    <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--ws-gray)', textTransform: 'uppercase' }}>
          SOAL {qIndex + 1} / {questions.length}
        </span>
        <GameTimer display={timer.display} pct={timer.pct} urgent={timer.urgent} expired={timer.expired} />
      </div>
      <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
        <motion.div animate={{ width: `${(qIndex / questions.length) * 100}%` }} transition={{ duration: 0.5 }}
          style={{ height: '100%', background: 'var(--ws-red)', borderRadius: 2 }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={question.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ws-gold)', display: 'block' }} />
            <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--ws-gold)' }}>
              📍 {question.location_name}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', textTransform: 'uppercase', lineHeight: 1.1, color: passedCorrect ? '#4ade80' : timer.urgent ? 'var(--ws-red)' : 'var(--ws-cream)', marginBottom: 12, transition: 'color 0.3s' }}>
            {passedCorrect ? '✓ BENAR!' : question.question_text}
          </h2>
          {!passedCorrect && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-gray)' }}>
              Format: <span style={{ color: 'var(--ws-cream)' }}>
                {question.answer_type === 'any' ? 'Teks / Foto / Video' : question.answer_type === 'text' ? 'Tulisan' : question.answer_type === 'photo' ? 'Foto' : 'Video'}
              </span>
            </p>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {!passedCorrect && (
          <motion.div key="answer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnswerInput question={question} onSubmit={handleSubmit} loading={loading} lastResult={lastResult} />
            {question.hint && (
              <div style={{ marginTop: 16 }}>
                <button onClick={() => setShowHint(s => !s)}
                  style={{ background: 'transparent', border: '1px solid rgba(246,188,5,0.3)', borderRadius: 20, padding: '7px 18px', color: 'rgba(246,188,5,0.7)', fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--ws-gold)'; (e.currentTarget).style.color = 'var(--ws-gold)' }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(246,188,5,0.3)'; (e.currentTarget).style.color = 'rgba(246,188,5,0.7)' }}>
                  💡 {showHint ? 'Sembunyikan' : 'Tampilkan'} Hint
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 10, padding: '12px 16px', background: 'rgba(246,188,5,0.07)', borderLeft: '3px solid var(--ws-gold)', borderRadius: '0 4px 4px 0', maxWidth: 600 }}>
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{question.hint}</p>
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
    // Belum login → redirect ke /login?from=/game
    if (!user) { router.replace('/login?from=/game'); return }
    // Sudah login → load soal
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
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--ws-red)', borderRadius: '50%' }} />
      </div>
    )
  }

  return (
    <div className="game-page" style={{ minHeight: '100vh', background: '#0a0f10', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle red glow top */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(236,43,37,0.12) 0%, transparent 65%)' }} />

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px max(5%, 32px)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(7,13,14,0.85)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1rem', letterSpacing: '4px', color: 'var(--ws-cream)' }}>WONDER</span>
          <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1rem', letterSpacing: '4px', color: 'var(--ws-red)' }}>SHOCK</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {phase === 'quiz' && (
            <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--ws-gray)', textTransform: 'uppercase', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '4px 10px', borderRadius: 3 }}>
              LIVE <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--ws-red)', marginLeft: 6, verticalAlign: 'middle' }} />
            </span>
          )}
          {user && (
            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--ws-gray)' }}>{user.name}</span>
          )}
          <button onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3, padding: '5px 12px', color: 'var(--ws-gray)', fontFamily: 'var(--font-barlow)', fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--ws-red)'; (e.currentTarget).style.color = 'var(--ws-red)' }}
            onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget).style.color = 'var(--ws-gray)' }}>
            Keluar
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'max(100px, 12vh) max(5%, 24px) 60px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {phase === 'briefing' && user && (
            <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BriefingScreen userName={user.name} questionCount={questions.length} onStart={handleStart} />
            </motion.div>
          )}
          {phase === 'quiz' && session && questions.length > 0 && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
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