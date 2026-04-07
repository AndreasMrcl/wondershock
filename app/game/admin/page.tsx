'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import GameNav from '@/components/game/GameNav'
import { questionsApi, answersApi, sessionsApi, chaptersApi, tokenHelper } from '@/lib/gameApi'
import type { Question, Answer, Session, ChapterDB, RewardDB } from '@/lib/gameApi'

type ChapterTab = 'soal' | 'jawaban' | 'peserta'

// ── Tingkat kecocokan presets ────────────────────────────────────
const MATCH_LEVELS = [
  { label: 'Mudah', desc: 'Jawaban cukup mirip sudah dianggap benar', similarity: 0.5, ai: 0.6 },
  { label: 'Sedang', desc: 'Jawaban harus cukup akurat', similarity: 0.7, ai: 0.75 },
  { label: 'Ketat', desc: 'Jawaban harus sangat tepat', similarity: 0.85, ai: 0.88 },
] as const

function getMatchLevel(similarity?: number): number {
  const s = similarity ?? 0.7
  if (s <= 0.55) return 0
  if (s <= 0.8) return 1
  return 2
}

// ── CHAPTER MODAL ─────────────────────────────────────────────────
function ChapterModal({ chapter, onSave, onClose }: {
  chapter: Partial<ChapterDB> | null
  onSave: (data: Partial<ChapterDB>) => void
  onClose: () => void
}) {
  const isEdit = !!chapter?.id
  const [form, setForm] = useState<Partial<ChapterDB>>(chapter || {
    title: '', slug: '', subtitle: '', location: '', city: '',
    status: 'upcoming', color: '#ec2b25', tags: [],
    date_start: '', date_end: '', description: '',
    timer_seconds: 5280, hint_penalty_seconds: 600, order_num: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (k: string, v: unknown) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }
  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title?.trim()) e.title = 'Judul wajib diisi'
    if (!form.slug?.trim()) e.slug = 'Slug wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#141a1b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={modalTitle}>{isEdit ? 'Edit Chapter' : 'Tambah Chapter Baru'}</h3>
        <p style={modalSubtitle}>{isEdit ? 'Ubah detail chapter.' : 'Buat chapter baru untuk city hunt.'}</p>

        <label style={labelStyle}>Judul <span style={{ color: 'var(--ws-red)' }}>*</span></label>
        <input value={form.title || ''} onChange={e => { update('title', e.target.value); if (!isEdit) update('slug', autoSlug(e.target.value)) }}
          placeholder="cth: Semarang Old Town" style={{ ...inputStyle, ...(errors.title ? errorBorder : {}) }}
          onFocus={focusIn} onBlur={focusOut} />
        {errors.title && <p style={errorText}>{errors.title}</p>}

        <label style={labelStyle}>Slug <span style={{ color: 'var(--ws-red)' }}>*</span></label>
        <p style={helpStyle}>URL-friendly identifier (otomatis dari judul).</p>
        <input value={form.slug || ''} onChange={e => update('slug', e.target.value)}
          placeholder="semarang-old-town" style={{ ...inputStyle, ...(errors.slug ? errorBorder : {}) }}
          onFocus={focusIn} onBlur={focusOut} />
        {errors.slug && <p style={errorText}>{errors.slug}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Subtitle</label>
            <input value={form.subtitle || ''} onChange={e => update('subtitle', e.target.value)}
              placeholder="Petualangan di kota lama" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>Kota</label>
            <input value={form.city || ''} onChange={e => update('city', e.target.value)}
              placeholder="Semarang" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>

        <label style={labelStyle}>Lokasi</label>
        <input value={form.location || ''} onChange={e => update('location', e.target.value)}
          placeholder="cth: Kota Lama Semarang" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />

        <label style={labelStyle}>Deskripsi</label>
        <textarea value={form.description || ''} onChange={e => update('description', e.target.value)}
          placeholder="Deskripsi singkat tentang chapter ini..." rows={3}
          style={{ ...inputStyle, resize: 'vertical', height: 80 }} onFocus={focusIn} onBlur={focusOut} />

        <label style={labelStyle}>Status</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {(['upcoming', 'ongoing', 'expired'] as const).map(s => (
            <button key={s} onClick={() => update('status', s)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 6, cursor: 'pointer',
                background: form.status === s ? 'rgba(236,43,37,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.status === s ? 'var(--ws-red)' : 'rgba(255,255,255,0.08)'}`,
                color: form.status === s ? 'var(--ws-cream)' : 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem',
                letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s',
              }}>
              {s === 'upcoming' ? '📅 Akan Datang' : s === 'ongoing' ? '🟢 Berlangsung' : '⏹ Selesai'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Tanggal Mulai</label>
            <input type="date" value={form.date_start || ''} onChange={e => update('date_start', e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>Tanggal Selesai</label>
            <input type="date" value={form.date_end || ''} onChange={e => update('date_end', e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Timer (detik)</label>
            <p style={helpStyle}>Total waktu bermain.</p>
            <input type="number" value={form.timer_seconds ?? 5280} onChange={e => update('timer_seconds', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>Penalti Hint (detik)</label>
            <p style={helpStyle}>Pengurangan waktu jika pakai hint.</p>
            <input type="number" value={form.hint_penalty_seconds ?? 600} onChange={e => update('hint_penalty_seconds', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Warna Tema</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={form.color || '#ec2b25'} onChange={e => update('color', e.target.value)}
                style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} />
              <input value={form.color || '#ec2b25'} onChange={e => update('color', e.target.value)}
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Urutan</label>
            <input type="number" value={form.order_num ?? 0} onChange={e => update('order_num', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>

        <label style={labelStyle}>URL Background Image</label>
        <input value={form.bg_image || ''} onChange={e => update('bg_image', e.target.value)}
          placeholder="https://..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />

        <label style={labelStyle}>Tags</label>
        <p style={helpStyle}>Pisahkan dengan koma. cth: sejarah, kuliner, budaya</p>
        <input value={(form.tags || []).join(', ')} onChange={e => update('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="sejarah, kuliner" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={btnSecondary}>Batal</button>
          <button onClick={() => { if (validate()) onSave(form) }} style={btnPrimary}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Chapter'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── REWARD MODAL ──────────────────────────────────────────────────
function RewardModal({ reward, onSave, onClose }: {
  reward: Partial<RewardDB> | null
  onSave: (data: Partial<RewardDB>) => void
  onClose: () => void
}) {
  const isEdit = !!reward?.id
  const [form, setForm] = useState<Partial<RewardDB>>(reward || {
    title: '', description: '', type: 'ticket', icon: '🎁', value: '', order_num: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const update = (k: string, v: unknown) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  return (
    <div style={{ ...overlayStyle, zIndex: 600 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#141a1b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={modalTitle}>{isEdit ? 'Edit Reward' : 'Tambah Reward'}</h3>

        <label style={labelStyle}>Judul <span style={{ color: 'var(--ws-red)' }}>*</span></label>
        <input value={form.title || ''} onChange={e => update('title', e.target.value)}
          placeholder="cth: Tiket Gratis Pertunjukan" style={{ ...inputStyle, ...(errors.title ? errorBorder : {}) }}
          onFocus={focusIn} onBlur={focusOut} />
        {errors.title && <p style={errorText}>{errors.title}</p>}

        <label style={labelStyle}>Deskripsi</label>
        <textarea value={form.description || ''} onChange={e => update('description', e.target.value)}
          placeholder="Deskripsi reward..." rows={2} style={{ ...inputStyle, resize: 'vertical', height: 60 }}
          onFocus={focusIn} onBlur={focusOut} />

        <label style={labelStyle}>Tipe</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {([
            { value: 'ticket', icon: '🎫', label: 'Tiket' },
            { value: 'voucher', icon: '🎟️', label: 'Voucher' },
            { value: 'merchandise', icon: '🎁', label: 'Merch' },
            { value: 'experience', icon: '✨', label: 'Pengalaman' },
          ] as const).map(opt => (
            <button key={opt.value} onClick={() => { update('type', opt.value); update('icon', opt.icon) }}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 6, cursor: 'pointer',
                background: form.type === opt.value ? 'rgba(236,43,37,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.type === opt.value ? 'var(--ws-red)' : 'rgba(255,255,255,0.08)'}`,
                color: form.type === opt.value ? 'var(--ws-cream)' : 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.6rem',
                letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
              <span style={{ fontSize: '1rem' }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Nilai / Kode</label>
            <input value={form.value || ''} onChange={e => update('value', e.target.value)}
              placeholder="cth: Rp50.000" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label style={labelStyle}>Urutan</label>
            <input type="number" value={form.order_num ?? 0} onChange={e => update('order_num', +e.target.value)}
              style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={btnSecondary}>Batal</button>
          <button onClick={() => {
            if (!form.title?.trim()) { setErrors({ title: 'Judul wajib diisi' }); return }
            onSave(form)
          }} style={btnPrimary}>
            {isEdit ? 'Simpan' : 'Tambah Reward'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── QUESTION MODAL ────────────────────────────────────────────────
function QuestionModal({ question, chapterId, onSave, onClose }: {
  question: Partial<Question> | null
  chapterId: string
  onSave: (data: Partial<Question>) => void
  onClose: () => void
}) {
  const isEdit = !!question?.id
  const [form, setForm] = useState<Partial<Question>>(question || {
    question_text: '', location_name: '', answer_type: 'any',
    answer_key: '', similarity_threshold: 0.7, ai_confidence_threshold: 0.75,
    hint: '', order_num: 0, chapter_id: chapterId,
  })
  const [matchLevel, setMatchLevel] = useState(getMatchLevel(question?.similarity_threshold))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (k: string, v: unknown) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const handleMatchLevel = (idx: number) => {
    setMatchLevel(idx)
    const preset = MATCH_LEVELS[idx]
    setForm(f => ({ ...f, similarity_threshold: preset.similarity, ai_confidence_threshold: preset.ai }))
  }
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.question_text?.trim()) e.question_text = 'Pertanyaan wajib diisi'
    if (!form.location_name?.trim()) e.location_name = 'Lokasi wajib diisi'
    if (!form.answer_key?.trim()) e.answer_key = 'Kunci jawaban wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#141a1b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={modalTitle}>{isEdit ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
        <p style={modalSubtitle}>{isEdit ? 'Ubah detail soal yang sudah ada.' : 'Buat soal baru untuk peserta city hunt.'}</p>

        <label style={labelStyle}>Pertanyaan <span style={{ color: 'var(--ws-red)' }}>*</span></label>
        <p style={helpStyle}>Tulis pertanyaan yang akan dilihat peserta saat bermain.</p>
        <textarea value={form.question_text || ''} onChange={e => update('question_text', e.target.value)}
          placeholder='cth: "Apa nama gerbang ikonik di kawasan ini?"'
          rows={3} style={{ ...inputStyle, resize: 'vertical', height: 80, ...(errors.question_text ? errorBorder : {}) }}
          onFocus={focusIn} onBlur={focusOut} />
        {errors.question_text && <p style={errorText}>{errors.question_text}</p>}

        <label style={labelStyle}>Lokasi <span style={{ color: 'var(--ws-red)' }}>*</span></label>
        <p style={helpStyle}>Nama tempat di mana peserta harus berada untuk menjawab soal ini.</p>
        <input value={form.location_name || ''} onChange={e => update('location_name', e.target.value)}
          placeholder="cth: Kota Lama Semarang" style={{ ...inputStyle, ...(errors.location_name ? errorBorder : {}) }}
          onFocus={focusIn} onBlur={focusOut} />
        {errors.location_name && <p style={errorText}>{errors.location_name}</p>}

        <label style={labelStyle}>Format Jawaban</label>
        <p style={helpStyle}>Bagaimana peserta bisa menjawab soal ini?</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {([
            { value: 'any', icon: '🔄', label: 'Semua' },
            { value: 'text', icon: '✏️', label: 'Teks' },
            { value: 'photo', icon: '📷', label: 'Foto' },
            { value: 'video', icon: '🎥', label: 'Video' },
          ] as const).map(opt => (
            <button key={opt.value} onClick={() => update('answer_type', opt.value)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 6, cursor: 'pointer',
                background: form.answer_type === opt.value ? 'rgba(236,43,37,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.answer_type === opt.value ? 'var(--ws-red)' : 'rgba(255,255,255,0.08)'}`,
                color: form.answer_type === opt.value ? 'var(--ws-cream)' : 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem',
                letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
              <span style={{ fontSize: '1rem' }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Kunci Jawaban <span style={{ color: 'var(--ws-red)' }}>*</span></label>
        <p style={helpStyle}>
          {form.answer_type === 'text' ? 'Jawaban teks yang benar. Peserta tidak harus mengetik persis sama.'
            : form.answer_type === 'photo' || form.answer_type === 'video'
            ? 'Jelaskan apa yang harus terlihat di foto/video peserta. AI akan memeriksa ini.'
            : 'Untuk teks: kata kunci jawaban. Untuk foto/video: jelaskan apa yang harus terlihat.'}
        </p>
        <textarea value={form.answer_key || ''} onChange={e => update('answer_key', e.target.value)}
          placeholder={form.answer_type === 'text' ? 'cth: Lawang Sewu' : 'cth: Foto menunjukkan gerbang Lawang Sewu dari depan'}
          rows={2} style={{ ...inputStyle, resize: 'vertical', height: 68, ...(errors.answer_key ? errorBorder : {}) }}
          onFocus={focusIn} onBlur={focusOut} />
        {errors.answer_key && <p style={errorText}>{errors.answer_key}</p>}

        <label style={labelStyle}>Tingkat Kecocokan</label>
        <p style={helpStyle}>Seberapa ketat AI dan sistem memeriksa jawaban peserta?</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {MATCH_LEVELS.map((level, idx) => (
            <button key={level.label} onClick={() => handleMatchLevel(idx)}
              style={{
                flex: 1, padding: '12px 10px', borderRadius: 6, cursor: 'pointer',
                background: matchLevel === idx ? 'rgba(236,43,37,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${matchLevel === idx ? 'var(--ws-red)' : 'rgba(255,255,255,0.08)'}`,
                color: matchLevel === idx ? 'var(--ws-cream)' : 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.7rem',
                letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s', textAlign: 'center',
              }}>
              <div style={{ marginBottom: 4 }}>{idx === 0 ? '😊' : idx === 1 ? '🎯' : '🔒'}</div>
              {level.label}
              <div style={{
                fontFamily: 'var(--font-dm-sans)', fontWeight: 400, fontSize: '0.6rem',
                color: matchLevel === idx ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                textTransform: 'none', letterSpacing: '0', marginTop: 4, lineHeight: 1.3,
              }}>{level.desc}</div>
            </button>
          ))}
        </div>

        <label style={labelStyle}>Petunjuk / Hint <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(opsional)</span></label>
        <p style={helpStyle}>Petunjuk yang bisa dilihat peserta jika mereka kesulitan. Akan ada pengurangan waktu jika digunakan.</p>
        <textarea value={form.hint || ''} onChange={e => update('hint', e.target.value)}
          placeholder="cth: Bangunan ini berada di Jalan Pemuda, dekat Tugu Muda..."
          rows={2} style={{ ...inputStyle, resize: 'vertical', height: 60 }}
          onFocus={focusIn} onBlur={focusOut} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onClose} style={btnSecondary}>Batal</button>
          <button onClick={() => { if (validate()) onSave({ ...form, chapter_id: chapterId }) }} style={btnPrimary}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Soal'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const { loading: authLoading } = useAuth()
  const [authed, setAuthed] = useState(false)

  // Chapter list
  const [chapters, setChapters] = useState<ChapterDB[]>([])
  const [selectedChapter, setSelectedChapter] = useState<ChapterDB | null>(null)
  const [chapterTab, setChapterTab] = useState<ChapterTab>('soal')

  // Data inside selected chapter
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [sessions, setSessions] = useState<(Session & { user_name: string; passed_count: number })[]>([])
  const [rewards, setRewards] = useState<RewardDB[]>([])

  // Modals
  const [modalChapter, setModalChapter] = useState<Partial<ChapterDB> | null | false>(false)
  const [modalQ, setModalQ] = useState<Partial<Question> | null | false>(false)
  const [modalReward, setModalReward] = useState<Partial<RewardDB> | null | false>(false)

  const [loading, setLoading] = useState(false)
  const [notif, setNotif] = useState('')

  useEffect(() => {
    if (authLoading) return
    const saved = tokenHelper.getUser()
    if (saved?.role === 'admin') { setAuthed(true) }
    else { router.replace('/login?from=/game/admin') }
  }, [authLoading]) // eslint-disable-line

  // Load chapters on auth
  useEffect(() => {
    if (authed) loadChapters()
  }, [authed]) // eslint-disable-line

  // Load chapter detail data when selected chapter or tab changes
  useEffect(() => {
    if (!selectedChapter) return
    if (chapterTab === 'soal') loadQuestions(selectedChapter.id)
    if (chapterTab === 'jawaban') loadAnswers(selectedChapter.id)
    if (chapterTab === 'peserta') loadSessions(selectedChapter.id)
    loadRewards(selectedChapter.id)
  }, [selectedChapter, chapterTab]) // eslint-disable-line

  const loadChapters = async () => {
    setLoading(true)
    try { const r = await chaptersApi.listAdmin(); setChapters(r.chapters) } finally { setLoading(false) }
  }
  const loadQuestions = async (chapterId: string) => {
    setLoading(true)
    try { const r = await questionsApi.listAdmin(chapterId); setQuestions(r.questions) } finally { setLoading(false) }
  }
  const loadAnswers = async (chapterId: string) => {
    setLoading(true)
    try { const r = await answersApi.listAdmin({ chapter_id: chapterId }); setAnswers(r.answers) } finally { setLoading(false) }
  }
  const loadSessions = async (chapterId: string) => {
    setLoading(true)
    try { const r = await sessionsApi.listAdmin(chapterId); setSessions(r.sessions) } finally { setLoading(false) }
  }
  const loadRewards = async (chapterId: string) => {
    try { const r = await chaptersApi.rewards(chapterId); setRewards(r.rewards) } catch {}
  }

  const toast = (msg: string) => { setNotif(msg); setTimeout(() => setNotif(''), 2800) }

  // Chapter CRUD
  const saveChapter = async (data: Partial<ChapterDB>) => {
    try {
      if (data.id) {
        const r = await chaptersApi.update(data.id, data)
        setSelectedChapter(r.chapter)
      } else {
        await chaptersApi.create(data)
      }
      setModalChapter(false); loadChapters(); toast('Chapter berhasil disimpan')
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Gagal menyimpan') }
  }
  const deleteChapter = async (id: string) => {
    if (!confirm('Arsipkan chapter ini?')) return
    await chaptersApi.delete(id)
    if (selectedChapter?.id === id) setSelectedChapter(null)
    loadChapters(); toast('Chapter diarsipkan')
  }

  // Question CRUD (within chapter)
  const saveQuestion = async (data: Partial<Question>) => {
    try {
      if (data.id) await questionsApi.update(data.id, data)
      else await questionsApi.create(data)
      setModalQ(false); if (selectedChapter) loadQuestions(selectedChapter.id); toast('Soal berhasil disimpan')
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Gagal menyimpan') }
  }
  const deleteQuestion = async (id: string) => {
    if (!confirm('Arsipkan soal ini?')) return
    await questionsApi.delete(id); if (selectedChapter) loadQuestions(selectedChapter.id); toast('Soal diarsipkan')
  }

  // Reward CRUD
  const saveReward = async (data: Partial<RewardDB>) => {
    if (!selectedChapter) return
    try {
      if (data.id) await chaptersApi.updateReward(data.id, data)
      else await chaptersApi.createReward(selectedChapter.id, data)
      setModalReward(false); loadRewards(selectedChapter.id); toast('Reward berhasil disimpan')
    } catch (e: unknown) { toast(e instanceof Error ? e.message : 'Gagal menyimpan') }
  }
  const deleteReward = async (rewardId: string) => {
    if (!confirm('Arsipkan reward ini?')) return
    if (!selectedChapter) return
    await chaptersApi.deleteReward(rewardId); loadRewards(selectedChapter.id); toast('Reward diarsipkan')
  }

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#0a0f10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--ws-gray)', letterSpacing: '3px', fontSize: '0.7rem', textTransform: 'uppercase' }}>Memeriksa akses...</p>
    </div>
  )

  const typeLabel: Record<string, string> = { text: 'Teks', photo: 'Foto', video: 'Video', any: 'Semua Format' }
  const typeIcon: Record<string, string> = { text: '✏️', photo: '📷', video: '🎥', any: '🔄' }
  const typeColor: Record<string, string> = { text: 'var(--ws-blue)', photo: 'var(--ws-gold)', video: '#a855f7', any: 'var(--ws-gray)' }

  // ── CHAPTER DETAIL VIEW ──
  if (selectedChapter) {
    const ch = selectedChapter
    const tabItems: { key: ChapterTab; icon: string; label: string }[] = [
      { key: 'soal', icon: '📋', label: `Soal (${questions.filter(q => q.is_active !== false).length})` },
      { key: 'jawaban', icon: '📥', label: 'Jawaban' },
      { key: 'peserta', icon: '👥', label: 'Peserta' },
    ]

    return (
      <div style={{ minHeight: '100vh', background: '#0a0f10' }}>
        <GameNav />

        {/* Chapter header */}
        <div style={{ padding: '0 max(4%, 28px)', paddingTop: 80 }}>
          {/* Back button */}
          <button onClick={() => setSelectedChapter(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem',
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--ws-gray)', display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 20, padding: 0,
            }}>
            ← Kembali ke daftar chapter
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: ch.color || 'var(--ws-red)', flexShrink: 0, marginTop: 6 }} />
              <div>
                <h1 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--ws-cream)', textTransform: 'uppercase', marginBottom: 4, lineHeight: 1.1 }}>
                  {ch.title}
                </h1>
                {ch.subtitle && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>{ch.subtitle}</p>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag label={ch.status === 'ongoing' ? '🟢 Berlangsung' : ch.status === 'upcoming' ? '📅 Akan Datang' : '⏹ Selesai'}
                    color={ch.status === 'ongoing' ? '#4ade80' : ch.status === 'upcoming' ? 'var(--ws-gold)' : 'var(--ws-gray)'} />
                  {ch.city && <Tag label={`📍 ${ch.city}`} color="var(--ws-gold)" />}
                  <Tag label={`${ch.question_count ?? questions.filter(q => q.is_active !== false).length} soal`} color="var(--ws-blue)" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setModalChapter(ch)} style={{ ...btnSecondary, fontSize: '0.6rem', padding: '8px 16px' }}>Edit Chapter</button>
              <button onClick={() => setModalReward(null)} style={{ ...btnSecondary, fontSize: '0.6rem', padding: '8px 16px' }}>+ Reward</button>
            </div>
          </div>

          {/* Rewards summary */}
          {rewards.length > 0 && (
            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {rewards.map(rw => (
                <div key={rw.id} style={{
                  display: 'flex', gap: 8, alignItems: 'center', padding: '8px 14px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ fontSize: '1rem' }}>{rw.icon}</span>
                  <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--ws-cream)' }}>{rw.title}</span>
                  {rw.value && <Tag label={rw.value} color="var(--ws-gold)" />}
                  <button onClick={() => setModalReward(rw)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ws-gray)', fontFamily: 'var(--font-barlow)', fontSize: '0.55rem', letterSpacing: '1px' }}>
                    Edit
                  </button>
                  <button onClick={() => deleteReward(rw.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(236,43,37,0.5)', fontFamily: 'var(--font-barlow)', fontSize: '0.55rem', letterSpacing: '1px' }}>
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 max(4%, 28px)', marginTop: 24, display: 'flex', gap: 0 }}>
          {tabItems.map(t => (
            <button key={t.key} onClick={() => setChapterTab(t.key)} style={{
              padding: '14px 22px', background: 'none', border: 'none',
              borderBottom: `2px solid ${chapterTab === t.key ? (ch.color || 'var(--ws-red)') : 'transparent'}`,
              color: chapterTab === t.key ? 'var(--ws-cream)' : 'var(--ws-gray)',
              fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.7rem',
              letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer',
              marginBottom: -1, transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <main style={{ padding: '28px max(4%, 28px)', maxWidth: 1100, margin: '0 auto' }}>

          {/* ── SOAL TAB ── */}
          {chapterTab === 'soal' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button onClick={() => setModalQ({})} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                  + Tambah Soal
                </button>
              </div>
              {loading ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {questions.length === 0 && <EmptyState icon="📋" title="Belum ada soal" text="Klik tombol 'Tambah Soal' untuk membuat soal pertama di chapter ini." />}
                  {questions.map((q, i) => (
                    <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${q.is_active !== false ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
                        borderRadius: 10, padding: '20px 22px', display: 'flex', gap: 18, alignItems: 'flex-start',
                        opacity: q.is_active !== false ? 1 : 0.4,
                      }}>
                      <span style={{
                        fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.6rem',
                        color: 'rgba(255,255,255,0.08)', minWidth: 32, lineHeight: 1, textAlign: 'right',
                      }}>{String(i + 1).padStart(2, '0')}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1rem', color: 'var(--ws-cream)', marginBottom: 10, lineHeight: 1.35 }}>{q.question_text}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                          <Tag label={`📍 ${q.location_name}`} color="var(--ws-gold)" />
                          <Tag label={`${typeIcon[q.answer_type]} ${typeLabel[q.answer_type]}`} color={typeColor[q.answer_type]} />
                          {q.hint && <Tag label="💡 Ada petunjuk" color="rgba(246,188,5,0.6)" />}
                          {q.is_active === false && <Tag label="Diarsipkan" color="rgba(255,100,100,0.6)" />}
                        </div>
                        {q.answer_key && (
                          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '8px 10px', borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.55rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginRight: 6 }}>Kunci:</span>
                            <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>{q.answer_key}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignSelf: 'center' }}>
                        <button onClick={() => setModalQ(q)} style={{ ...btnSecondary, fontSize: '0.6rem', padding: '6px 14px' }}>Edit</button>
                        <button onClick={() => deleteQuestion(q.id)}
                          style={{ ...btnSecondary, fontSize: '0.6rem', padding: '6px 14px', borderColor: 'rgba(236,43,37,0.2)', color: 'rgba(236,43,37,0.5)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--ws-red)'; e.currentTarget.style.borderColor = 'var(--ws-red)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(236,43,37,0.5)'; e.currentTarget.style.borderColor = 'rgba(236,43,37,0.2)' }}>
                          Arsipkan
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── JAWABAN TAB ── */}
          {chapterTab === 'jawaban' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
                  {answers.filter(a => a.passed).length} benar dari {answers.length} total jawaban
                </p>
              </div>
              {loading ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {answers.length === 0 && <EmptyState icon="📥" title="Belum ada jawaban" text="Jawaban akan muncul setelah peserta mulai bermain chapter ini." />}
                  {answers.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${a.passed ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 10, padding: '16px 20px',
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                            <span style={{
                              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                              background: a.passed ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '0.6rem',
                              color: a.passed ? '#4ade80' : 'rgba(255,255,255,0.3)',
                            }}>{a.user_name?.charAt(0).toUpperCase()}</span>
                            <div>
                              <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ws-cream)' }}>{a.user_name}</span>
                              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)', marginLeft: 8 }}>
                                {new Date(a.submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: 8, lineHeight: 1.4 }}>{a.question_text}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                            <Tag label={`${typeIcon[a.answer_type] || ''} ${typeLabel[a.answer_type] || a.answer_type}`} color="rgba(255,255,255,0.2)" />
                            {a.validation_method === 'text_similarity' && a.similarity_score != null && <Tag label={`Kecocokan teks: ${(a.similarity_score * 100).toFixed(0)}%`} color="var(--ws-blue)" />}
                            {a.validation_method === 'ai_vision' && a.ai_confidence != null && <Tag label={`Keyakinan AI: ${(a.ai_confidence * 100).toFixed(0)}%`} color="#a855f7" />}
                            <Tag label={`Percobaan ke-${a.attempt_number}`} color="rgba(255,255,255,0.15)" />
                          </div>
                          {a.ai_reason && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 8, fontStyle: 'italic', lineHeight: 1.4 }}>AI: &quot;{a.ai_reason}&quot;</p>}
                          {a.text_content && (
                            <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 5, borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
                              <span style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.5rem', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Jawaban:</span>
                              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{a.text_content}</p>
                            </div>
                          )}
                          {a.file_url && (
                            <a href={a.file_url} target="_blank" rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontFamily: 'var(--font-barlow)', fontSize: '0.6rem', letterSpacing: '1.5px', color: 'var(--ws-blue)', textTransform: 'uppercase', textDecoration: 'none' }}>
                              🔗 Lihat File
                            </a>
                          )}
                        </div>
                        <div style={{
                          flexShrink: 0, padding: '6px 12px', borderRadius: 5,
                          background: a.passed ? 'rgba(74,222,128,0.1)' : 'rgba(236,43,37,0.08)',
                          border: `1px solid ${a.passed ? 'rgba(74,222,128,0.2)' : 'rgba(236,43,37,0.2)'}`,
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.62rem',
                            letterSpacing: '1px', textTransform: 'uppercase',
                            color: a.passed ? '#4ade80' : 'var(--ws-red)',
                          }}>{a.passed ? 'Benar' : 'Salah'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PESERTA TAB ── */}
          {chapterTab === 'peserta' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
                  {sessions.filter(s => s.status === 'active').length} sedang bermain · {sessions.filter(s => s.status === 'finished').length} selesai
                </p>
              </div>
              {loading ? <Spinner /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sessions.length === 0 && <EmptyState icon="👥" title="Belum ada peserta" text="Peserta akan muncul setelah mereka bermain chapter ini." />}
                  {sessions.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${s.status === 'active' ? 'rgba(246,188,5,0.15)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: s.status === 'active' ? 'rgba(246,188,5,0.12)' : 'rgba(74,222,128,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '0.85rem',
                          color: s.status === 'active' ? 'var(--ws-gold)' : '#4ade80',
                        }}>{s.user_name?.charAt(0).toUpperCase()}</span>
                        <div>
                          <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1rem', color: 'var(--ws-cream)', marginBottom: 5 }}>{s.user_name}</p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Tag label={s.status === 'active' ? '🟢 Sedang bermain' : '✓ Selesai'} color={s.status === 'active' ? 'var(--ws-gold)' : 'rgba(74,222,128,0.7)'} />
                            <Tag label={new Date(s.started_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} color="rgba(255,255,255,0.15)" />
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.6rem', color: s.status === 'active' ? 'var(--ws-gold)' : '#4ade80', lineHeight: 1 }}>{s.passed_count}</span>
                        <p style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.5rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>soal benar</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modals */}
        {modalChapter !== false && <ChapterModal chapter={modalChapter} onSave={saveChapter} onClose={() => setModalChapter(false)} />}
        {modalQ !== false && selectedChapter && <QuestionModal question={modalQ} chapterId={selectedChapter.id} onSave={saveQuestion} onClose={() => setModalQ(false)} />}
        {modalReward !== false && <RewardModal reward={modalReward} onSave={saveReward} onClose={() => setModalReward(false)} />}

        <AnimatePresence>
          {notif && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: '#1e2728', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 20px', fontFamily: 'var(--font-barlow)', fontSize: '0.8rem', letterSpacing: '0.5px', color: 'var(--ws-cream)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >{notif}</motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── CHAPTER LIST VIEW (default) ──
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f10' }}>
      <GameNav />

      <main style={{ padding: '28px max(4%, 28px)', paddingTop: 100, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--ws-cream)', textTransform: 'uppercase', marginBottom: 4 }}>
              Admin Panel
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
              Kelola chapter, soal, dan reward city hunt.
            </p>
          </div>
          <button onClick={() => setModalChapter({})} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
            + Tambah Chapter
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {chapters.length === 0 && <EmptyState icon="📖" title="Belum ada chapter" text="Klik tombol 'Tambah Chapter' untuk memulai. Setelah chapter dibuat, Anda bisa menambahkan soal dan reward di dalamnya." />}
            {chapters.map((ch, i) => (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedChapter(ch)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${ch.is_active !== false ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
                  borderRadius: 10, padding: '22px 24px', cursor: 'pointer',
                  opacity: ch.is_active !== false ? 1 : 0.4,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ch.color || 'var(--ws-red)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: ch.color || 'var(--ws-red)', flexShrink: 0, marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ws-cream)', marginBottom: 4 }}>{ch.title}</p>
                        {ch.subtitle && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>{ch.subtitle}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setModalChapter(ch)} style={{ ...btnSecondary, fontSize: '0.55rem', padding: '5px 12px' }}>Edit</button>
                        <button onClick={() => deleteChapter(ch.id)}
                          style={{ ...btnSecondary, fontSize: '0.55rem', padding: '5px 12px', borderColor: 'rgba(236,43,37,0.2)', color: 'rgba(236,43,37,0.5)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--ws-red)'; e.currentTarget.style.borderColor = 'var(--ws-red)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(236,43,37,0.5)'; e.currentTarget.style.borderColor = 'rgba(236,43,37,0.2)' }}>
                          Arsipkan
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <Tag label={ch.status === 'ongoing' ? '🟢 Berlangsung' : ch.status === 'upcoming' ? '📅 Akan Datang' : '⏹ Selesai'}
                        color={ch.status === 'ongoing' ? '#4ade80' : ch.status === 'upcoming' ? 'var(--ws-gold)' : 'var(--ws-gray)'} />
                      {ch.city && <Tag label={`📍 ${ch.city}`} color="var(--ws-gold)" />}
                      <Tag label={`${ch.question_count ?? 0} soal`} color="var(--ws-blue)" />
                      {(ch.participants ?? 0) > 0 && <Tag label={`${ch.participants} peserta`} color="rgba(255,255,255,0.25)" />}
                      {ch.date_start && <Tag label={new Date(ch.date_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} color="rgba(255,255,255,0.15)" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {modalChapter !== false && <ChapterModal chapter={modalChapter} onSave={saveChapter} onClose={() => setModalChapter(false)} />}

      <AnimatePresence>
        {notif && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: '#1e2728', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 20px', fontFamily: 'var(--font-barlow)', fontSize: '0.8rem', letterSpacing: '0.5px', color: 'var(--ws-cream)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
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
      fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '1.2px',
      padding: '3px 9px', borderRadius: 3, background: `${color}18`, color,
      border: `1px solid ${color}30`, textTransform: 'uppercase', whiteSpace: 'nowrap',
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

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{title}</p>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.15)' }}>{text}</p>
    </div>
  )
}

// ── Style atoms ───────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
}
const modalTitle: React.CSSProperties = {
  fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--ws-cream)', marginBottom: 6,
}
const modalSubtitle: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginBottom: 28,
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-barlow)', fontSize: '0.62rem',
  letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
  marginBottom: 4, marginTop: 4,
}
const helpStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)',
  marginBottom: 8, lineHeight: 1.4,
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
  padding: '10px 13px', color: 'var(--ws-cream)',
  fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem',
  outline: 'none', marginBottom: 16, transition: 'border-color 0.2s',
}
const errorBorder: React.CSSProperties = { borderColor: 'var(--ws-red)' }
const errorText: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--ws-red)', marginTop: -12, marginBottom: 12,
}
const btnPrimary: React.CSSProperties = {
  padding: '10px 22px', background: 'var(--ws-red)', border: 'none', borderRadius: 5,
  color: 'white', fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem',
  letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer',
}
const btnSecondary: React.CSSProperties = {
  padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 5, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-barlow)',
  fontWeight: 700, fontSize: '0.68rem', letterSpacing: '1.5px', textTransform: 'uppercase',
  cursor: 'pointer', transition: 'all 0.2s',
}
const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'var(--ws-red)'
}
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
}
