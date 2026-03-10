'use client'
// components/game/GameTimer.tsx
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  display: string
  pct: number
  urgent: boolean
  expired: boolean
}

export default function GameTimer({ display, pct, urgent, expired }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Arc progress */}
      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
        <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
          <motion.circle
            cx="22" cy="22" r="18" fill="none"
            stroke={urgent ? '#ec2b25' : '#dddbd8'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 18}`}
            animate={{ strokeDashoffset: (1 - pct) * 2 * Math.PI * 18 }}
            transition={{ duration: 0.8, ease: 'linear' }}
          />
        </svg>
        {urgent && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'rgba(236,43,37,0.08)',
            }}
          />
        )}
      </div>

      {/* Time display */}
      <AnimatePresence mode="wait">
        <motion.span
          key={display}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            fontFamily: 'var(--font-barlow)',
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '0.08em',
            color: expired ? '#ec2b25' : urgent ? '#ec2b25' : 'var(--ws-cream)',
            minWidth: 58,
          }}
        >
          {expired ? 'HABIS' : display}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
