'use client'
// app/game/chapters/page.tsx

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'

type ChapterStatus = 'ongoing' | 'completed' | 'expired' | 'upcoming'

interface Chapter {
  id: number
  title: string
  location: string
  city: string
  date_start: string
  date_end: string
  status: ChapterStatus
  question_count: number
  participants: number
  winner?: string
  description: string
  tags: string[]
}

// ── DUMMY DATA ────────────────────────────────────────────────────
const CHAPTERS: Chapter[] = [
  {
    id: 4,
    title: 'Kota Dalam Diam',
    location: 'Kota Lama Semarang',
    city: 'Semarang',
    date_start: '2026-03-10',
    date_end: '2026-04-10',
    status: 'ongoing',
    question_count: 8,
    participants: 34,
    description: 'Telusuri sudut-sudut tersembunyi Kota Lama. Temukan cerita di balik bangunan tua yang diam menyimpan sejarah.',
    tags: ['Heritage', 'Sejarah', 'Arsitektur'],
  },
  {
    id: 3,
    title: 'Malam Tanpa Batas',
    location: 'Kawasan Braga',
    city: 'Bandung',
    date_start: '2025-11-01',
    date_end: '2025-12-31',
    status: 'expired',
    question_count: 10,
    participants: 87,
    winner: 'Rizky Aditya',
    description: 'Jelajahi Braga di malam hari. Setiap lampu, setiap sudut menyimpan tantangan yang menguji ketajaman mata dan pikiran.',
    tags: ['Malam', 'Urban', 'Seni'],
  },
  {
    id: 2,
    title: 'Jejak Rempah',
    location: 'Pasar Beringharjo & Kraton',
    city: 'Yogyakarta',
    date_start: '2025-07-15',
    date_end: '2025-09-15',
    status: 'expired',
    question_count: 12,
    participants: 112,
    winner: 'Siti Rahma',
    description: 'Ikuti jalur perdagangan rempah yang pernah mengubah dunia. Dari pasar kuno hingga keraton, sejarah berbicara.',
    tags: ['Budaya', 'Kuliner', 'Sejarah'],
  },
  {
    id: 1,
    title: 'Akar Kota',
    location: 'Kawasan Kota Tua',
    city: 'Jakarta',
    date_start: '2025-02-01',
    date_end: '2025-04-30',
    status: 'expired',
    question_count: 6,
    participants: 58,
    winner: 'Bimo Wicaksono',
    description: 'Chapter perdana Wondershock City Hunt. Menggali akar sejarah ibu kota dari sudut yang jarang diperhatikan.',
    tags: ['Perdana', 'Sejarah', 'Jakarta'],
  },
  {
    id: 5,
    title: 'Pulau Seribu Cerita',
    location: 'Kepulauan Seribu',
    city: 'DKI Jakarta',
    date_start: '2026-06-01',
    date_end: '2026-07-31',
    status: 'upcoming',
    question_count: 0,
    participants: 0,
    description: 'Chapter berikutnya membawa kamu ke lautan. Segera hadir — persiapkan dirimu.',
    tags: ['Laut', 'Alam', 'Eksklusif'],
  },
]

const STATUS_CONFIG: Record<ChapterStatus, { label: string; color: string; bg: string; dot: string }> = {
  ongoing:   { label: 'Sedang Berlangsung', color: '#4ade80', bg: 'rgba(74,222,128,0.08)',   dot: '#4ade80' },
  completed: { label: 'Selesai',            color: 'var(--ws-gold)', bg: 'rgba(246,188,5,0.08)', dot: 'var(--ws-gold)' },
  expired:   { label: 'Berakhir',           color: 'var(--ws-gray)', bg: 'rgba(255,255,255,0.04)', dot: 'rgba(221,219,216,0.3)' },
  upcoming:  { label: 'Segera Hadir',       color: 'var(--ws-red)',  bg: 'rgba(236,43,37,0.07)',  dot: 'var(--ws-red)' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ChapterCard({ chapter, index }: { chapter: Chapter; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[chapter.status]
  const isOngoing = chapter.status === 'ongoing'
  const isUpcoming = chapter.status === 'upcoming'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        border: `1px solid ${isOngoing ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        background: isOngoing ? 'rgba(74,222,128,0.03)' : 'rgba(255,255,255,0.015)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Main row */}
      <div
        style={{ padding: '24px 28px', cursor: 'pointer', display: 'flex', gap: 24, alignItems: 'flex-start' }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Chapter number */}
        <div style={{
          flexShrink: 0, width: 48, height: 48, borderRadius: 8,
          background: isOngoing ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isOngoing ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: '1.1rem', color: isOngoing ? '#4ade80' : 'rgba(221,219,216,0.3)',
          }}>
            {String(chapter.id).padStart(2, '0')}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            {/* Status badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: cfg.bg, border: `1px solid ${cfg.color}30`,
              borderRadius: 20, padding: '3px 10px',
            }}>
              {isOngoing && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }}
                />
              )}
              {!isOngoing && (
                <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
              )}
              <span style={{
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.58rem', letterSpacing: '1.5px',
                textTransform: 'uppercase', color: cfg.color,
              }}>{cfg.label}</span>
            </div>

            {/* Tags */}
            {chapter.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem',
                color: 'rgba(221,219,216,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '2px 8px',
              }}>{tag}</span>
            ))}
          </div>

          <h3 style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            textTransform: 'uppercase', lineHeight: 1,
            color: isUpcoming ? 'rgba(221,219,216,0.3)' : 'var(--ws-cream)',
            marginBottom: 6,
          }}>
            {isUpcoming ? '???' : chapter.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem' }}>📍</span>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
              color: 'var(--ws-gray)',
            }}>{chapter.location}, {chapter.city}</span>
            <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.6rem' }}>·</span>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem',
              color: 'rgba(221,219,216,0.35)',
            }}>{formatDate(chapter.date_start)} — {formatDate(chapter.date_end)}</span>
          </div>
        </div>

        {/* Right: stats + expand */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {!isUpcoming && (
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--ws-cream)', lineHeight: 1 }}>{chapter.question_count}</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.58rem', color: 'var(--ws-gray)', letterSpacing: '0.1em', marginTop: 2 }}>SOAL</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--ws-cream)', lineHeight: 1 }}>{chapter.participants}</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.58rem', color: 'var(--ws-gray)', letterSpacing: '0.1em', marginTop: 2 }}>PESERTA</p>
              </div>
            </div>
          )}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ color: 'rgba(221,219,216,0.25)', fontSize: '0.7rem', marginTop: 4 }}
          >▼</motion.span>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 28px 24px 100px',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              paddingTop: 20,
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem',
                color: 'var(--ws-gray)', lineHeight: 1.75, marginBottom: 16,
              }}>{chapter.description}</p>

              {chapter.winner && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(246,188,5,0.07)',
                  border: '1px solid rgba(246,188,5,0.2)',
                  borderRadius: 6, padding: '8px 14px',
                }}>
                  <span>🏆</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--ws-gray)' }}>
                    Pemenang: <span style={{ color: 'var(--ws-gold)', fontWeight: 600 }}>{chapter.winner}</span>
                  </span>
                </div>
              )}

              {isOngoing && (
                <div style={{ marginTop: 16 }}>
                  <Link href="/game" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 24px',
                    background: 'var(--ws-red)', borderRadius: 4,
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.72rem', letterSpacing: '2px',
                    textTransform: 'uppercase', color: 'white',
                    textDecoration: 'none',
                  }}>Mainkan Sekarang →</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function ChaptersPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [filter, setFilter] = useState<ChapterStatus | 'all'>('all')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?from=/game/chapters')
  }, [user, authLoading]) // eslint-disable-line

  const filtered = filter === 'all' ? CHAPTERS : CHAPTERS.filter(c => c.status === filter)
  const ongoingCount = CHAPTERS.filter(c => c.status === 'ongoing').length

  const handleLogout = () => { logout(); router.push('/') }

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#070d0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--ws-red)', borderRadius: '50%' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070d0e', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(236,43,37,0.1) 0%, transparent 65%)' }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid rgba(221,219,216,0.06)',
        background: 'rgba(7,13,14,0.92)', backdropFilter: 'blur(14px)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 48px', height: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 32, paddingRight: 36 }}>
            <Link href="/game/chapters" style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ws-cream)', textDecoration: 'none' }}>Chapters</Link>
          </div>
          <Link href="/game" style={{ flexShrink: 0, display: 'block' }}>
            <div style={{ position: 'relative', width: 180, height: 72 }}>
              <img src="/assets/logo-white.png" alt="Wondershock Theatre" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 36, gap: 24 }}>
            <Link href="/game/rewards" style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ws-gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🏆</span> Rewards
            </Link>
            <div style={{ flex: 1 }} />
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ws-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '0.65rem', color: 'white' }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'rgba(221,219,216,0.55)' }}>{user.name.split(' ')[0]}</span>
              </div>
            )}
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '6px 14px', color: 'rgba(221,219,216,0.4)', fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Keluar</button>
          </div>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '120px 24px 80px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--ws-red)', marginBottom: 12 }}>
            City Hunt
          </p>
          <h1 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', textTransform: 'uppercase', lineHeight: 0.92, color: 'var(--ws-cream)', marginBottom: 16 }}>
            LOG<br />
            <span style={{ color: 'rgba(221,219,216,0.2)', fontSize: '0.55em', letterSpacing: '0.08em' }}>CHAPTERS</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--ws-gray)', lineHeight: 1.7, maxWidth: 480 }}>
            Semua chapter City Hunt yang pernah dan sedang berlangsung.
            {ongoingCount > 0 && <span style={{ color: '#4ade80' }}> {ongoingCount} chapter sedang aktif sekarang.</span>}
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {([
            { key: 'all', label: 'Semua' },
            { key: 'ongoing', label: '● Aktif' },
            { key: 'expired', label: 'Berakhir' },
            { key: 'upcoming', label: 'Segera' },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              style={{
                background: filter === tab.key ? 'var(--ws-red)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === tab.key ? 'var(--ws-red)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 20, padding: '6px 16px',
                color: filter === tab.key ? 'white' : 'var(--ws-gray)',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.65rem', letterSpacing: '1.5px',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >{tab.label}</button>
          ))}
        </motion.div>

        {/* Chapter list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((chapter, i) => (
              <ChapterCard key={chapter.id} chapter={chapter} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 48, textAlign: 'center' }}>
          <Link href="/game" style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ws-gray)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)'}
          >← Kembali ke Game</Link>
        </motion.div>
      </main>
    </div>
  )
}