'use client'
// components/game/AnswerInput.tsx
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '@/lib/gameApi'

interface Props {
  question: Question
  onSubmit: (type: 'text' | 'photo' | 'video', value: string | File) => void
  loading: boolean
  lastResult: { passed: boolean; hint?: string } | null
}

export default function AnswerInput({ question, onSubmit, loading, lastResult }: Props) {
  const [activeType, setActiveType] = useState<'text' | 'photo' | 'video'>(
    question.answer_type === 'any' ? 'text' : question.answer_type as 'text' | 'photo' | 'video'
  )
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const availableTypes = question.answer_type === 'any'
    ? (['text', 'photo', 'video'] as const)
    : ([question.answer_type] as ('text' | 'photo' | 'video')[])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = () => {
    if (activeType === 'text') {
      if (!text.trim()) return
      onSubmit('text', text.trim())
    } else {
      if (!file) return
      onSubmit(activeType, file)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const typeIcons: Record<string, string> = { text: '✏', photo: '📷', video: '🎥' }
  const typeLabels: Record<string, string> = { text: 'Teks', photo: 'Foto', video: 'Video' }

  return (
    <div style={{ width: '100%', maxWidth: 600 }}>

      {/* Type selector — only shown for 'any' */}
      {question.answer_type === 'any' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => { setActiveType(type); clearFile(); setText('') }}
              style={{
                padding: '7px 18px',
                border: `1px solid ${activeType === type ? 'var(--ws-red)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 3,
                background: activeType === type ? 'rgba(236,43,37,0.1)' : 'transparent',
                color: activeType === type ? 'var(--ws-cream)' : 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-barlow)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{typeIcons[type]}</span> {typeLabels[type]}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeType === 'text' ? (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Tulis jawabanmu di sini..."
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit() }}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '16px 18px',
                color: 'var(--ws-cream)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.95rem',
                resize: 'none',
                height: 110,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--ws-red)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          ) : (
            <div>
              {!preview ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '1.5px dashed rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--ws-red)'
                    ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(236,43,37,0.04)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)'
                    ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{activeType === 'photo' ? '📷' : '🎥'}</div>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontSize: '0.85rem', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                    {activeType === 'photo' ? 'Klik untuk upload foto' : 'Klik untuk upload video'}
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
                    {activeType === 'photo' ? 'JPG, PNG, HEIC · Max 50MB' : 'MP4, MOV · Max 50MB'}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={activeType === 'photo' ? 'image/*' : 'video/*'}
                    onChange={handleFile}
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.4)' }}>
                  {activeType === 'photo'
                    ? <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
                    : <video src={preview} controls style={{ width: '100%', maxHeight: 240, display: 'block' }} />
                  }
                  <button
                    onClick={clearFile}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.7)', border: 'none',
                      color: 'white', borderRadius: '50%',
                      width: 28, height: 28, cursor: 'pointer',
                      fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✕</button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Last result feedback */}
      <AnimatePresence>
        {lastResult && !lastResult.passed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderLeft: '3px solid var(--ws-red)',
              background: 'rgba(236,43,37,0.07)',
              borderRadius: '0 4px 4px 0',
            }}
          >
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              {lastResult.hint || 'Jawaban belum tepat. Coba lagi!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit row */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
        <motion.button
          onClick={handleSubmit}
          disabled={loading || (activeType === 'text' ? !text.trim() : !file)}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '14px 24px',
            background: 'var(--ws-red)',
            border: 'none',
            borderRadius: 5,
            color: 'white',
            fontFamily: 'var(--font-barlow)',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || (activeType === 'text' ? !text.trim() : !file) ? 0.4 : 1,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
              />
              Memproses...
            </>
          ) : 'Kirim Jawaban →'}
        </motion.button>
      </div>

      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: 8, textAlign: 'center' }}>
        {activeType === 'text' ? 'Ctrl+Enter untuk kirim cepat' : 'AI akan memvalidasi foto/videomu secara real-time'}
      </p>
    </div>
  )
}
