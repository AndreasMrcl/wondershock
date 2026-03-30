'use client'
// components/game/HintPenaltyModal.tsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  penaltySeconds: number
  onConfirm: (dontShowAgain: boolean) => void
  onCancel: () => void
}

export default function HintPenaltyModal({ penaltySeconds, onConfirm, onCancel }: Props) {
  const [checked, setChecked] = useState(false)

  const mm = Math.floor(penaltySeconds / 60)
  const ss = penaltySeconds % 60
  const penaltyLabel = mm > 0
    ? `${mm} menit${ss > 0 ? ` ${ss} detik` : ''}`
    : `${ss} detik`

  return (
    <AnimatePresence>
      <motion.div
        key="hint-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(7,13,14,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
      >
        <motion.div
          key="hint-modal-box"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#0d1517',
            border: '1px solid rgba(246,188,5,0.2)',
            borderRadius: 12,
            padding: '32px 28px',
            maxWidth: 400,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(to right, transparent, rgba(246,188,5,0.6), transparent)',
          }} />

          {/* Icon */}
          <div style={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: 'rgba(246,188,5,0.08)',
            border: '1.5px solid rgba(246,188,5,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '1.5rem',
          }}>
            💡
          </div>

          {/* Heading */}
          <p style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: '1.2rem', textTransform: 'uppercase',
            color: 'var(--ws-cream)', textAlign: 'center',
            marginBottom: 12, letterSpacing: '0.05em',
          }}>
            Gunakan Hint?
          </p>

          {/* Body */}
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem',
            color: 'var(--ws-gray)', lineHeight: 1.7,
            textAlign: 'center', marginBottom: 8,
          }}>
            Hint akan membantu kamu menemukan jawaban, tapi ada konsekuensinya.
          </p>

          {/* Penalty box */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'rgba(246,188,5,0.06)',
            border: '1px solid rgba(246,188,5,0.15)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
          }}>
            <span style={{ fontSize: '1.1rem' }}>⏱</span>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem',
              color: 'var(--ws-sand)', lineHeight: 1.5,
            }}>
              Timer chapter berkurang{' '}
              <span style={{
                fontFamily: 'var(--font-barlow)', fontWeight: 900,
                fontSize: '1rem', color: '#f6bc05',
              }}>
                {penaltyLabel}
              </span>
            </p>
          </div>

          {/* Don't show again checkbox */}
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            cursor: 'pointer', marginBottom: 28,
            padding: '10px 12px',
            background: checked ? 'rgba(255,255,255,0.04)' : 'transparent',
            border: `1px solid ${checked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
            borderRadius: 6,
            transition: 'all 0.2s',
          }}>
            {/* Custom checkbox */}
            <div
              onClick={() => setChecked(c => !c)}
              style={{
                width: 18, height: 18,
                borderRadius: 4,
                border: `2px solid ${checked ? 'var(--ws-gold)' : 'rgba(255,255,255,0.2)'}`,
                background: checked ? 'rgba(246,188,5,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              {checked && (
                <motion.svg
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  width="10" height="8" viewBox="0 0 10 8" fill="none"
                >
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="#f6bc05"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </div>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
              color: checked ? 'var(--ws-sand)' : 'var(--ws-gray)',
              lineHeight: 1.5,
              transition: 'color 0.2s',
            }}>
              Jangan tampilkan lagi — langsung tampilkan hint tanpa konfirmasi untuk soal-soal berikutnya
            </span>
          </label>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                background: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '11px',
                color: 'var(--ws-gray)',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.72rem', letterSpacing: '1.5px',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            >
              Batal
            </button>

            <motion.button
              onClick={() => onConfirm(checked)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 2,
                background: 'rgba(246,188,5,0.12)',
                border: '1px solid rgba(246,188,5,0.35)',
                borderRadius: 6, padding: '11px',
                color: '#f6bc05',
                fontFamily: 'var(--font-barlow)', fontWeight: 900,
                fontSize: '0.78rem', letterSpacing: '2px',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(246,188,5,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(246,188,5,0.12)')}
            >
              💡 Tampilkan Hint
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}