'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { authApi, questionsApi, answersApi, sessionsApi, tokenHelper } from '@/lib/gameApi'
import type { User, Question, Answer, Session } from '@/lib/gameApi'

type AdminTab = 'questions' | 'answers' | 'sessions'

// ── LOGIN ─────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await authApi.adminLogin(email, password)
      tokenHelper.save(res.token)
      tokenHelper.saveUser(res.user)
      onSuccess(res.user)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login gagal')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ws-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '40px 32px' }}
      >
        <p style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.6rem', letterSpacing: '3px', color: 'var(--ws-red)', textTransform: 'uppercase', marginBottom: 8 }}>Admin Panel</p>
        <h1 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 28 }}>
          WONDERSHOCK<br /><span style={{ color: 'var(--ws-red)' }}>QUIZ</span>
        </h1>

        <label style={labelStyle}>Email Admin</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@wondershock.id" style={{ ...inputStyle, marginBottom: 14 }} onFocus={focusIn} onBlur={focusOut} />
        <label style={labelStyle}>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={{ ...inputStyle, marginBottom: 20 }} onFocus={focusIn} onBlur={focusOut} onKeyDown={e => e.key === 'Enter' && submit()} />

        {error && <p style={{ fontSize: '0.78rem', color: 'var(--ws-red)', fontFamily: 'var(--font-dm-sans)', marginBottom: 12 }}>{error}</p>}

        <button onClick={submit} disabled={loading} style={{ ...btnPrimary, width: '100%', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Memuat...' : 'Masuk →'}
        </button>
      </motion.div>
    </div>
  )
}

// ── QUESTION MODAL ────────────────────────────────────────────────
function QuestionModal({ question, onSave, onClose }: {
  question: Partial<Question> | null; onSave: (data: Partial<Question>) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Question>>(question || {
    question_text: '', location_name: '', answer_type: 'any',
    answer_key: '', similarity_threshold: 0.7, ai_confidence_threshold: 0.75,
    timer_seconds: 120, penalty_seconds: 30, hint: '', order_num: 0,
  })

  const update = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#141a1b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h3 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ws-cream)', marginBottom: 24 }}>
          {question?.id ? 'Edit Soal' : 'Tambah Soal Baru'}
        </h3>

        <label style={labelStyle}>Pertanyaan</label>
        <textarea value={form.question_text || ''} onChange={e => update('question_text', e.target.value)}
          placeholder="Tulis pertanyaanmu..." rows={3}
          style={{ ...inputStyle, resize: 'vertical', height: 80 }} onFocus={focusIn} onBlur={focusOut} />

        <label style={labelStyle}>Kunci Jawaban / Deskripsi untuk AI</label>
        <textarea value={form.answer_key || ''} onChange={e => update('answer_key', e.target.value)}
          placeholder="Apa yang harus terlihat di foto, atau kata kunci teks..." rows={2}
          style={{ ...inputStyle, resize: 'vertical', height: 64 }} onFocus={focusIn} onBlur={focusOut} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Lokasi</label>
            <input value={form.location_name || ''} onChange={e => update('location_name', e.target.value)}
              placeholder="cth: Kota Lama Semarang" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>Format Jawaban</label>
            <select value={form.answer_type || 'any'} onChange={e => update('answer_type', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' }}>
              <option value="any">Semua (Teks/Foto/Video)</option>
              <option value="text">Teks saja</option>
              <option value="photo">Foto saja</option>
              <option value="video">Video saja</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Timer (detik)</label>
            <input type="number" value={form.timer_seconds || 120} onChange={e => update('timer_seconds', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>Penalti salah (detik)</label>
            <input type="number" value={form.penalty_seconds || 30} onChange={e => update('penalty_seconds', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>Similarity Teks (0–1)</label>
            <input type="number" step="0.05" min="0" max="1" value={form.similarity_threshold || 0.7} onChange={e => update('similarity_threshold', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>AI Confidence (0–1)</label>
            <input type="number" step="0.05" min="0" max="1" value={form.ai_confidence_threshold || 0.75} onChange={e => update('ai_confidence_threshold', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>

        <label style={labelStyle}>Hint (opsional)</label>
        <textarea value={form.hint || ''} onChange={e => update('hint', e.target.value)}
          placeholder="Petunjuk yang bisa dilihat peserta..." rows={2}
          style={{ ...inputStyle, resize: 'vertical', height: 60 }} onFocus={focusIn} onBlur={focusOut} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={btnSecondary}>Batal</button>
          <button onClick={() => onSave(form)} style={btnPrimary}>Simpan Soal</button>
        </div>
      </motion.div>
    </div>
  )
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<AdminTab>('questions')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [sessions, setSessions] = useState<(Session & { user_name: string; passed_count: number })[]>([])
  const [modalQ, setModalQ] = useState<Partial<Question> | null | false>(false)
  const [loading, setLoading] = useState(false)
  const [notif, setNotif] = useState('')

  useEffect(() => {
    const saved = tokenHelper.getUser()
    if (saved?.role === 'admin') { setUser(saved); setAuthed(true) }
  }, [])

  useEffect(() => {
    if (!authed) return
    if (tab === 'questions') loadQuestions()
    if (tab === 'answers') loadAnswers()
    if (tab === 'sessions') loadSessions()
  }, [authed, tab]) // eslint-disable-line

  const loadQuestions = async () => {
    setLoading(true)
    try { const r = await questionsApi.listAdmin(); setQuestions(r.questions) } finally { setLoading(false) }
  }
  const loadAnswers = async () => {
    setLoading(true)
    try { const r = await answersApi.listAdmin(); setAnswers(r.answers) } finally { setLoading(false) }
  }
  const loadSessions = async () => {
    setLoading(true)
    try { const r = await sessionsApi.listAdmin(); setSessions(r.sessions) } finally { setLoading(false) }
  }

  const toast = (msg: string) => { setNotif(msg); setTimeout(() => setNotif(''), 2800) }

  const saveQuestion = async (data: Partial<Question>) => {
    try {
      if (data.id) await questionsApi.update(data.id, data)
      else await questionsApi.create(data)
      setModalQ(false); loadQuestions(); toast('✓ Soal tersimpan')
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Gagal menyimpan') }
  }

  const deleteQuestion = async (id: string) => {
    if (!confirm('Arsipkan soal ini?')) return
    await questionsApi.delete(id); loadQuestions(); toast('Soal diarsipkan')
  }

  if (!authed) return <AdminLogin onSuccess={u => { setUser(u); setAuthed(true) }} />

  const typeColor: Record<string, string> = { text: 'var(--ws-blue)', photo: 'var(--ws-gold)', video: '#a855f7', any: 'var(--ws-gray)' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f10' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,13,14,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 max(4%, 28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1rem', letterSpacing: '3px', color: 'var(--ws-cream)' }}>WS</span>
            <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1rem', letterSpacing: '3px', color: 'var(--ws-red)' }}>Q</span>
          </Link>
          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', display: 'block' }} />
          <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--ws-gray)', textTransform: 'uppercase' }}>Admin Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--ws-gray)' }}>{user?.name}</span>
          <button onClick={() => { tokenHelper.clear(); tokenHelper.clearUser(); setAuthed(false) }}
            style={{ ...btnSecondary, fontSize: '0.6rem', padding: '5px 12px' }}>Keluar</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 max(4%, 28px)', display: 'flex', gap: 0 }}>
        {(['questions', 'answers', 'sessions'] as AdminTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '14px 20px',
            background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === t ? 'var(--ws-red)' : 'transparent'}`,
            color: tab === t ? 'var(--ws-cream)' : 'var(--ws-gray)',
            fontFamily: 'var(--font-barlow)', fontWeight: 700,
            fontSize: '0.7rem', letterSpacing: '1.5px',
            textTransform: 'uppercase', cursor: 'pointer',
            marginBottom: -1, transition: 'color 0.2s',
          }}>
            {{ questions: '📋 Soal', answers: '📥 Jawaban', sessions: '👥 Peserta' }[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ padding: '28px max(4%, 28px)', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── QUESTIONS TAB ── */}
        {tab === 'questions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--ws-cream)', textTransform: 'uppercase' }}>
                {questions.length} <span style={{ color: 'var(--ws-red)' }}>Soal</span>
              </h2>
              <button onClick={() => setModalQ({})} style={btnPrimary}>+ Tambah Soal</button>
            </div>

            {loading ? <Spinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {questions.length === 0 && <EmptyState icon="📋" text="Belum ada soal. Tambahkan soal pertama!" />}
                {questions.map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${q.is_active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`, borderRadius: 8, padding: '18px 20px', display: 'flex', gap: 18, alignItems: 'flex-start', opacity: q.is_active ? 1 : 0.45 }}>
                    <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.8rem', color: 'rgba(255,255,255,0.08)', minWidth: 36, lineHeight: 1 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1rem', color: 'var(--ws-cream)', marginBottom: 8, lineHeight: 1.3 }}>{q.question_text}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <Tag label={`📍 ${q.location_name}`} color="var(--ws-gold)" />
                        <Tag label={q.answer_type === 'any' ? 'Semua format' : q.answer_type} color={typeColor[q.answer_type]} />
                        {q.timer_seconds > 0 && <Tag label={`⏱ ${q.timer_seconds}s`} color="var(--ws-red)" />}
                        <Tag label={`-${q.penalty_seconds}s penalti`} color="rgba(255,100,100,0.7)" />
                        {q.hint && <Tag label="💡 Ada hint" color="rgba(255,255,255,0.25)" />}
                      </div>
                      {q.answer_key && (
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: 6, fontStyle: 'italic' }}>
                          Kunci: &quot;{q.answer_key}&quot;
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setModalQ(q)} style={{ ...btnSecondary, fontSize: '0.6rem', padding: '5px 12px' }}>Edit</button>
                      <button onClick={() => deleteQuestion(q.id)} style={{ ...btnSecondary, fontSize: '0.6rem', padding: '5px 12px', borderColor: 'rgba(236,43,37,0.3)', color: 'rgba(236,43,37,0.6)' }}
                        onMouseEnter={e => { (e.currentTarget).style.color = 'var(--ws-red)'; (e.currentTarget).style.borderColor = 'var(--ws-red)' }}
                        onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(236,43,37,0.6)'; (e.currentTarget).style.borderColor = 'rgba(236,43,37,0.3)' }}
                      >Arsip</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANSWERS TAB ── */}
        {tab === 'answers' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--ws-cream)', textTransform: 'uppercase', marginBottom: 24 }}>
              {answers.length} <span style={{ color: 'var(--ws-red)' }}>Jawaban</span>
            </h2>
            {loading ? <Spinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {answers.length === 0 && <EmptyState icon="📥" text="Belum ada jawaban masuk." />}
                {answers.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${a.passed ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ws-cream)' }}>{a.user_name}</span>
                          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)' }}>{a.user_email}</span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{a.question_text}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          <Tag label={a.answer_type} color="rgba(255,255,255,0.2)" />
                          {a.validation_method === 'text_similarity' && a.similarity_score !== undefined && (
                            <Tag label={`Similarity: ${(a.similarity_score * 100).toFixed(0)}%`} color="var(--ws-blue)" />
                          )}
                          {a.validation_method === 'ai_vision' && a.ai_confidence !== undefined && (
                            <Tag label={`AI: ${(a.ai_confidence * 100).toFixed(0)}%`} color="#a855f7" />
                          )}
                          <Tag label={`Percobaan ke-${a.attempt_number}`} color="rgba(255,255,255,0.2)" />
                        </div>
                        {a.ai_reason && (
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 6, fontStyle: 'italic' }}>
                            AI: &quot;{a.ai_reason}&quot;
                          </p>
                        )}
                        {a.text_content && (
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 6, background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: 4 }}>
                            &ldquo;{a.text_content}&rdquo;
                          </p>
                        )}
                        {a.file_url && (
                          <a href={a.file_url} target="_blank" rel="noreferrer"
                            style={{ display: 'inline-block', marginTop: 8, fontFamily: 'var(--font-barlow)', fontSize: '0.6rem', letterSpacing: '1.5px', color: 'var(--ws-blue)', textTransform: 'uppercase', textDecoration: 'none' }}>
                            🔗 Lihat File →
                          </a>
                        )}
                      </div>
                      <div style={{
                        flexShrink: 0, padding: '4px 10px', borderRadius: 4,
                        background: a.passed ? 'rgba(74,222,128,0.1)' : 'rgba(236,43,37,0.1)',
                        border: `1px solid ${a.passed ? 'rgba(74,222,128,0.25)' : 'rgba(236,43,37,0.25)'}`,
                      }}>
                        <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1px', color: a.passed ? '#4ade80' : 'var(--ws-red)', textTransform: 'uppercase' }}>
                          {a.passed ? '✓ BENAR' : '✗ SALAH'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SESSIONS TAB ── */}
        {tab === 'sessions' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.5rem', color: 'var(--ws-cream)', textTransform: 'uppercase', marginBottom: 24 }}>
              {sessions.length} <span style={{ color: 'var(--ws-red)' }}>Peserta</span>
            </h2>
            {loading ? <Spinner /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sessions.length === 0 && <EmptyState icon="👥" text="Belum ada peserta." />}
                {sessions.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1rem', color: 'var(--ws-cream)', marginBottom: 4 }}>{s.user_name}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Tag label={s.status === 'active' ? '🟢 Sedang bermain' : '✓ Selesai'} color={s.status === 'active' ? 'var(--ws-gold)' : 'rgba(74,222,128,0.7)'} />
                        <Tag label={`${s.passed_count} soal benar`} color="rgba(255,255,255,0.2)" />
                        <Tag label={new Date(s.started_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} color="rgba(255,255,255,0.15)" />
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 14px', borderRadius: 4,
                      background: s.status === 'active' ? 'rgba(246,188,5,0.1)' : 'rgba(74,222,128,0.08)',
                    }}>
                      <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1.4rem', color: s.status === 'active' ? 'var(--ws-gold)' : '#4ade80' }}>
                        {s.passed_count}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Question Modal */}
      {modalQ !== false && (
        <QuestionModal
          question={modalQ}
          onSave={saveQuestion}
          onClose={() => setModalQ(false)}
        />
      )}

      {/* Toast notification */}
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 999,
              background: '#1e2728', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '12px 20px',
              fontFamily: 'var(--font-barlow)', fontSize: '0.8rem', letterSpacing: '0.5px',
              color: 'var(--ws-cream)',
            }}
          >{notif}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Reusable atoms ────────────────────────────────────────────────
function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-barlow)', fontWeight: 700,
      fontSize: '0.6rem', letterSpacing: '1.2px',
      padding: '3px 8px', borderRadius: 3,
      background: `${color}18`, color,
      border: `1px solid ${color}30`,
      textTransform: 'uppercase',
    }}>{label}</span>
  )
}
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--ws-red)', borderRadius: '50%' }} />
    </div>
  )
}
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.2)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <p style={{ fontFamily: 'var(--font-barlow)', fontSize: '1rem', letterSpacing: '1px' }}>{text}</p>
    </div>
  )
}

// ── Style atoms ───────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-barlow)', fontSize: '0.58rem',
  letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5,
  padding: '10px 13px', color: 'var(--ws-cream)',
  fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem',
  outline: 'none', marginBottom: 16, transition: 'border-color 0.2s',
}
const btnPrimary: React.CSSProperties = {
  padding: '10px 22px', background: 'var(--ws-red)', border: 'none',
  borderRadius: 5, color: 'white', fontFamily: 'var(--font-barlow)',
  fontWeight: 700, fontSize: '0.72rem', letterSpacing: '2px',
  textTransform: 'uppercase', cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  padding: '8px 16px', background: 'transparent',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5,
  color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-barlow)',
  fontWeight: 700, fontSize: '0.68rem', letterSpacing: '1.5px',
  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
}
const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'var(--ws-red)'
}
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
}
