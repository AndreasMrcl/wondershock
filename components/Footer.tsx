'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const LINKS = {
  Programme: ['Shows', 'Workshops', 'Events', 'Calendar'],
  About: ['Our Story', 'The Team', 'Venue', 'Press'],
  Connect: ['Instagram', 'YouTube', 'TikTok', 'Newsletter'],
}

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!footerRef.current) return

    const ctx = gsap.context(() => {
      // Curtain drop on footer enter
      gsap.fromTo(
        '.footer-curtain',
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
          },
        }
      )

      // Footer content reveal
      gsap.fromTo(
        '.footer-content',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
          },
        }
      )

      // Footer grid stagger
      gsap.fromTo(
        '.footer-col',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 75%',
          },
        }
      )
    }, footerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ background: '#050a0b' }}
    >
      {/* Curtain decorative element */}
      <div
        ref={curtainRef}
        className="footer-curtain absolute top-0 left-0 right-0 h-1"
        style={{ background: 'var(--ws-red)', transformOrigin: 'top center' }}
      />

      {/* Top accent line */}
      <div className="footer-line" style={{ margin: '0' }} />

      <div className="footer-content max-w-7xl mx-auto px-8 md:px-14 pt-16 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Logo + tagline */}
          <div className="footer-col md:col-span-2">
            <div className="relative w-36 h-16 mb-6">
              <Image
                src="/assets/logo-white.png"
                alt="Wondershock Theatre"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-ws-gray text-sm font-body leading-relaxed mb-6 max-w-xs">
              A theatre space for bold voices, unexpected stories, and live experiences that stay with you.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {['IG', 'YT', 'TK'].map(s => (
                <motion.a
                  key={s}
                  href="#"
                  className="w-9 h-9 border border-ws-gray flex items-center justify-center text-ws-gray text-xs font-heading font-700 hover:border-ws-red hover:text-ws-red transition-colors"
                  style={{ fontFamily: 'var(--font-barlow)' }}
                  whileHover={{ scale: 1.05 }}
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading} className="footer-col">
              <p
                className="font-heading font-700 text-ws-cream text-sm uppercase tracking-[0.2em] mb-4"
                style={{ fontFamily: 'var(--font-barlow)' }}
              >
                {heading}
              </p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-ws-gray text-sm font-body hover:text-ws-red transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="footer-col border border-ws-sand border-opacity-10 p-6 mb-12"
          style={{ borderColor: 'rgba(221,219,216,0.08)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="font-heading font-700 text-ws-cream uppercase tracking-widest text-sm mb-1"
                style={{ fontFamily: 'var(--font-barlow)' }}>
                Stay in the Loop
              </p>
              <p className="text-ws-gray text-xs font-body">Get notified about upcoming shows & workshops.</p>
            </div>
            <div className="flex w-full md:w-auto gap-0">
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-transparent border border-ws-gray border-opacity-40 px-4 py-2 text-ws-cream text-sm font-body outline-none flex-1 md:w-64 focus:border-ws-red transition-colors"
                style={{ borderColor: 'rgba(83,83,83,0.5)' }}
              />
              <motion.button
                className="px-5 py-2 bg-ws-red text-ws-cream text-xs font-heading font-700 uppercase tracking-widest flex-shrink-0"
                style={{ fontFamily: 'var(--font-barlow)' }}
                whileHover={{ background: '#c0201a' }}
                transition={{ duration: 0.2 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-line mb-6" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-ws-gray text-xs font-body">
            © {new Date().getFullYear()} Wondershock Theatre. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="#" className="text-ws-gray text-xs font-body hover:text-ws-cream transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Large background text */}
        <div
          className="mt-8 text-center overflow-hidden"
          style={{ lineHeight: 0.85 }}
        >
          <span
            className="font-heading font-900 uppercase select-none pointer-events-none"
            style={{
              fontFamily: 'var(--font-barlow)',
              fontSize: 'clamp(4rem, 14vw, 12rem)',
              color: 'rgba(221,219,216,0.03)',
              letterSpacing: '-0.02em',
            }}
          >
            WONDERSHOCK
          </span>
        </div>
      </div>
    </footer>
  )
}
