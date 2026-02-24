'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const EVENTS = [
  { label: 'EVENTS', sub: '' },
  { label: 'SHOWS', sub: 'Live Performance' },
  { label: 'WORKSHOP', sub: 'Interactive Learning' },
]

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !pinRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=280%',
          scrub: 1.2,
          pin: pinRef.current,
          anticipatePin: 1,
        },
      })

      tl.fromTo('.spotlight-svg', { scaleY: 0, transformOrigin: 'top center', opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
      tl.fromTo('.performer-img', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1)
      tl.fromTo('.welcome-text', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.15)
      tl.fromTo('.events-col', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.15)
      tl.to('.spotlight-cone-inner', { opacity: 0.45, duration: 0.3 }, 0.35)
      tl.to('.event-label-0', { opacity: 0, y: -10, duration: 0.15 }, 0.45)
      tl.fromTo('.event-label-1', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.15 }, 0.5)
      tl.to('.event-label-1', { opacity: 0, y: -10, duration: 0.15 }, 0.65)
      tl.fromTo('.event-label-2', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.15 }, 0.7)
      tl.to('.spotlight-svg', { scaleX: 0.6, duration: 0.4, ease: 'power2.inOut' }, 0.55)
      tl.to('.welcome-text', { opacity: 0, x: -30, duration: 0.25 }, 0.75)
      tl.to('.performer-img', { x: -30, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.85)
      tl.to('.spotlight-svg', { opacity: 0, duration: 0.2 }, 0.9)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="hero" style={{ height: '380vh', position: 'relative' }}>
      <div
        ref={pinRef}
        style={{
          position: 'relative', width: '100%', height: '100vh',
          overflow: 'hidden', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--ws-dark)',
        }}
      >
        {/* Stage floor line */}
        <div style={{
          position: 'absolute', bottom: '26%', left: 0, right: 0, height: 1,
          background: 'linear-gradient(to right, transparent, rgba(221,219,216,0.15), transparent)',
        }} />

        {/* Spotlight SVG */}
        <svg
          className="spotlight-svg"
          viewBox="0 0 420 600"
          style={{
            position: 'absolute', top: 0,
            left: '50%', transform: 'translateX(-50%)',
            width: 'min(420px, 55vw)',
            pointerEvents: 'none',
            transformOrigin: 'top center',
          }}
        >
          <defs>
            <radialGradient id="spotGrad" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
              <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.22" />
              <stop offset="55%" stopColor="#fde98a" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floorGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde98a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon
            className="spotlight-cone-inner"
            points="210,0 30,540 390,540"
            fill="url(#spotGrad)"
            style={{ opacity: 0.28 }}
          />
          <ellipse cx="210" cy="540" rx="168" ry="28" fill="url(#floorGrad)" opacity="0.5" />
          <line x1="210" y1="0" x2="30" y2="540" stroke="rgba(255,235,150,0.1)" strokeWidth="1" />
          <line x1="210" y1="0" x2="390" y2="540" stroke="rgba(255,235,150,0.1)" strokeWidth="1" />
        </svg>

        {/* Performer */}
        <div
          className="performer-img"
          style={{
            position: 'absolute',
            bottom: '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(200px, 28vw)',
            height: 'min(380px, 50vh)',
            zIndex: 10,
          }}
        >
          <Image
            src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500&q=80&auto=format&fit=crop"
            alt="Performer on stage"
            fill
            style={{
              objectFit: 'cover', objectPosition: 'top',
              maskImage: 'linear-gradient(to top, transparent 0%, black 18%, black 82%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 18%, black 82%, transparent 100%)',
              filter: 'grayscale(15%) contrast(1.1)',
            }}
            sizes="200px"
          />
        </div>

        {/* Welcome Text */}
        <div
          className="welcome-text"
          style={{ position: 'absolute', left: 'max(5%, 32px)', top: '28%', zIndex: 20 }}
        >
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', fontWeight: 400,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--ws-gray)', marginBottom: 10,
          }}>Est. 2023</p>
          <h1 style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(2.2rem, 5.5vw, 4.8rem)',
            lineHeight: 0.92, textTransform: 'uppercase', color: 'var(--ws-cream)',
          }}>
            WELCOME<br />
            <span style={{ color: 'var(--ws-red)' }}>TO OUR</span><br />
            STAGE
          </h1>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem',
            color: 'var(--ws-gray)', marginTop: 16, lineHeight: 1.7, maxWidth: 170,
          }}>
            Theatre that moves,<br />shocks, and wonders.
          </p>
        </div>

        {/* Events Column */}
        <div
          className="events-col"
          style={{ position: 'absolute', right: 'max(5%, 32px)', top: '26%', textAlign: 'right', zIndex: 20 }}
        >
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.55rem', fontWeight: 400,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'var(--ws-gray)', marginBottom: 14,
          }}>Navigate</p>

          <div style={{ position: 'relative', height: 80 }}>
            {EVENTS.map((ev, i) => (
              <div
                key={ev.label}
                className={`event-label-${i}`}
                style={{ position: 'absolute', right: 0, top: 0, opacity: i === 0 ? 1 : 0 }}
              >
                {i === 1 ? (
                  <div style={{
                    display: 'inline-block',
                    border: '1.5px solid var(--ws-red)',
                    padding: '8px 16px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-barlow)', fontWeight: 900,
                      fontSize: '2rem', letterSpacing: '0.05em',
                      textTransform: 'uppercase', color: 'var(--ws-cream)',
                    }}>
                      {ev.label}
                    </span>
                  </div>
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.8rem', letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'var(--ws-gray)',
                  }}>
                    {ev.label}
                  </span>
                )}
                {ev.sub && (
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '0.55rem',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: 'var(--ws-gray)', marginTop: 5,
                  }}>{ev.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.55rem',
              letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ws-gray)',
            }}>Scroll</span>
            <motion.div
              style={{ width: 1.5, background: 'var(--ws-red)' }}
              animate={{ height: [8, 22, 8] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Stage number ghost */}
        <div style={{
          position: 'absolute', bottom: '2%',
          left: '50%', transform: 'translateX(-50%)',
          lineHeight: 0.85,
        }}>
          <span style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(6rem, 16vw, 13rem)',
            color: 'rgba(221,219,216,0.03)',
            userSelect: 'none', pointerEvents: 'none',
          }}>01</span>
        </div>

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 25%, rgba(7,13,14,0.82) 100%)',
        }} />
      </div>
    </section>
  )
}
