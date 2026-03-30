'use client'
// app/game/page.tsx
// Home page game City Hunt — cinematic, seperti poster film.
// Konten: hero chapter aktif + preview rewards.

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import {
  CHAPTERS,
  getOngoingChapters,
  formatTimer,
  formatHintPenalty,
  type Chapter,
} from '@/lib/chapters'

// Dummy rewards preview — nanti dari API
const REWARDS_PREVIEW = [
  {
    icon: '🎭',
    title: 'Tiket Gratis',
    desc: 'AHA Moment #3',
    color: '#ec2b25',
    value: '2 Tiket',
  },
  {
    icon: '🎟',
    title: 'Voucher Workshop',
    desc: 'Diskon 50%',
    color: '#f6bc05',
    value: '50% OFF',
  },
  {
    icon: '👕',
    title: 'Merchandise',
    desc: 'Kaos Eksklusif',
    color: '#818cf8',
    value: 'Limited',
  },
]

// ── Shared Game Navbar ────────────────────────────────────────────
function GameNav() {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(221,219,216,0.06)',
        background: 'rgba(7,13,14,0.7)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 48px',
          height: 80,
        }}
      >
        {/* LEFT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 32,
            paddingRight: 36,
          }}
        >
          <Link
            href="/game/chapters"
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ws-sand)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-sand)')
            }
          >
            Chapters
          </Link>
        </div>

        {/* CENTER */}
        <Link href="/game" style={{ flexShrink: 0, display: 'block' }}>
          <div style={{ width: 180, height: 72 }}>
            <img
              src="/assets/logo-white.png"
              alt="Wondershock Theatre"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </Link>

        {/* RIGHT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 36,
            gap: 20,
          }}
        >
          <Link
            href="/game/rewards"
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--ws-gold)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '0.75')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '1')
            }
          >
            <span>🏆</span> Rewards
          </Link>

          <div style={{ flex: 1 }} />

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--ws-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  color: 'white',
                  flexShrink: 0,
                  border: '1.5px solid rgba(236,43,37,0.4)',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.78rem',
                  color: 'rgba(221,219,216,0.55)',
                }}
              >
                {user.name.split(' ')[0]}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              padding: '6px 14px',
              color: 'rgba(221,219,216,0.4)',
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.6rem',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor =
                'rgba(236,43,37,0.5)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-red)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor =
                'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLElement).style.color =
                'rgba(221,219,216,0.4)'
            }}
          >
            Keluar
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Hero — Chapter Aktif ──────────────────────────────────────────
function HeroChapter({
  chapter,
  userName,
}: {
  chapter: Chapter
  userName: string
}) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}
    >
      {/* ── Full bleed background ── */}
      <motion.img
        src={chapter.bg_image}
        alt={chapter.title}
        onLoad={() => setImgLoaded(true)}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 1.08 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 30%',
          filter: 'grayscale(20%) contrast(1.1) brightness(0.65)',
        }}
      />

      {/* ── Cinematic overlays ── */}
      {/* Top letterbox */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '18%',
          background:
            'linear-gradient(to bottom, rgba(7,13,14,1) 0%, rgba(7,13,14,0) 100%)',
          zIndex: 1,
        }}
      />
      {/* Bottom fade to dark */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65%',
          background:
            'linear-gradient(to top, rgba(7,13,14,1) 0%, rgba(7,13,14,0.85) 40%, rgba(7,13,14,0) 100%)',
          zIndex: 1,
        }}
      />
      {/* Left vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(7,13,14,0.7) 0%, transparent 55%)',
          zIndex: 1,
        }}
      />
      {/* Color tint dari chapter */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 20% 80%, ${chapter.color}20 0%, transparent 60%)`,
          zIndex: 1,
        }}
      />

      {/* ── Film grain overlay ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Vertical chapter number — kanan tengah ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        style={{
          position: 'absolute',
          right: 'max(5%, 48px)',
          top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 1,
            background: `rgba(255,255,255,0.2)`,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-barlow)',
            fontWeight: 900,
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
            whiteSpace: 'nowrap',
          }}
        >
          Chapter {String(chapter.id).padStart(2, '0')}
        </span>
        <div
          style={{
            width: 40,
            height: 1,
            background: `rgba(255,255,255,0.2)`,
          }}
        />
      </motion.div>

      {/* ── Main content — bottom left ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          padding: '0 max(5%, 48px) 72px',
          maxWidth: 720,
        }}
      >
        {/* LIVE badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.35)',
              borderRadius: 20,
              padding: '5px 14px',
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                display: 'block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#4ade80',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-barlow)',
                fontWeight: 700,
                fontSize: '0.62rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: '#4ade80',
              }}
            >
              Berlangsung Sekarang
            </span>
          </div>

          {/* Location */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>📍</span>
            <span
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.72rem',
                color: 'var(--ws-sand)',
                letterSpacing: '0.05em',
              }}
            >
              {chapter.location}, {chapter.city}
            </span>
          </div>
        </motion.div>

        {/* Title — besar seperti judul film */}
        <div style={{ overflow: 'hidden', marginBottom: 6 }}>
          <motion.h1
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 900,
              fontSize: 'clamp(3.5rem, 10vw, 8rem)',
              textTransform: 'uppercase',
              lineHeight: 0.88,
              color: 'var(--ws-cream)',
              letterSpacing: '-0.02em',
            }}
          >
            {chapter.title}
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
            color: 'rgba(221,219,216,0.55)',
            lineHeight: 1.7,
            marginBottom: 36,
            maxWidth: 480,
          }}
        >
          {chapter.description}
        </motion.p>

        {/* Meta info row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: '📋', label: `${chapter.question_count} soal` },
            { icon: '⏱', label: formatTimer(chapter.timer_seconds) },
            {
              icon: '💡',
              label: `Hint ${formatHintPenalty(chapter.hint_penalty_seconds)}`,
            },
            { icon: '👥', label: `${chapter.participants} peserta` },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: 'rgba(221,219,216,0.5)',
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          {/* Primary CTA */}
          <Link href={`/game/${chapter.slug}`} style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{
                scale: 1.03,
                boxShadow: `0 12px 48px ${chapter.color}50`,
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '15px 36px',
                background: chapter.color,
                borderRadius: 4,
                fontFamily: 'var(--font-barlow)',
                fontWeight: 900,
                fontSize: '0.88rem',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'white',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s',
              }}
            >
              <span>Mulai Hunt</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </motion.div>
          </Link>

          {/* Secondary */}
          <Link href="/game/chapters" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '15px 28px',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 4,
                fontFamily: 'var(--font-barlow)',
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--ws-sand)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              Semua Chapter
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.52rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(221,219,216,0.25)',
          }}
        >
          scroll
        </span>
        <motion.div
          animate={{ height: [16, 28, 16] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            width: 1,
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}

// ── No Ongoing Chapter ────────────────────────────────────────────
function NoOngoingHero({ userName }: { userName: string }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#070d0e',
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.6rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--ws-red)',
            marginBottom: 14,
          }}
        >
          City Hunt
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{
            fontFamily: 'var(--font-barlow)',
            fontWeight: 900,
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            color: 'rgba(221,219,216,0.15)',
            letterSpacing: '-0.02em',
            marginBottom: 32,
          }}
        >
          TIDAK ADA
          <br />
          CHAPTER AKTIF
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.88rem',
            color: 'var(--ws-gray)',
            marginBottom: 36,
          }}
        >
          Chapter berikutnya segera hadir. Pantau terus halaman chapters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <Link
            href="/game/chapters"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 32px',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 4,
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--ws-sand)',
              textDecoration: 'none',
            }}
          >
            Lihat Semua Chapter →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ── Rewards Preview Section ───────────────────────────────────────
function RewardsSection() {
  return (
    <section
      style={{
        background: '#070d0e',
        padding: '80px max(5%, 48px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top divider */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(236,43,37,0.3), transparent)',
        }}
      />

      {/* Ghost text */}
      <div
        style={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-barlow)',
          fontWeight: 900,
          fontSize: 'clamp(6rem, 15vw, 12rem)',
          color: 'rgba(255,255,255,0.02)',
          letterSpacing: '-0.03em',
          userSelect: 'none',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        REWARDS
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 44,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.6rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--ws-gold)',
                marginBottom: 8,
              }}
            >
              Yang Bisa Kamu Menangkan
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-barlow)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                textTransform: 'uppercase',
                color: 'var(--ws-cream)',
                lineHeight: 0.92,
                letterSpacing: '-0.01em',
              }}
            >
              Rewards
              <br />
              <span
                style={{
                  color: 'rgba(221,219,216,0.2)',
                  fontSize: '0.5em',
                  letterSpacing: '0.1em',
                }}
              >
                Chapter Ini
              </span>
            </h2>
          </div>

          <Link
            href="/game/rewards"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.68rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--ws-gray)',
              textDecoration: 'none',
              transition: 'color 0.2s',
              paddingBottom: 4,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-gold)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)')
            }
          >
            Lihat Semua Rewards →
          </Link>
        </div>

        {/* Reward cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {REWARDS_PREVIEW.map((reward, i) => (
            <motion.div
              key={reward.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid ${reward.color}20`,
                borderRadius: 10,
                padding: '28px 24px',
                overflow: 'hidden',
                transition: 'border-color 0.3s, transform 0.3s',
              }}
              whileHover={{
                y: -6,
                borderColor: reward.color + '50',
              }}
            >
              {/* Top accent */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: reward.color,
                  opacity: 0.5,
                }}
              />

              {/* Icon + value row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: `${reward.color}12`,
                    border: `1px solid ${reward.color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}
                >
                  {reward.icon}
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    color: reward.color,
                    letterSpacing: '1px',
                    padding: '4px 10px',
                    background: `${reward.color}10`,
                    border: `1px solid ${reward.color}25`,
                    borderRadius: 20,
                  }}
                >
                  {reward.value}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  color: 'var(--ws-cream)',
                  marginBottom: 6,
                  lineHeight: 1.1,
                }}
              >
                {reward.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.78rem',
                  color: 'var(--ws-gray)',
                  lineHeight: 1.5,
                }}
              >
                {reward.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function GameHomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?from=/game')
    }
  }, [user, authLoading, router])

  const ongoingChapters = getOngoingChapters()
  const activeChapter = ongoingChapters[0] ?? null

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#070d0e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 28,
            height: 28,
            border: '2px solid rgba(255,255,255,0.08)',
            borderTopColor: 'var(--ws-red)',
            borderRadius: '50%',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ background: '#070d0e' }}>
      <GameNav />

      {/* Hero */}
      {activeChapter ? (
        <HeroChapter chapter={activeChapter} userName={user.name} />
      ) : (
        <NoOngoingHero userName={user.name} />
      )}

      {/* Rewards preview */}
      <RewardsSection />
    </div>
  )
}