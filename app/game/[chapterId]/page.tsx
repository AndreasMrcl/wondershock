'use client'
// app/game/[chapterId]/page.tsx — Briefing page.
// Saat "Mulai Hunt" diklik:
//   1. Buat session di backend
//   2. Simpan ke localStorage (ws_play_session)
//   3. Redirect ke /game/[slug]/play

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import GameNav from '@/components/game/GameNav'
import {
  getChapterBySlug,
  formatTimer,
  formatHintPenalty,
  formatDate,
  type Chapter,
} from '@/lib/chapters'
import { sessionsApi } from '@/lib/gameApi'

// ── localStorage helper (sama dengan play/page.tsx) ───────────────
const LS_KEY = 'ws_play_session'

interface StoredSession {
  sessionId: string
  chapterSlug: string
  startedAt: string
  chapterTimerSeconds: number
  penalisedSeconds: number
}

function saveSession(data: StoredSession) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// GameNav is now a shared component at components/game/GameNav.tsx

// ── Stat pill ─────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }: {
  icon: string; label: string; value: string; color: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      background: `${color}06`, border: `1px solid ${color}18`,
      borderRadius: 10, padding: '16px 18px',
    }}>
      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: '1rem', color: 'var(--ws-cream)', lineHeight: 1, marginBottom: 5,
        }}>{value}</p>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem',
          color: 'var(--ws-gray)', lineHeight: 1.4,
        }}>{label}</p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ChapterBriefingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const slug = typeof params.chapterId === 'string' ? params.chapterId : ''
  const chapter = getChapterBySlug(slug)

  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')
  // Jika ada session aktif untuk chapter ini
  const [hasActiveSession, setHasActiveSession] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?from=/game/${slug}`)
    }
  }, [user, authLoading, router, slug])

  // Cek apakah ada session aktif di localStorage untuk chapter ini
  useEffect(() => {
    const stored = loadSession()
    if (stored && stored.chapterSlug === slug) {
      // Hitung apakah masih valid
      const elapsedMs = Date.now() - new Date(stored.startedAt).getTime()
      const elapsedSec = Math.floor(elapsedMs / 1000)
      const used = elapsedSec + stored.penalisedSeconds
      const timeLeft = Math.max(0, stored.chapterTimerSeconds - used)
      setHasActiveSession(timeLeft > 0)
    }
  }, [slug])

  // 404
  if (!authLoading && !chapter) {
    return (
      <div style={{
        minHeight: '100vh', background: '#070d0e',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
      }}>
        <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '4rem', color: 'rgba(221,219,216,0.08)' }}>404</p>
        <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--ws-gray)', fontSize: '0.9rem' }}>
          Chapter tidak ditemukan.
        </p>
        <Link href="/game/chapters" style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 700,
          fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--ws-red)', textDecoration: 'none',
        }}>← Kembali ke Chapters</Link>
      </div>
    )
  }

  // Loading
  if (authLoading || !chapter || !user) {
    return (
      <div style={{
        minHeight: '100vh', background: '#070d0e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 28, height: 28,
            border: '2px solid rgba(255,255,255,0.08)',
            borderTopColor: 'var(--ws-red)', borderRadius: '50%',
          }}
        />
      </div>
    )
  }

  const isOngoing = chapter.status === 'ongoing'
  const isUpcoming = chapter.status === 'upcoming'
  const color = chapter.color

  const handleStart = async () => {
    setStarting(true)
    setStartError('')
    try {
      // Buat session di backend
      const res = await sessionsApi.start()

      // Simpan ke localStorage
      const stored: StoredSession = {
        sessionId: res.session.id,
        chapterSlug: slug,
        startedAt: new Date().toISOString(),
        chapterTimerSeconds: chapter.timer_seconds,
        penalisedSeconds: 0,
      }
      saveSession(stored)

      // Redirect ke play page
      router.push(`/game/${slug}/play`)
    } catch (e: unknown) {
      setStartError(
        e instanceof Error ? e.message : 'Gagal memulai sesi. Coba lagi.'
      )
      setStarting(false)
    }
  }

  const handleResume = () => {
    router.push(`/game/${slug}/play`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070d0e', position: 'relative', overflow: 'hidden' }}>
      <GameNav accentColor={color} />

      {/* ── Background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <motion.img
          src={chapter.bg_image} alt=""
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'grayscale(35%) brightness(0.2) contrast(1.15)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${color}18 0%, transparent 65%)`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(7,13,14,0.55) 0%, rgba(7,13,14,0.8) 55%, rgba(7,13,14,0.98) 100%)',
        }} />
      </div>

      {/* ── Content ── */}
      <main style={{
        position: 'relative', zIndex: 1,
        maxWidth: 780, margin: '0 auto',
        padding: '120px max(5%, 32px) 80px',
      }}>

        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ marginBottom: 40 }}
        >
          <Link href="/game/chapters" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-barlow)', fontWeight: 700,
            fontSize: '0.65rem', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--ws-gray)',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)'}
          >← Semua Chapter</Link>
        </motion.div>

        {/* ── Header ── */}
        <div style={{ marginBottom: 56 }}>
          {/* Status + tags */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}
          >
            {isOngoing && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 20, padding: '4px 12px',
              }}>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }}
                />
                <span style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.6rem', letterSpacing: '2px',
                  textTransform: 'uppercase', color: '#4ade80',
                }}>Sedang Berlangsung</span>
              </div>
            )}
            {isUpcoming && (
              <div style={{
                display: 'inline-flex', background: `${color}10`,
                border: `1px solid ${color}30`, borderRadius: 20, padding: '4px 12px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.6rem', letterSpacing: '2px',
                  textTransform: 'uppercase', color,
                }}>Segera Hadir</span>
              </div>
            )}
            {chapter.status === 'expired' && (
              <div style={{
                display: 'inline-flex', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.6rem', letterSpacing: '2px',
                  textTransform: 'uppercase', color: 'var(--ws-gray)',
                }}>Berakhir</span>
              </div>
            )}
            {chapter.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem',
                color: 'rgba(221,219,216,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '3px 10px',
              }}>{tag}</span>
            ))}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              textTransform: 'uppercase', lineHeight: 0.88,
              color: 'var(--ws-cream)', letterSpacing: '-0.02em', marginBottom: 20,
            }}
          >
            {isUpcoming ? <span style={{ color: 'rgba(221,219,216,0.2)' }}>???</span> : chapter.title}
          </motion.h1>

          {/* Location + dates */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: '0.8rem' }}>📍</span>
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-sand)' }}>
                {chapter.location}, {chapter.city}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: '0.8rem' }}>📅</span>
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-gray)' }}>
                {formatDate(chapter.date_start)} — {formatDate(chapter.date_end)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── Two column ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 300px',
          gap: 32, alignItems: 'start',
        }}>

          {/* LEFT */}
          <div>
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ marginBottom: 36 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 3, height: 20, background: color, flexShrink: 0 }} />
                <h2 style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.72rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'var(--ws-cream)',
                }}>Tentang Chapter</h2>
              </div>
              <p style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem',
                color: 'var(--ws-sand)', lineHeight: 1.8,
              }}>{chapter.description}</p>
            </motion.div>

            {/* Rules — hanya ongoing */}
            {isOngoing && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 20, background: color, flexShrink: 0 }} />
                  <h2 style={{
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.72rem', letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'var(--ws-cream)',
                  }}>Aturan Main</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    {
                      icon: '⏱',
                      label: `Timer ${formatTimer(chapter.timer_seconds)}`,
                      value: 'Satu timer untuk seluruh chapter — bukan per soal',
                    },
                    {
                      icon: '💡',
                      label: `Hint = ${formatHintPenalty(chapter.hint_penalty_seconds)}`,
                      value: 'Setiap kali pakai hint, timer chapter berkurang',
                    },
                    {
                      icon: '✏',
                      label: 'Format Jawaban',
                      value: 'Teks, foto, atau video sesuai petunjuk soal',
                    },
                    {
                      icon: '❌',
                      label: 'Jawaban Salah',
                      value: 'Tidak ada penalti timer, coba ulang sampai benar',
                    },
                  ].map(rule => (
                    <div key={rule.label} style={{
                      background: `${color}05`, border: `1px solid ${color}12`,
                      borderRadius: 8, padding: '14px 16px',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{rule.icon}</span>
                      <div>
                        <p style={{
                          fontFamily: 'var(--font-barlow)', fontWeight: 700,
                          fontSize: '0.68rem', letterSpacing: '0.5px',
                          color, textTransform: 'uppercase', marginBottom: 4,
                        }}>{rule.label}</p>
                        <p style={{
                          fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem',
                          color: 'var(--ws-gray)', lineHeight: 1.5,
                        }}>{rule.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

          {/* RIGHT: stats card + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {/* Stats */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: `1px solid ${color}25`, borderRadius: 10, padding: '24px 20px',
            }}>
              <div style={{ width: 32, height: 2, background: color, marginBottom: 20 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <StatPill icon="📋" label="Total soal dalam chapter ini" value={`${chapter.question_count} soal`} color={color} />
                <StatPill icon="⏱" label="Total waktu pengerjaan" value={formatTimer(chapter.timer_seconds)} color={color} />
                <StatPill icon="💡" label="Penalti per hint" value={formatHintPenalty(chapter.hint_penalty_seconds)} color={color} />
                <StatPill icon="👥" label="Peserta yang sudah ikut" value={`${chapter.participants} orang`} color={color} />
              </div>
            </div>

            {/* CTA */}
            {isOngoing ? (
              <>
                {/* Ada session aktif → resume */}
                {hasActiveSession ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Resume button */}
                    <motion.button
                      onClick={handleResume}
                      whileHover={{ scale: 1.02, boxShadow: `0 8px 32px ${color}40` }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%', padding: '16px',
                        background: color, border: 'none', borderRadius: 6,
                        color: 'white', fontFamily: 'var(--font-barlow)',
                        fontWeight: 900, fontSize: '0.88rem',
                        letterSpacing: '3px', textTransform: 'uppercase',
                        cursor: 'pointer', transition: 'box-shadow 0.3s',
                      }}
                    >
                      LANJUTKAN HUNT →
                    </motion.button>

                    {/* Start new */}
                    <button
                      onClick={handleStart}
                      disabled={starting}
                      style={{
                        width: '100%', padding: '11px',
                        background: 'transparent',
                        border: `1px solid ${color}30`,
                        borderRadius: 6, color: `${color}80`,
                        fontFamily: 'var(--font-barlow)', fontWeight: 700,
                        fontSize: '0.68rem', letterSpacing: '1.5px',
                        textTransform: 'uppercase', cursor: starting ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLElement).style.borderColor = `${color}60`
                        ;(e.currentTarget as HTMLElement).style.color = color
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLElement).style.borderColor = `${color}30`
                        ;(e.currentTarget as HTMLElement).style.color = `${color}80`
                      }}
                    >
                      {starting ? 'Memulai...' : 'Mulai Baru (reset timer)'}
                    </button>

                    <p style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem',
                      color: 'rgba(246,188,5,0.6)', textAlign: 'center',
                      lineHeight: 1.5, padding: '0 4px',
                    }}>
                      ⚠ Kamu punya sesi yang sedang berjalan. Melanjutkan akan meneruskan timer dari sisa waktu.
                    </p>
                  </div>
                ) : (
                  // Tidak ada session → mulai baru
                  <>
                    <motion.button
                      onClick={handleStart}
                      disabled={starting}
                      whileHover={{ scale: starting ? 1 : 1.02, boxShadow: starting ? 'none' : `0 8px 32px ${color}40` }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: '100%', padding: '16px',
                        background: starting ? `${color}60` : color,
                        border: 'none', borderRadius: 6,
                        color: 'white', fontFamily: 'var(--font-barlow)',
                        fontWeight: 900, fontSize: '0.88rem',
                        letterSpacing: '3px', textTransform: 'uppercase',
                        cursor: starting ? 'wait' : 'pointer',
                        transition: 'box-shadow 0.3s, background 0.2s',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 10,
                      }}
                    >
                      {starting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            style={{
                              display: 'inline-block', width: 14, height: 14,
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTopColor: 'white', borderRadius: '50%',
                            }}
                          />
                          Memulai...
                        </>
                      ) : 'MULAI HUNT →'}
                    </motion.button>

                    {startError && (
                      <p style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem',
                        color: 'var(--ws-red)', textAlign: 'center',
                        paddingLeft: 10, borderLeft: '2px solid var(--ws-red)',
                      }}>
                        {startError}
                      </p>
                    )}

                    <p style={{
                      fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem',
                      color: 'var(--ws-gray)', textAlign: 'center', lineHeight: 1.6,
                    }}>
                      Timer dimulai saat kamu memasuki halaman quiz.
                    </p>
                  </>
                )}
              </>
            ) : isUpcoming ? (
              <div style={{
                width: '100%', padding: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, textAlign: 'center',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.75rem', letterSpacing: '2px',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
              }}>Belum Tersedia</div>
            ) : (
              <div style={{
                width: '100%', padding: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, textAlign: 'center',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.75rem', letterSpacing: '2px',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
              }}>Chapter Sudah Berakhir</div>
            )}
          </motion.div>
        </div>
      </main>

      <style>{`
        @media (max-width: 680px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}