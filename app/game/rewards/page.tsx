'use client'
// app/game/rewards/page.tsx

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import GameNav from '@/components/game/GameNav'

type RewardType = 'voucher' | 'ticket' | 'merchandise' | 'experience'
type RewardStatus = 'available' | 'claimed' | 'expired'

interface Reward {
  id: number
  type: RewardType
  title: string
  description: string
  chapter: string
  requirement: string
  value: string
  status: RewardStatus
  claimed_by?: string
  claimed_at?: string
  expires_at?: string
  code?: string
  icon: string
  color: string
}

// ── DUMMY DATA ────────────────────────────────────────────────────
const ALL_REWARDS: Reward[] = [
  {
    id: 1,
    type: 'ticket',
    title: 'Tiket Gratis — AHA Moment #3',
    description: 'Dapatkan 2 tiket gratis untuk show AHA Moment #3. Berlaku untuk semua kategori kursi.',
    chapter: 'Kota Dalam Diam',
    requirement: 'Selesaikan semua soal dalam chapter',
    value: '2 Tiket (2×Rp 150.000)',
    status: 'available',
    expires_at: '2026-04-30',
    icon: '🎭',
    color: 'var(--ws-red)',
  },
  {
    id: 2,
    type: 'voucher',
    title: 'Voucher Workshop 50%',
    description: 'Diskon 50% untuk satu workshop pilihan. Berlaku untuk semua workshop yang akan datang.',
    chapter: 'Kota Dalam Diam',
    requirement: 'Selesaikan semua soal dalam chapter',
    value: 'Diskon 50%',
    status: 'available',
    expires_at: '2026-06-30',
    icon: '🎟',
    color: 'var(--ws-gold)',
  },
  {
    id: 3,
    type: 'merchandise',
    title: 'Kaos Eksklusif Wondershock',
    description: 'Kaos limited edition dengan desain khusus City Hunt. Dikirim ke alamat peserta.',
    chapter: 'Kota Dalam Diam',
    requirement: 'Selesaikan semua soal dalam chapter',
    value: 'Merchandise Eksklusif',
    status: 'available',
    expires_at: '2026-04-15',
    icon: '👕',
    color: '#818cf8',
  },
  {
    id: 4,
    type: 'ticket',
    title: 'Tiket Gratis — My Story. My Brand.',
    description: 'Satu tiket gratis untuk workshop My Story. My Brand. senilai Rp 250.000.',
    chapter: 'Malam Tanpa Batas',
    requirement: 'Selesaikan semua soal dalam chapter',
    value: '1 Tiket (Rp 250.000)',
    status: 'claimed',
    claimed_by: 'Rizky Aditya',
    claimed_at: '2026-01-05',
    code: 'WST-MTB-001',
    icon: '🎭',
    color: 'var(--ws-red)',
  },
  {
    id: 5,
    type: 'voucher',
    title: 'Voucher Belanja Rp 100.000',
    description: 'Voucher belanja merchandise resmi Wondershock Theatre senilai Rp 100.000.',
    chapter: 'Jejak Rempah',
    requirement: 'Selesaikan semua soal dalam chapter',
    value: 'Rp 100.000',
    status: 'claimed',
    claimed_by: 'Siti Rahma',
    claimed_at: '2025-10-12',
    code: 'WST-JR-047',
    icon: '🛍',
    color: 'var(--ws-gold)',
  },
  {
    id: 6,
    type: 'experience',
    title: 'Behind The Stage — Akses Eksklusif',
    description: 'Tur eksklusif backstage sebelum pertunjukan dimulai. Bertemu langsung dengan para performer.',
    chapter: 'Akar Kota',
    requirement: 'Selesaikan semua soal dalam chapter',
    value: 'Pengalaman Eksklusif',
    status: 'expired',
    expires_at: '2025-06-30',
    icon: '⭐',
    color: '#fb923c',
  },
]

// Rewards yang "milik" user yang sedang login (dummy — nanti dari API)
const MY_REWARD_IDS = [4, 5]

const TYPE_LABEL: Record<RewardType, string> = {
  voucher: 'Voucher',
  ticket: 'Tiket Gratis',
  merchandise: 'Merchandise',
  experience: 'Pengalaman',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function RewardCard({ reward, isMine }: { reward: Reward; isMine: boolean }) {
  const [showCode, setShowCode] = useState(false)
  const isAvailable = reward.status === 'available'
  const isClaimed = reward.status === 'claimed'
  const isExpired = reward.status === 'expired'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: isExpired ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${isAvailable ? `${reward.color}30` : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 10, overflow: 'hidden',
        opacity: isExpired ? 0.5 : 1,
        position: 'relative',
      }}
    >
      {/* Top accent line */}
      {isAvailable && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: reward.color, opacity: 0.6 }} />
      )}

      <div style={{ padding: '22px 24px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
          {/* Icon */}
          <div style={{
            width: 48, height: 48, borderRadius: 10, flexShrink: 0,
            background: `${reward.color}12`,
            border: `1px solid ${reward.color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
          }}>{reward.icon}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.55rem', letterSpacing: '1.5px', textTransform: 'uppercase',
                color: reward.color, background: `${reward.color}12`,
                border: `1px solid ${reward.color}25`,
                borderRadius: 20, padding: '2px 8px',
              }}>{TYPE_LABEL[reward.type]}</span>

              {isAvailable && (
                <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.55rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4ade80', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '2px 8px' }}>
                  Tersedia
                </span>
              )}
              {isClaimed && (
                <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.55rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ws-gold)', background: 'rgba(246,188,5,0.08)', border: '1px solid rgba(246,188,5,0.2)', borderRadius: 20, padding: '2px 8px' }}>
                  ✓ Diklaim
                </span>
              )}
              {isExpired && (
                <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.55rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--ws-gray)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 8px' }}>
                  Berakhir
                </span>
              )}

              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem', color: 'rgba(221,219,216,0.3)' }}>
                Chapter: {reward.chapter}
              </span>
            </div>

            <h3 style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
              textTransform: 'uppercase', color: isExpired ? 'rgba(221,219,216,0.4)' : 'var(--ws-cream)',
              lineHeight: 1.1,
            }}>{reward.title}</h3>
          </div>

          {/* Value badge */}
          <div style={{
            flexShrink: 0, textAlign: 'right',
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: '0.75rem', color: reward.color,
            letterSpacing: '0.05em',
          }}>{reward.value}</div>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
          color: 'var(--ws-gray)', lineHeight: 1.7, marginBottom: 14,
        }}>{reward.description}</p>

        {/* Requirement */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 6, marginBottom: 14,
        }}>
          <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>🎯</span>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'rgba(221,219,216,0.5)' }}>
            {reward.requirement}
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            {reward.expires_at && isAvailable && (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'rgba(221,219,216,0.3)' }}>
                Berlaku hingga {formatDate(reward.expires_at)}
              </p>
            )}
            {isClaimed && reward.claimed_at && (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'rgba(221,219,216,0.3)' }}>
                Diklaim oleh <span style={{ color: 'var(--ws-sand)' }}>{reward.claimed_by}</span> · {formatDate(reward.claimed_at)}
              </p>
            )}
          </div>

          {/* Show code if mine */}
          {isMine && reward.code && (
            <div>
              {showCode ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(246,188,5,0.08)',
                  border: '1px solid rgba(246,188,5,0.25)',
                  borderRadius: 6, padding: '8px 14px',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--ws-gold)', letterSpacing: '0.1em', fontWeight: 700 }}>{reward.code}</span>
                  <button onClick={() => navigator.clipboard.writeText(reward.code!)}
                    style={{ background: 'none', border: 'none', color: 'rgba(246,188,5,0.5)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-barlow)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Salin
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowCode(true)}
                  style={{
                    background: 'rgba(246,188,5,0.08)',
                    border: '1px solid rgba(246,188,5,0.2)',
                    borderRadius: 6, padding: '7px 14px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.62rem', letterSpacing: '1.5px',
                    textTransform: 'uppercase', color: 'var(--ws-gold)',
                    transition: 'all 0.2s',
                  }}>
                  🔑 Lihat Kode Reward
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function RewardsPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [tab, setTab] = useState<'available' | 'mine'>('available')

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?from=/game/rewards')
  }, [user, authLoading]) // eslint-disable-line

  const handleLogout = () => { logout(); router.push('/') }

  const availableRewards = ALL_REWARDS.filter(r => r.status === 'available')
  const myRewards = ALL_REWARDS.filter(r => MY_REWARD_IDS.includes(r.id))

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#070d0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'var(--ws-red)', borderRadius: '50%' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070d0e', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(246,188,5,0.07) 0%, transparent 60%)' }} />

      <GameNav />

      {/* ── CONTENT ── */}
      <main style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '120px 24px 80px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--ws-gold)', marginBottom: 12 }}>
            City Hunt
          </p>
          <h1 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', textTransform: 'uppercase', lineHeight: 0.92, color: 'var(--ws-cream)', marginBottom: 16 }}>
            REWARDS<br />
            <span style={{ color: 'rgba(221,219,216,0.2)', fontSize: '0.55em', letterSpacing: '0.08em' }}>& HADIAH</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--ws-gray)', lineHeight: 1.7, maxWidth: 480 }}>
            Menangkan chapter, raih reward eksklusif — dari tiket gratis hingga pengalaman di balik panggung.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 36 }}>
          {[
            { label: 'Reward Tersedia', value: availableRewards.length, color: '#4ade80' },
            { label: 'Total Reward', value: ALL_REWARDS.length, color: 'var(--ws-gold)' },
            { label: 'Reward Kamu', value: myRewards.length, color: 'var(--ws-red)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '16px 20px' }}>
              <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'var(--ws-gray)', marginTop: 4, letterSpacing: '0.08em' }}>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 28 }}>
          {([
            { key: 'available', label: 'Reward Tersedia' },
            { key: 'mine', label: `Reward Kamu (${myRewards.length})` },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '12px 20px',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.72rem', letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: tab === t.key ? 'var(--ws-cream)' : 'var(--ws-gray)',
                borderBottom: `2px solid ${tab === t.key ? 'var(--ws-gold)' : 'transparent'}`,
                marginBottom: -1,
                transition: 'color 0.2s',
              }}
            >{t.label}</button>
          ))}
        </motion.div>

        {/* Reward list */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {tab === 'available' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {availableRewards.map(r => <RewardCard key={r.id} reward={r} isMine={false} />)}
              </div>
            )}
            {tab === 'mine' && (
              myRewards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myRewards.map(r => <RewardCard key={r.id} reward={r} isMine={true} />)}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <p style={{ fontSize: '3rem', marginBottom: 16 }}>🏅</p>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', color: 'rgba(221,219,216,0.3)', marginBottom: 8 }}>Belum Ada Reward</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--ws-gray)' }}>Menangkan chapter untuk mendapatkan reward eksklusif.</p>
                  <Link href="/game" style={{ display: 'inline-flex', marginTop: 20, padding: '10px 24px', background: 'var(--ws-red)', borderRadius: 4, fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'white', textDecoration: 'none' }}>
                    Mulai Hunt →
                  </Link>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>

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