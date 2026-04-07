'use client'
// app/game/chapters/page.tsx
// List semua chapter City Hunt — riwayat & status.
// Data dari lib/chapters.ts (bukan hardcode di sini).

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import GameNav from '@/components/game/GameNav'
import {
  CHAPTERS,
  formatDate,
  formatTimer,
  formatHintPenalty,
  type Chapter,
  type ChapterStatus,
} from '@/lib/chapters'

// ── Status config ─────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ChapterStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  ongoing: {
    label: 'Sedang Berlangsung',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    dot: '#4ade80',
  },
  expired: {
    label: 'Berakhir',
    color: 'var(--ws-gray)',
    bg: 'rgba(255,255,255,0.04)',
    dot: 'rgba(221,219,216,0.3)',
  },
  upcoming: {
    label: 'Segera Hadir',
    color: 'var(--ws-red)',
    bg: 'rgba(236,43,37,0.07)',
    dot: 'var(--ws-red)',
  },
}

// ── Chapter Card ──────────────────────────────────────────────────
function ChapterCard({
  chapter,
  index,
}: {
  chapter: Chapter
  index: number
}) {
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
        border: `1px solid ${
          isOngoing ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'
        }`,
        borderRadius: 10,
        overflow: 'hidden',
        background: isOngoing
          ? 'rgba(74,222,128,0.025)'
          : 'rgba(255,255,255,0.015)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Main row — klik untuk expand */}
      <div
        style={{
          padding: '24px 28px',
          cursor: 'pointer',
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Chapter number */}
        <div
          style={{
            flexShrink: 0,
            width: 48,
            height: 48,
            borderRadius: 8,
            background: isOngoing
              ? 'rgba(74,222,128,0.1)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${
              isOngoing
                ? 'rgba(74,222,128,0.2)'
                : 'rgba(255,255,255,0.07)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 900,
              fontSize: '1.1rem',
              color: isOngoing ? '#4ade80' : 'rgba(221,219,216,0.3)',
            }}
          >
            {String(chapter.id).padStart(2, '0')}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Status badge + tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: cfg.bg,
                border: `1px solid ${cfg.color}30`,
                borderRadius: 20,
                padding: '3px 10px',
              }}
            >
              {isOngoing ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    display: 'block',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: cfg.dot,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <span
                  style={{
                    display: 'block',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: cfg.dot,
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 700,
                  fontSize: '0.58rem',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: cfg.color,
                }}
              >
                {cfg.label}
              </span>
            </div>

            {chapter.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.62rem',
                  color: 'rgba(221,219,216,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  padding: '2px 8px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 900,
              fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: isUpcoming
                ? 'rgba(221,219,216,0.25)'
                : 'var(--ws-cream)',
              marginBottom: 8,
            }}
          >
            {isUpcoming ? '???' : chapter.title}
          </h3>

          {/* Location + dates */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>📍</span>
            <span
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.78rem',
                color: 'var(--ws-gray)',
              }}
            >
              {chapter.location}, {chapter.city}
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.1)',
                fontSize: '0.6rem',
              }}
            >
              ·
            </span>
            <span
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.72rem',
                color: 'rgba(221,219,216,0.3)',
              }}
            >
              {formatDate(chapter.date_start)} — {formatDate(chapter.date_end)}
            </span>
          </div>
        </div>

        {/* Right: stats + expand arrow */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          {!isUpcoming && (
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    color: 'var(--ws-cream)',
                    lineHeight: 1,
                  }}
                >
                  {chapter.question_count}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.55rem',
                    color: 'var(--ws-gray)',
                    letterSpacing: '0.1em',
                    marginTop: 3,
                  }}
                >
                  SOAL
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 900,
                    fontSize: '1.2rem',
                    color: 'var(--ws-cream)',
                    lineHeight: 1,
                  }}
                >
                  {chapter.participants}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.55rem',
                    color: 'var(--ws-gray)',
                    letterSpacing: '0.1em',
                    marginTop: 3,
                  }}
                >
                  PESERTA
                </p>
              </div>
            </div>
          )}

          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ color: 'rgba(221,219,216,0.2)', fontSize: '0.7rem' }}
          >
            ▼
          </motion.span>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '20px 28px 24px 100px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {/* Description */}
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.85rem',
                  color: 'var(--ws-gray)',
                  lineHeight: 1.75,
                  marginBottom: 16,
                }}
              >
                {chapter.description}
              </p>

              {/* Game info pills */}
              {!isUpcoming && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6,
                      padding: '5px 12px',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem' }}>⏱</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-barlow)',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: '0.5px',
                        color: 'var(--ws-sand)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {formatTimer(chapter.timer_seconds)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(246,188,5,0.06)',
                      border: '1px solid rgba(246,188,5,0.15)',
                      borderRadius: 6,
                      padding: '5px 12px',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem' }}>💡</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-barlow)',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: '0.5px',
                        color: '#f6bc05',
                        textTransform: 'uppercase',
                      }}
                    >
                      Hint {formatHintPenalty(chapter.hint_penalty_seconds)}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA */}
              {isOngoing && (
                <div style={{ marginTop: 4 }}>
                  <Link
                    href={`/game/${chapter.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 24px',
                      background: chapter.color,
                      borderRadius: 4,
                      fontFamily: 'var(--font-barlow)',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.opacity = '0.85')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.opacity = '1')
                    }
                  >
                    Lihat & Mainkan →
                  </Link>
                </div>
              )}

              {/* Untuk expired: link ke detail (read-only) */}
              {chapter.status === 'expired' && (
                <Link
                  href={`/game/${chapter.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-barlow)',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: 'var(--ws-gray)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      'var(--ws-cream)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      'var(--ws-gray)')
                  }
                >
                  Lihat Detail →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ChaptersPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [filter, setFilter] = useState<ChapterStatus | 'all'>('all')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?from=/game/chapters')
  }, [user, authLoading, router])

  const filtered =
    filter === 'all' ? CHAPTERS : CHAPTERS.filter((c) => c.status === filter)

  const ongoingCount = CHAPTERS.filter((c) => c.status === 'ongoing').length

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (authLoading) {
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
    <div
      style={{
        minHeight: '100vh',
        background: '#070d0e',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(236,43,37,0.1) 0%, transparent 65%)',
        }}
      />

      <GameNav />

      {/* ── CONTENT ── */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 900,
          margin: '0 auto',
          padding: '120px 24px 80px',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 48 }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.6rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'var(--ws-red)',
              marginBottom: 12,
            }}
          >
            City Hunt
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              textTransform: 'uppercase',
              lineHeight: 0.92,
              color: 'var(--ws-cream)',
              marginBottom: 16,
            }}
          >
            LOG
            <br />
            <span
              style={{
                color: 'rgba(221,219,216,0.2)',
                fontSize: '0.55em',
                letterSpacing: '0.08em',
              }}
            >
              CHAPTERS
            </span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.88rem',
              color: 'var(--ws-gray)',
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            Semua chapter City Hunt yang pernah dan sedang berlangsung.
            {ongoingCount > 0 && (
              <span style={{ color: '#4ade80' }}>
                {' '}
                {ongoingCount} chapter sedang aktif sekarang.
              </span>
            )}
          </p>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}
        >
          {(
            [
              { key: 'all', label: 'Semua' },
              { key: 'ongoing', label: '● Aktif' },
              { key: 'expired', label: 'Berakhir' },
              { key: 'upcoming', label: 'Segera' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                background:
                  filter === tab.key ? 'var(--ws-red)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  filter === tab.key ? 'var(--ws-red)' : 'rgba(255,255,255,0.08)'
                }`,
                borderRadius: 20,
                padding: '6px 16px',
                color: filter === tab.key ? 'white' : 'var(--ws-gray)',
                fontFamily: 'var(--font-barlow)',
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
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

        {/* Back to game */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: 48, textAlign: 'center' }}
        >
          <Link
            href="/game"
            style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.68rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--ws-gray)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)')
            }
          >
            ← Kembali ke Game
          </Link>
        </motion.div>
      </main>
    </div>
  )
}