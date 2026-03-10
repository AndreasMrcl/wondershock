'use client'
// components/Navbar.tsx — updated dengan auth

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'

const UPCOMING_EVENTS = [
  {
    title: 'AHA Moment #3',
    date: 'Mar 15, 2026',
    img: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'My Story. My Brand.',
    date: 'Apr 5, 2026',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80&auto=format&fit=crop',
  },
  {
    title: 'Celebrating Disability',
    date: 'Apr 20, 2026',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop',
  },
]

const NAV_LINKS = [
  { label: 'Our Story',    href: '#about',   img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Learn Drama',  href: '#learn',   img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Script',       href: '#script',  img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Support',      href: '#support', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80&auto=format&fit=crop' },
  { label: 'Contact',      href: '#contact', img: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1200&q=80&auto=format&fit=crop' },
]

type HoverKey = `e${number}` | `n${number}` | null

function getBgImage(hovered: HoverKey): string | null {
  if (!hovered) return null
  if (hovered.startsWith('e')) return UPCOMING_EVENTS[parseInt(hovered.slice(1))].img
  if (hovered.startsWith('n')) return NAV_LINKS[parseInt(hovered.slice(1))].img
  return null
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<HoverKey>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const bgImg = getBgImage(hovered)

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 800,
          background: menuOpen ? 'transparent' : scrolled ? 'rgba(7,13,14,0.92)' : 'transparent',
          borderBottom: !menuOpen && scrolled ? '1px solid rgba(221,219,216,0.08)' : 'none',
          backdropFilter: !menuOpen && scrolled ? 'blur(14px)' : 'none',
          transition: 'background 0.4s, border-color 0.4s',
        }}
      >
        {/* 3-kolom grid: [kiri] [LOGO] [kanan] */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 48px',
          height: 80,
        }}>

          {/* KIRI: Our Story · Learn Drama (rata kanan, mepet logo) */}
          <motion.div
            animate={{ opacity: menuOpen ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'flex-end', gap: 32,
              paddingRight: 36,
              pointerEvents: menuOpen ? 'none' : 'auto',
            }}
          >
            {['Our Story', 'Learn Drama'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="nav-link"
                style={{ color: 'var(--ws-sand)', textDecoration: 'none', transition: 'color 0.25s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-cream)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-sand)')}
              >{item}</a>
            ))}
          </motion.div>

          {/* TENGAH: Logo besar */}
          <motion.a
            href="/"
            animate={{ opacity: menuOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            style={{ flexShrink: 0, display: 'block', pointerEvents: menuOpen ? 'none' : 'auto' }}
          >
            <div style={{ position: 'relative', width: 180, height: 72 }}>
              <Image src="/assets/logo-white.png" alt="Wondershock Theatre" fill
                style={{ objectFit: 'contain' }} priority />
            </div>
          </motion.a>

          {/* KANAN: Script · Support + CTA + auth + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 36 }}>

            {/* 2 link dekat logo — fade saat menu open */}
            <motion.div
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 32,
                pointerEvents: menuOpen ? 'none' : 'auto',
              }}
            >
              {['Script', 'Support'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="nav-link"
                  style={{ color: 'var(--ws-sand)', textDecoration: 'none', transition: 'color 0.25s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-cream)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-sand)')}
                >{item}</a>
              ))}
            </motion.div>

            {/* spacer */}
            <div style={{ flex: 1 }} />

            {/* CTA + auth — fade saat menu open */}
            <motion.div
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                pointerEvents: menuOpen ? 'none' : 'auto',
              }}
            >
              <motion.a
                href="#whats-on"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 18px',
                  border: '1px solid var(--ws-red)',
                  color: 'var(--ws-red)',
                  fontFamily: 'var(--font-barlow)',
                  fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
                whileHover={{ background: 'rgba(236,43,37,0.1)' }}
              >
                What&apos;s On
              </motion.a>

              {/* ── AUTH AREA ── */}
              <div style={{ position: 'relative' }}>
                {user ? (
                  // User sudah login — tampilkan nama + dropdown
                  <>
                    <button
                      onClick={() => setUserMenuOpen(o => !o)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4, padding: '7px 14px',
                        color: 'var(--ws-cream)',
                        fontFamily: 'var(--font-barlow)', fontWeight: 700,
                        fontSize: '0.68rem', letterSpacing: '1.5px',
                        textTransform: 'uppercase', cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget).style.borderColor = 'var(--ws-red)'}
                      onMouseLeave={e => { if (!userMenuOpen) (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)' }}
                    >
                      {/* Avatar initials */}
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--ws-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', fontWeight: 900, color: 'white',
                        flexShrink: 0,
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      {user.name.split(' ')[0]}
                      <motion.span
                        animate={{ rotate: userMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: '0.5rem', opacity: 0.5 }}
                      >▼</motion.span>
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            width: 200,
                            background: '#141a1b',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 6, overflow: 'hidden',
                            zIndex: 900,
                          }}
                        >
                          {/* User info */}
                          <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--ws-cream)' }}>{user.name}</p>
                            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'var(--ws-gray)', marginTop: 2 }}>{user.email}</p>
                          </div>

                          {/* Menu items */}
                          {[
                            { label: '🎭 City Hunt Quiz', href: '/game' },
                            ...(user.role === 'admin' ? [{ label: '⚙ Admin Panel', href: '/game/admin' }] : []),
                          ].map(item => (
                            <Link key={item.href} href={item.href}
                              onClick={() => setUserMenuOpen(false)}
                              style={{
                                display: 'block', padding: '10px 16px',
                                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                                fontSize: '0.72rem', letterSpacing: '1px',
                                textTransform: 'uppercase', color: 'var(--ws-sand)',
                                textDecoration: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                transition: 'background 0.15s, color 0.15s',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                                ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent'
                                ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-sand)'
                              }}
                            >{item.label}</Link>
                          ))}

                          <button onClick={handleLogout}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '10px 16px',
                              background: 'none', border: 'none',
                              fontFamily: 'var(--font-barlow)', fontWeight: 700,
                              fontSize: '0.72rem', letterSpacing: '1px',
                              textTransform: 'uppercase', color: 'rgba(236,43,37,0.7)',
                              cursor: 'pointer', transition: 'color 0.15s, background 0.15s',
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget).style.color = 'var(--ws-red)'
                              ;(e.currentTarget).style.background = 'rgba(236,43,37,0.06)'
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget).style.color = 'rgba(236,43,37,0.7)'
                              ;(e.currentTarget).style.background = 'transparent'
                            }}
                          >→ Keluar</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  // Belum login
                  <Link href="/login"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 18px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'var(--ws-sand)',
                      fontFamily: 'var(--font-barlow)',
                      fontSize: '0.7rem', fontWeight: 700,
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      textDecoration: 'none', borderRadius: 3,
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--ws-red)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-red)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-sand)'
                    }}
                  >
                    Masuk
                  </Link>
                )}
              </div>{/* end AUTH AREA */}
            </motion.div>{/* end CTA+auth */}

            {/* Hamburger — selalu visible, jadi X saat menu open */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{
                display: 'flex', flexDirection: 'column', gap: 5,
                alignItems: 'flex-end', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 4, marginLeft: 8,
                zIndex: 900, position: 'relative', flexShrink: 0,
              }}
            >
              <motion.span style={{ display: 'block', height: 1.5, background: 'var(--ws-cream)', width: 24 }}
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6.5 : 0 }} transition={{ duration: 0.3 }} />
              <motion.span style={{ display: 'block', height: 1.5, background: 'var(--ws-cream)', width: 18 }}
                animate={{ opacity: menuOpen ? 0 : 1 }} transition={{ duration: 0.3 }} />
              <motion.span style={{ display: 'block', height: 1.5, background: 'var(--ws-cream)', width: 12 }}
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6.5 : 0, width: menuOpen ? 24 : 12 }}
                transition={{ duration: 0.3 }} />
            </button>
          </div>{/* end KANAN */}
        </div>{/* end grid */}
      </motion.nav>

      {/* ── Fullscreen Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="fullscreen-menu"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 700,
              background: 'rgba(7,13,14,0.98)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* BG image */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
              <AnimatePresence>
                {bgImg && (
                  <motion.div key={hovered}
                    initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <Image src={bgImg} alt="" fill
                      style={{ objectFit: 'cover', filter: 'grayscale(25%) contrast(1.08)' }}
                      sizes="100vw" priority />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(120deg, rgba(7,13,14,0.93) 0%, rgba(7,13,14,0.70) 45%, rgba(7,13,14,0.90) 100%)',
                    }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Top: logo */}
            <div style={{
              position: 'relative', zIndex: 1,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '24px 48px',
              borderBottom: '1px solid rgba(221,219,216,0.07)', flexShrink: 0,
            }}>
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4 }}>
                <a href="/" onClick={() => setMenuOpen(false)}>
                  <div style={{ position: 'relative', width: 160, height: 50 }}>
                    <Image src="/assets/logo-white.png" alt="Wondershock Theatre" fill style={{ objectFit: 'contain' }} />
                  </div>
                </a>
              </motion.div>
            </div>

            {/* Main: two columns */}
            <div style={{
              position: 'relative', zIndex: 1, flex: 1,
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              padding: '40px max(6%, 48px) 28px',
              alignItems: 'start', overflow: 'hidden',
            }}>
              {/* LEFT — What's On */}
              <div style={{ borderRight: '1px solid rgba(221,219,216,0.07)', paddingRight: 'max(5%, 48px)' }}>
                <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.4 }}
                  style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: 'clamp(0.62rem, 0.9vw, 0.8rem)', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--ws-red)', marginBottom: 18 }}>
                  What&apos;s On
                </motion.p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {UPCOMING_EVENTS.map((ev, i) => (
                    <motion.a key={ev.title} href="#whats-on" onClick={() => setMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.07, duration: 0.4 }}
                      onMouseEnter={e => { setHovered(`e${i}`); (e.currentTarget as HTMLElement).style.paddingLeft = '6px' }}
                      onMouseLeave={e => { setHovered(null); (e.currentTarget as HTMLElement).style.paddingLeft = '0' }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        textDecoration: 'none', padding: '18px 0', paddingLeft: 0,
                        borderBottom: '1px solid rgba(221,219,216,0.07)', gap: 10,
                        transition: 'padding-left 0.25s ease',
                      }}
                    >
                      <div>
                        <motion.p animate={{ color: hovered === `e${i}` ? '#f1f1ef' : '#dddbd8' }} transition={{ duration: 0.2 }}
                          style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: 'clamp(1.3rem, 2.4vw, 2rem)', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 4 }}>
                          {ev.title}
                        </motion.p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', letterSpacing: '0.14em', color: 'var(--ws-gray)' }}>{ev.date}</p>
                      </div>
                      <motion.span animate={{ opacity: hovered === `e${i}` ? 1 : 0, x: hovered === `e${i}` ? 0 : -8 }} transition={{ duration: 0.2 }}
                        style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1rem', color: 'var(--ws-red)', flexShrink: 0 }}>→</motion.span>
                    </motion.a>
                  ))}
                </div>
                <motion.a href="#whats-on" onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62, duration: 0.3 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, textDecoration: 'none', fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ws-gray)', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ws-red)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)' }}
                >See More Events <span>→</span></motion.a>
              </div>

              {/* RIGHT — Nav links */}
              <div style={{ paddingLeft: 'max(5%, 48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {NAV_LINKS.map((link, i) => (
                  <motion.a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    onMouseEnter={() => setHovered(`n${i}`)} onMouseLeave={() => setHovered(null)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', padding: '9px 0', borderBottom: '1px solid rgba(221,219,216,0.05)' }}
                  >
                    <motion.span animate={{ color: hovered === `n${i}` ? '#ec2b25' : '#f1f1ef', letterSpacing: hovered === `n${i}` ? '0.07em' : '0.02em' }} transition={{ duration: 0.25 }}
                      style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.8vw, 3.4rem)', textTransform: 'uppercase', lineHeight: 1 }}>
                      {link.label}
                    </motion.span>
                    <motion.span animate={{ opacity: hovered === `n${i}` ? 1 : 0, x: hovered === `n${i}` ? 0 : -10 }} transition={{ duration: 0.2 }}
                      style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--ws-red)', flexShrink: 0, marginLeft: 12 }}>→</motion.span>
                  </motion.a>
                ))}

                {/* Auth links di menu */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                  style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 12 }}>
                  {user ? (
                    <>
                      <Link href="/game" onClick={() => setMenuOpen(false)}
                        style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ws-gold)', textDecoration: 'none' }}>
                        🎭 City Hunt
                      </Link>
                      <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                      <button onClick={() => { handleLogout(); setMenuOpen(false) }}
                        style={{ background: 'none', border: 'none', fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(236,43,37,0.6)', cursor: 'pointer' }}>
                        Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMenuOpen(false)}
                        style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ws-sand)', textDecoration: 'none' }}>
                        Masuk
                      </Link>
                      <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                      <Link href="/register" onClick={() => setMenuOpen(false)}
                        style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ws-red)', textDecoration: 'none' }}>
                        Daftar
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Bottom bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48, duration: 0.3 }}
              style={{
                position: 'relative', zIndex: 1,
                borderTop: '1px solid rgba(221,219,216,0.07)',
                padding: '14px max(6%, 48px)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
              }}
            >
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)', letterSpacing: '0.1em' }}>
                © {new Date().getFullYear()} Wondershock Theatre
              </p>
              <div style={{ display: 'flex', gap: 20 }}>
                {['Instagram', 'YouTube', 'TikTok'].map(s => (
                  <a key={s} href="#"
                    style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)', textDecoration: 'none', letterSpacing: '0.1em', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-sand)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-gray)')}
                  >{s}</a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}