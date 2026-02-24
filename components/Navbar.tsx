'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 60))
    return unsub
  }, [scrollY])

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{
          background: scrolled
            ? 'rgba(7, 13, 14, 0.92)'
            : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(221,219,216,0.08)' : 'none',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          transition: 'background 0.4s, border-color 0.4s, backdrop-filter 0.4s',
        }}
      >
        {/* Logo */}
        <a href="/" className="flex-shrink-0">
          <div className="relative w-28 h-12 md:w-36 md:h-14">
            <Image
              src="/assets/logo-white.png"
              alt="Wondershock Theatre"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {['Shows', 'Workshops', 'About', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="nav-link text-ws-sand hover:text-ws-cream"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-4">
          <motion.a
            href="#whats-on"
            className="hidden md:flex items-center gap-2 px-4 py-2 border border-ws-red text-ws-red text-xs font-heading font-700 uppercase tracking-widest"
            whileHover={{ background: 'rgba(236,43,37,0.1)' }}
            transition={{ duration: 0.2 }}
          >
            What&apos;s On
          </motion.a>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-[5px] w-6 h-6 items-end justify-center"
            aria-label="Toggle menu"
          >
            <motion.span
              className="block h-[1.5px] bg-ws-cream"
              animate={{ width: menuOpen ? '100%' : '100%', rotate: menuOpen ? 45 : 0, y: menuOpen ? 6.5 : 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block h-[1.5px] bg-ws-cream w-3/4"
              animate={{ opacity: menuOpen ? 0 : 1, width: menuOpen ? '100%' : '75%' }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block h-[1.5px] bg-ws-cream w-1/2"
              animate={{ width: menuOpen ? '100%' : '50%', rotate: menuOpen ? -45 : 0, y: menuOpen ? -6.5 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Full screen menu */}
      <motion.div
        className="fixed inset-0 z-40 flex flex-col justify-center items-center"
        initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
        animate={{
          opacity: menuOpen ? 1 : 0,
          clipPath: menuOpen ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: 'rgba(7,13,14,0.98)', pointerEvents: menuOpen ? 'auto' : 'none' }}
      >
        {['Shows', 'Workshops', 'Events', 'About', "What's On", 'Contact'].map((item, i) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase().replace(/\s/g,'-')}`}
            className="font-heading font-900 uppercase text-5xl md:text-7xl text-ws-cream hover:text-ws-red mb-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: menuOpen ? 0 : 40, opacity: menuOpen ? 1 : 0 }}
            transition={{ delay: menuOpen ? i * 0.07 : 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setMenuOpen(false)}
            style={{ fontFamily: 'var(--font-barlow)' }}
          >
            {item}
          </motion.a>
        ))}

        <motion.div
          className="mt-12 flex gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: menuOpen ? 1 : 0 }}
          transition={{ delay: menuOpen ? 0.5 : 0 }}
        >
          {['Instagram', 'YouTube', 'TikTok'].map(s => (
            <a key={s} href="#" className="text-ws-gray hover:text-ws-sand nav-link">{s}</a>
          ))}
        </motion.div>
      </motion.div>
    </>
  )
}
