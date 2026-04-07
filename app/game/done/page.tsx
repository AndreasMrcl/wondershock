'use client'
// app/game/done/page.tsx
// Halaman hasil akhir setelah quiz selesai atau timer habis.
// Query params: ?chapter=[slug]&reason=[done|expired]&timeLeft=[seconds]

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { getChapterBySlug, formatTimer, type Chapter } from '@/lib/chapters'

function formatTimeLeft(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h} jam ${m} mnt ${s} dtk`
  if (m > 0) return `${m} menit ${s} detik`
  return `${s} detik`
}

function DoneContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const chapterSlug = searchParams.get('chapter') ?? ''
  const reason = searchParams.get('reason') ?? 'done'
  const timeLeftRaw = parseInt(searchParams.get('timeLeft') ?? '0', 10)
  const timeLeft = isNaN(timeLeftRaw) ? 0 : timeLeftRaw

  const chapter = getChapterBySlug(chapterSlug)
  const isExpired = reason === 'expired'
  const color = chapter?.color ?? 'var(--ws-red)'

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?from=/game')
    }
  }, [user, authLoading, router])

  // Confetti dots — hanya jika selesai normal
  const confettiColors = [color, 'var(--ws-gold)', 'var(--ws-sand)', '#4ade80']

  if (authLoading || !user) {
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
            borderTopColor: 'var(--ws-red)',
            borderRadius: '50%',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070d0e',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
    }}>

      {/* ── Background chapter foto ── */}
      {chapter && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <img
            src={chapter.bg_image}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(60%) brightness(0.12) contrast(1.1)',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${color}10 0%, transparent 65%)`,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(7,13,14,0.9)',
          }} />
        </div>
      )}

      {/* ── Confetti — hanya saat done ── */}
      {!isExpired && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
          {[...Array(30)].map((_, i) => {
            const left = 3 + Math.random() * 94 // 3% – 97% spread across screen
            const size = 4 + Math.random() * 8
            const delay = 0.2 + Math.random() * 1.2
            const duration = 2 + Math.random() * 2
            const drift = -40 + Math.random() * 80 // horizontal drift
            return (
              <motion.div
                key={i}
                initial={{
                  y: -20,
                  x: 0,
                  opacity: 1,
                  rotate: Math.random() * 360,
                }}
                animate={{
                  y: '110vh',
                  x: drift,
                  opacity: [1, 1, 0.8, 0],
                  rotate: Math.random() * 720,
                }}
                transition={{
                  delay,
                  duration,
                  ease: 'easeIn',
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${left}%`,
                  width: size,
                  height: size,
                  borderRadius: i % 2 === 0 ? '50%' : 2,
                  background: confettiColors[i % confettiColors.length],
                }}
              />
            )
          })}
        </div>
      )}

      {/* ── Main content ── */}
      <div style={{
        position: 'relative', zIndex: 3,
        maxWidth: 560, width: '100%',
        textAlign: 'center',
      }}>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 32 }}
        >
          {isExpired ? (
            // Jam merah untuk expired
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(236,43,37,0.1)',
              border: '2px solid rgba(236,43,37,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              fontSize: '2.5rem',
            }}>
              ⏰
            </div>
          ) : (
            // Trofi untuk selesai
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: `${color}12`,
                border: `2px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                fontSize: '2.5rem',
                boxShadow: `0 0 40px ${color}20`,
              }}
            >
              🏆
            </motion.div>
          )}
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.6rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: isExpired ? 'var(--ws-red)' : color,
            marginBottom: 12,
          }}
        >
          {isExpired ? 'Waktu Habis' : 'Hunt Selesai!'}
        </motion.p>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.7 }}
          style={{
            fontFamily: 'var(--font-barlow)',
            fontWeight: 900,
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            textTransform: 'uppercase',
            lineHeight: 0.9,
            color: 'var(--ws-cream)',
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}
        >
          {isExpired ? (
            <>
              WAKTU<br />
              <span style={{ color: 'var(--ws-red)' }}>HABIS!</span>
            </>
          ) : (
            <>
              LUAR BIASA,<br />
              <span style={{ color }}>
                {user.name.split(' ')[0].toUpperCase()}!
              </span>
            </>
          )}
        </motion.h1>

        {/* Chapter info */}
        {chapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: `${color}08`,
              border: `1px solid ${color}20`,
              borderRadius: 20,
              padding: '6px 16px',
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: '0.7rem' }}>📍</span>
            <span style={{
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.62rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color,
            }}>
              {chapter.title} · {chapter.city}
            </span>
          </motion.div>
        )}

        {/* Body text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.52 }}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.9rem',
            color: 'var(--ws-gray)',
            lineHeight: 1.75,
            marginBottom: 32,
          }}
        >
          {isExpired
            ? 'Waktu chapter habis sebelum semua soal terjawab. Tapi setiap perjalanan adalah pengalaman berharga.'
            : 'Kamu berhasil menyelesaikan semua soal. Terima kasih sudah ikut City Hunt bersama Wondershock Theatre!'}
        </motion.p>

        {/* Sisa waktu card — hanya saat done */}
        {!isExpired && timeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              background: `${color}08`,
              border: `1px solid ${color}20`,
              borderRadius: 8,
              padding: '14px 24px',
              marginBottom: 40,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>⏱</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{
                fontFamily: 'var(--font-barlow)',
                fontWeight: 900,
                fontSize: '1.3rem',
                color,
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}>
                {formatTimeLeft(timeLeft)}
              </p>
              <p style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.62rem',
                color: 'var(--ws-gray)',
                marginTop: 4,
                letterSpacing: '0.08em',
              }}>
                sisa waktu
              </p>
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${color}30, transparent)`,
            marginBottom: 36,
          }}
        />

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Coba lagi — hanya saat expired */}
          {isExpired && chapter && (
            <Link
              href={`/game/${chapterSlug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '13px 28px',
                background: color,
                border: `1px solid ${color}`,
                color: 'white',
                borderRadius: 4,
                fontFamily: 'var(--font-barlow)',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Coba Lagi →
            </Link>
          )}

          {/* Lihat rewards */}
          <Link
            href="/game/rewards"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 24px',
              background: isExpired ? 'transparent' : `${color}12`,
              border: `1px solid ${isExpired ? 'rgba(255,255,255,0.1)' : color + '30'}`,
              color: isExpired ? 'var(--ws-sand)' : color,
              borderRadius: 4,
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            🏆 Lihat Rewards
          </Link>

          {/* Beranda */}
          <Link
            href="/game"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 24px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--ws-gray)',
              borderRadius: 4,
              fontFamily: 'var(--font-barlow)',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'
              ;(e.currentTarget as HTMLElement).style.borderColor =
                'rgba(255,255,255,0.25)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)'
              ;(e.currentTarget as HTMLElement).style.borderColor =
                'rgba(255,255,255,0.1)'
            }}
          >
            ← Beranda
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function DonePage() {
  return (
    <Suspense>
      <DoneContent />
    </Suspense>
  )
}