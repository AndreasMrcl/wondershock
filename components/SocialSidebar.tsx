'use client'

// components/SocialSidebar.tsx
// Fixed vertical social bar — bottom-left of screen, all pages

import { motion } from 'framer-motion'

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/wondershocktheatre',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
        <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@wondershocktheatre',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@wondershocktheatre',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="17" height="17">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function SocialSidebar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        left: 28,
        bottom: 48,
        zIndex: 600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* Icons */}
      {SOCIALS.map((s, i) => (
        <motion.a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.2, x: 3 }}
          style={{
            color: 'rgba(221,219,216,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.25s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-red)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(221,219,216,0.35)'}
        >
          {s.icon}
        </motion.a>
      ))}

      {/* Vertical line below */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 1,
          height: 48,
          background: 'linear-gradient(to bottom, rgba(221,219,216,0.25), transparent)',
          transformOrigin: 'top',
        }}
      />
    </motion.div>
  )
}