'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { authApi, questionsApi, sessionsApi, answersApi, tokenHelper } from '@/lib/gameApi'
import type { User, Question, Session } from '@/lib/gameApi'
import { useGameTimer } from '@/hooks/useGameTimer'
import GameTimer from '@/components/game/GameTimer'
import AnswerInput from '@/components/game/AnswerInput'

type Phase = 'loading' | 'auth' | 'briefing' | 'quiz' | 'done'

// ── AUTH FORM ────────────────────────────────────────────────────
function AuthForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const res = mode === 'register'
        ? await authApi.register(name, email, password)
        : await authApi.login(email, password)
      tokenHelper.save(res.token)
      tokenHelper.saveUser(res.user)
      onSuccess(res.user)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally { setLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10, padding: '40px 36px',
      }}
    >
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['register', 'login'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError('') }}
            style={{
              flex: 1, padding: '10px 0',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${mode === m ? 'var(--ws-red)' : 'transparent'}`,
              color: mode === m ? 'var(--ws-cream)' : 'var(--ws-gray)',
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '2px',
              textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: -1,
            }}
          >
            {m === 'register' ? 'Daftar' : 'Masuk'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'register' && (
          <motion.div key="name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <label style={labelStyle}>Nama</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkapmu"
              style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@kamu.com"
          type="email" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
          type="password" style={inputStyle} onFocus={focusInput} onBlur={blurInput}
          onKeyDown={e => e.key === 'Enter' && submit()} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--ws-red)', marginBottom: 14 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button onClick={submit} disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
        style={{
          width: '100%', padding: '14px',
          background: 'var(--ws-red)', border: 'none', borderRadius: 5,
          color: 'white', fontFamily: 'var(--font-barlow)', fontWeight: 700,
          fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}>
        {loading ? 'Memproses...' : mode === 'register' ? 'Mulai Petualangan →' : 'Masuk →'}
      </motion.button>
    </motion.div>
  )
}

// ── BRIEFING SCREEN ──────────────────────────────────────────────
function BriefingScreen({ user, questionCount, onStart }: {
  user: User; questionCount: number; onStart: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: 580, width: '100%', textAlign: 'center' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 72, height: 72, borderRadius: '50%',
          border: '2px solid var(--ws-red)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: '1.8rem',
        }}
      >🎭</motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--ws-red)', marginBottom: 12 }}
      >CITY HUNT QUIZ</motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          textTransform: 'uppercase', lineHeight: 0.95,
          color: 'var(--ws-cream)', marginBottom: 20,
        }}
      >
        SIAP,<br /><span style={{ color: 'var(--ws-red)' }}>{user.name.split(' ')[0].toUpperCase()}?</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--ws-gray)', lineHeight: 1.7, marginBottom: 36 }}
      >
        {questionCount} soal menunggumu di luar sana.<br />
        Jawab dengan teks, foto, atau video. Kamu harus menjawab benar sebelum lanjut.<br />
        Jawaban salah akan mengurangi timermu.
      </motion.p>

      {/* Rules */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12, marginBottom: 40,
        }}
      >
        {[
          { icon: '⏱', label: 'Timer per soal', desc: 'Mulai saat soal tampil' },
          { icon: '✏', label: 'Teks / Foto / Video', desc: 'Sesuai format soal' },
          { icon: '❌', label: 'Salah = -30 detik', desc: 'Coba ulang sampai benar' },
        ].map(item => (
          <div key={item.label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '16px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{item.icon}</div>
            <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--ws-cream)', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)' }}>{item.desc}</p>
          </div>
        ))}
      </motion.div>

      <motion.button
        onClick={onStart}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.03, letterSpacing: '3.5px' }}
        whileTap={{ scale: 0.97 }}
        style={{
          padding: '16px 48px',
          background: 'var(--ws-red)', border: 'none', borderRadius: 5,
          color: 'white', fontFamily: 'var(--font-barlow)',
          fontWeight: 700, fontSize: '0.9rem', letterSpacing: '3px',
          textTransform: 'uppercase', cursor: 'pointer',
          transition: 'letter-spacing 0.3s',
        }}
      >
        MULAI HUNT →
      </motion.button>
    </motion.div>
  )
}

// ── DONE SCREEN ──────────────────────────────────────────────────
function DoneScreen({ user, total }: { user: User; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
        transition={{ delay: 0.4, duration: 0.8 }}
        style={{ fontSize: '4rem', marginBottom: 24 }}
      >🎉</motion.div>

      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--ws-red)', marginBottom: 12 }}>
        SELESAI!
      </p>
      <h2 style={{
        fontFamily: 'var(--font-barlow)', fontWeight: 900,
        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
        textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 16,
      }}>
        LUAR BIASA,<br />
        <span style={{ color: 'var(--ws-red)' }}>{user.name.split(' ')[0].toUpperCase()}!</span>
      </h2>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem', color: 'var(--ws-gray)', lineHeight: 1.7, marginBottom: 40 }}>
        Kamu telah menyelesaikan semua {total} soal.<br />
        Terima kasih sudah ikut City Hunt bersama Wondershock Theatre!
      </p>

      <Link href="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '13px 32px',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'var(--ws-cream)',
          fontFamily: 'var(--font-barlow)', fontWeight: 700,
          fontSize: '0.75rem', letterSpacing: '2px',
          textTransform: 'uppercase', textDecoration: 'none',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--ws-red)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      >
        ← Kembali ke Beranda
      </Link>
    </motion.div>
  )
}

// ── QUIZ SCREEN ──────────────────────────────────────────────────
function QuizScreen({
  questions, session, onDone,
}: {
  questions: Question[]; session: Session; onDone: () => void
}) {
  const [qIndex, setQIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [lastResult, setLastResult] = useState<{ passed: boolean; hint?: string } | null>(null)
  const [passedCorrect, setPassedCorrect] = useState(false)
  const question = questions[qIndex]

  const timer = useGameTimer(question.timer_seconds)

  // Start timer when question changes
  useEffect(() => {
    timer.reset(question.timer_seconds)
    setLastResult(null)
    setShowHint(false)
    setPassedCorrect(false)
    const t = setTimeout(() => timer.start(), 300)
    return () => clearTimeout(t)
  }, [qIndex]) // eslint-disable-line

  // Auto-advance when timer expires
  useEffect(() => {
    if (timer.expired && !passedCorrect) {
      setTimeout(() => advanceQuestion(), 1200)
    }
  }, [timer.expired]) // eslint-disable-line

  const advanceQuestion = () => {
    if (qIndex + 1 >= questions.length) {
      sessionsApi.finish(session.id).catch(() => {})
      onDone()
    } else {
      setQIndex(i => i + 1)
    }
  }

  const handleSubmit = useCallback(async (type: 'text' | 'photo' | 'video', value: string | File) => {
    setLoading(true)
    try {
      const result = type === 'text'
        ? await answersApi.submitText(session.id, question.id, value as string)
        : await answersApi.submitFile(session.id, question.id, type, value as File)

      setLastResult({ passed: result.passed, hint: result.hint })

      if (result.passed) {
        setPassedCorrect(true)
        timer.pause()
        // Brief success moment, then advance
        setTimeout(advanceQuestion, 1400)
      } else if (result.penalty_seconds) {
        timer.penalise(result.penalty_seconds)
      }
    } catch (e: unknown) {
      setLastResult({ passed: false, hint: e instanceof Error ? e.message : 'Gagal terhubung ke server' })
    } finally {
      setLoading(false)
    }
  }, [question, session, timer, qIndex, questions.length]) // eslint-disable-line

  const pct = ((qIndex) / questions.length) * 100

  return (
    <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Progress + Timer row */}
      <div style={{
        width: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--ws-gray)', textTransform: 'uppercase' }}>
          SOAL {qIndex + 1} / {questions.length}
        </span>
        <GameTimer display={timer.display} pct={timer.pct} urgent={timer.urgent} expired={timer.expired} />
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%', background: 'var(--ws-red)', borderRadius: 2 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', textAlign: 'center', marginBottom: 36 }}
        >
          {/* Location tag */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ws-gold)', flexShrink: 0, display: 'block' }} />
            <span style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.65rem', letterSpacing: '2.5px',
              textTransform: 'uppercase', color: 'var(--ws-gold)',
            }}>📍 {question.location_name}</span>
          </div>

          {/* Question text */}
          <h2 style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
            textTransform: 'uppercase', lineHeight: 1.1,
            color: passedCorrect ? '#4ade80' : timer.urgent ? 'var(--ws-red)' : 'var(--ws-cream)',
            marginBottom: 12,
            transition: 'color 0.3s',
          }}>
            {passedCorrect ? '✓ BENAR!' : question.question_text}
          </h2>

          {!passedCorrect && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-gray)' }}>
              Format jawaban:{' '}
              <span style={{ color: 'var(--ws-cream)' }}>
                {question.answer_type === 'any' ? 'Teks / Foto / Video' : question.answer_type === 'text' ? 'Tulisan' : question.answer_type === 'photo' ? 'Foto' : 'Video'}
              </span>
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Answer input — hidden when correct */}
      <AnimatePresence>
        {!passedCorrect && (
          <motion.div
            key="answer-input"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <AnswerInput
              question={question}
              onSubmit={handleSubmit}
              loading={loading}
              lastResult={lastResult}
            />

            {/* Hint button */}
            {question.hint && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setShowHint(s => !s)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(246,188,5,0.3)',
                    borderRadius: 20, padding: '7px 18px',
                    color: 'rgba(246,188,5,0.7)',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.65rem', letterSpacing: '1.5px',
                    textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget).style.borderColor = 'var(--ws-gold)'
                    ;(e.currentTarget).style.color = 'var(--ws-gold)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget).style.borderColor = 'rgba(246,188,5,0.3)'
                    ;(e.currentTarget).style.color = 'rgba(246,188,5,0.7)'
                  }}
                >
                  💡 {showHint ? 'Sembunyikan' : 'Tampilkan'} Hint
                </button>

                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginTop: 10, padding: '12px 16px',
                        background: 'rgba(246,188,5,0.07)',
                        borderLeft: '3px solid var(--ws-gold)',
                        borderRadius: '0 4px 4px 0',
                        maxWidth: 600,
                      }}
                    >
                      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                        {question.hint}
                      </p>
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

// ── MAIN PAGE ────────────────────────────────────────────────────
export default function GamePage() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<Session | null>(null)

  // Restore session on load
  useEffect(() => {
    const savedUser = tokenHelper.getUser()
    if (savedUser) {
      setUser(savedUser)
      loadQuestions()
        .then(() => setPhase('briefing'))
        .catch(() => setPhase('auth'))
    } else {
      setPhase('auth')
    }
  }, []) // eslint-disable-line

  const loadQuestions = async () => {
    const res = await questionsApi.list()
    setQuestions(res.questions)
  }

  const handleAuthSuccess = async (u: User) => {
    setUser(u)
    await loadQuestions()
    setPhase('briefing')
  }

  const handleStartQuiz = async () => {
    try {
      const res = await sessionsApi.start()
      setSession(res.session)
      setPhase('quiz')
    } catch {
      alert('Gagal memulai sesi. Coba refresh halaman.')
    }
  }

  const handleLogout = () => {
    tokenHelper.clear(); tokenHelper.clearUser()
    setUser(null); setSession(null); setPhase('auth')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ws-dark)', position: 'relative', overflow: 'hidden' }}>

      {/* Grain overlay */}
      <div className="grain" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Ambient background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(236,43,37,0.07) 0%, transparent 70%)',
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px max(5%, 32px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(7,13,14,0.85)',
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '4px', color: 'var(--ws-cream)' }}>WONDER</span>
          <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '4px', color: 'var(--ws-red)', marginTop: -4 }}>SHOCK</span>
          <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 400, fontSize: '0.5rem', letterSpacing: '5px', color: 'rgba(221,219,216,0.4)', textTransform: 'uppercase' }}>THEATRE</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Phase indicator */}
          {phase === 'quiz' && session && (
            <span style={{
              fontFamily: 'var(--font-barlow)', fontSize: '0.6rem',
              letterSpacing: '2px', color: 'var(--ws-gray)',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '4px 10px', borderRadius: 3,
            }}>
              LIVE
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--ws-red)', marginLeft: 6, verticalAlign: 'middle', animation: 'pulse 1s infinite' }} />
            </span>
          )}
          {user && (
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3, padding: '5px 12px',
              color: 'var(--ws-gray)', fontFamily: 'var(--font-barlow)',
              fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--ws-red)'; (e.currentTarget).style.color = 'var(--ws-red)' }}
            onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget).style.color = 'var(--ws-gray)' }}
            >Keluar</button>
          )}
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(100px, 12vh) max(5%, 24px) 60px',
        position: 'relative', zIndex: 1,
      }}>
        <AnimatePresence mode="wait">

          {/* Loading */}
          {phase === 'loading' && (
            <motion.div key="loading" exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--ws-red)', borderRadius: '50%' }}
              />
              <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--ws-gray)', textTransform: 'uppercase' }}>Memuat...</span>
            </motion.div>
          )}

          {/* Auth */}
          {phase === 'auth' && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ textAlign: 'center', marginBottom: 32 }}
              >
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--ws-red)', marginBottom: 8 }}>
                  CITY HUNT QUIZ
                </p>
                <h1 style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 900,
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  textTransform: 'uppercase', color: 'var(--ws-cream)', lineHeight: 0.95,
                }}>
                  HUNT.<br />
                  <span style={{ color: 'var(--ws-red)' }}>EXPLORE.</span><br />
                  ANSWER.
                </h1>
              </motion.div>
              <AuthForm onSuccess={handleAuthSuccess} />
            </motion.div>
          )}

          {/* Briefing */}
          {phase === 'briefing' && user && (
            <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BriefingScreen user={user} questionCount={questions.length} onStart={handleStartQuiz} />
            </motion.div>
          )}

          {/* Quiz */}
          {phase === 'quiz' && session && questions.length > 0 && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <QuizScreen questions={questions} session={session} onDone={() => setPhase('done')} />
            </motion.div>
          )}

          {/* Done */}
          {phase === 'done' && user && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DoneScreen user={user} total={questions.length} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}

// ── Style helpers ─────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-barlow)',
  fontSize: '0.6rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 5,
  padding: '11px 14px',
  color: 'var(--ws-cream)',
  fontFamily: 'var(--font-dm-sans)',
  fontSize: '0.9rem',
  outline: 'none',
  marginBottom: 16,
  transition: 'border-color 0.2s',
}

const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--ws-red)'
}
const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
}
