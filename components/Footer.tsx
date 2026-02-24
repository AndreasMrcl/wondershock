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

  useEffect(() => {
    if (!footerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.footer-top-bar',
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 88%' } }
      )
      gsap.fromTo('.footer-col',
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 80%' } }
      )
    }, footerRef)
    return () => ctx.revert()
  }, [])

  return (
    <footer ref={footerRef} style={{ position: 'relative', overflow: 'hidden', background: '#050a0b' }}>
      {/* Top red bar */}
      <div className="footer-top-bar" style={{ height: 2, background: 'var(--ws-red)' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px max(5%,32px) 0' }}>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 40,
          marginBottom: 60,
        }}>
          {/* Brand col */}
          <div className="footer-col" style={{ gridColumn: 'span 2' }}>
            <div style={{ position: 'relative', width: 140, height: 44, marginBottom: 20 }}>
              <Image
                src="/assets/logo-white.png"
                alt="Wondershock Theatre"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
              />
            </div>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
              color: 'var(--ws-gray)', lineHeight: 1.75,
              maxWidth: 240, marginBottom: 20,
            }}>
              A theatre space for bold voices, unexpected stories, and live experiences that stay with you.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['IG', 'YT', 'TK'].map(s => (
                <motion.a
                  key={s}
                  href="#"
                  style={{
                    width: 34, height: 34,
                    border: '1px solid var(--ws-gray)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.6rem',
                    color: 'var(--ws-gray)', textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ws-red)'; (e.currentTarget as HTMLElement).style.color = 'var(--ws-red)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ws-gray)'; (e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)' }}
                >{s}</motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading} className="footer-col">
              <p style={{
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.75rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'var(--ws-cream)',
                marginBottom: 16,
              }}>{heading}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
                        color: 'var(--ws-gray)', textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-red)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-gray)')}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="footer-col" style={{
          border: '1px solid rgba(221,219,216,0.08)',
          padding: '22px 24px', marginBottom: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.8rem', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 5,
            }}>Stay in the Loop</p>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--ws-gray)' }}>
              Get notified about upcoming shows &amp; workshops.
            </p>
          </div>
          <div style={{ display: 'flex' }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                background: 'transparent',
                border: '1px solid rgba(83,83,83,0.5)', borderRight: 'none',
                padding: '10px 16px', color: 'var(--ws-cream)',
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem',
                outline: 'none', width: 220,
              }}
            />
            <motion.button
              style={{
                background: 'var(--ws-red)', border: 'none',
                color: 'var(--ws-cream)', cursor: 'pointer',
                padding: '10px 18px',
                fontFamily: 'var(--font-barlow)', fontSize: '0.65rem',
                fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
              }}
              whileHover={{ background: '#c0201a' }}
              transition={{ duration: 0.2 }}
            >Subscribe</motion.button>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-line" style={{ marginBottom: 20 }} />

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, paddingBottom: 20,
        }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--ws-gray)' }}>
            © {new Date().getFullYear()} Wondershock Theatre. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Contact'].map(item => (
              <a key={item} href="#"
                style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--ws-gray)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ws-cream)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ws-gray)')}
              >{item}</a>
            ))}
          </div>
        </div>

        {/* Ghost word */}
        <div style={{ textAlign: 'center', paddingTop: 20, overflow: 'hidden', lineHeight: 0.85 }}>
          <span style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(4rem,13vw,11rem)',
            color: 'rgba(221,219,216,0.025)',
            letterSpacing: '-0.02em',
            userSelect: 'none', pointerEvents: 'none',
          }}>WONDERSHOCK</span>
        </div>

      </div>
    </footer>
  )
}
