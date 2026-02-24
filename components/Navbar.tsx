'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 48px',
          background: scrolled ? 'rgba(7,13,14,0.92)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(221,219,216,0.08)' : 'none',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          transition: 'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
        }}
      >
        {/* Logo */}
        <a href="/" style={{ flexShrink: 0, display: 'block' }}>
          <div style={{ position: 'relative', width: 140, height: 44 }}>
            <Image
              src="/assets/logo-white.png"
              alt="Wondershock Theatre"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left' }}
              priority
            />
          </div>
        </a>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Shows', 'Workshops', 'About', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="nav-link"
              style={{ color: 'var(--ws-sand)', textDecoration: 'none', transition: 'color 0.25s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-cream)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-sand)')}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
            transition={{ duration: 0.2 }}
          >
            What&apos;s On
          </motion.a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              display: 'flex', flexDirection: 'column', gap: 5,
              alignItems: 'flex-end', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            }}
          >
            <motion.span style={{ display: 'block', height: 1.5, background: 'var(--ws-cream)', width: 24 }}
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6.5 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span style={{ display: 'block', height: 1.5, background: 'var(--ws-cream)', width: 18 }}
              animate={{ opacity: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span style={{ display: 'block', height: 1.5, background: 'var(--ws-cream)', width: 12 }}
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6.5 : 0, width: menuOpen ? 24 : 12 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Fullscreen menu */}
      <motion.div
        initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        animate={{
          opacity: menuOpen ? 1 : 0,
          clipPath: menuOpen ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', inset: 0, zIndex: 700,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
          background: 'rgba(7,13,14,0.98)',
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        {['Shows', 'Workshops', 'Events', 'About', "What's On", 'Contact'].map((item, i) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: menuOpen ? 0 : 40, opacity: menuOpen ? 1 : 0 }}
            transition={{ delay: menuOpen ? i * 0.07 : 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
              textTransform: 'uppercase', color: 'var(--ws-cream)',
              textDecoration: 'none', lineHeight: 1,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-red)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-cream)')}
          >
            {item}
          </motion.a>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: menuOpen ? 1 : 0 }}
          transition={{ delay: menuOpen ? 0.5 : 0 }}
          style={{ marginTop: 40, display: 'flex', gap: 24 }}
        >
          {['Instagram', 'YouTube', 'TikTok'].map(s => (
            <a key={s} href="#" className="nav-link"
              style={{ color: 'var(--ws-gray)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-sand)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-gray)')}
            >{s}</a>
          ))}
        </motion.div>
      </motion.div>
    </>
  )
}
