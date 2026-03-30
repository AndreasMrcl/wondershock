'use client'
// components/game/GameTimer.tsx
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  display: string
  pct: number
  urgent: boolean
  warning?: boolean
  expired: boolean
  totalSeconds: number
}

export default function GameTimer({ display, pct, urgent, warning, expired, totalSeconds }: Props) {
  const color = expired || urgent
    ? '#ec2b25'
    : warning
    ? '#f6bc05'
    : '#dddbd8'

  const radius = 18
  const circumference = 2 * Math.PI * radius

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Arc progress */}
      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
        <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="22" cy="22" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2.5"
          />
          <motion.circle
            cx="22" cy="22" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: (1 - pct) * circumference }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </svg>

        {/* Pulse ring saat urgent */}
        {urgent && (
          <motion.div
            animate={{ opacity: [1, 0.2, 1], scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: '1.5px solid rgba(236,43,37,0.4)',
            }}
          />
        )}
      </div>

      {/* Time display */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={display}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.12 }}
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: expired ? '1.1rem' : '1.5rem',
              letterSpacing: '0.08em',
              color,
              minWidth: 70,
              lineHeight: 1,
              transition: 'color 0.4s',
            }}
          >
            {expired ? 'WAKTU HABIS' : display}
          </motion.span>
        </AnimatePresence>

        {/* Label */}
        {!expired && (
          <span style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.5rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            marginTop: 2,
          }}>
            {urgent ? '⚠ sisa waktu' : warning ? 'tersisa' : 'waktu chapter'}
          </span>
        )}
      </div>
    </div>
  )
}