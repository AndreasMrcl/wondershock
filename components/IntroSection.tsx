'use client'

// components/IntroSection.tsx
// Fullscreen intro: 3 cycling phrases, navbar hidden during this section.
// After scrolling past, hero becomes visible.

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const PHRASES = [
  { line1: 'THEATRE', line2: 'YANG MENGEJUTKAN' },
  { line1: 'CERITA', line2: 'YANG MENGGERAKKAN' },
  { line1: 'PANGGUNG', line2: 'YANG MENAKJUBKAN' },
]

interface IntroSectionProps {
  onNavbarVisible: (visible: boolean) => void
}

export default function IntroSection({ onNavbarVisible }: IntroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          scrub: 0.8,
          pin: containerRef.current,
          anticipatePin: 1,
          onUpdate: self => {
            // Hide navbar while in intro section
            onNavbarVisible(self.progress > 0.96)
          },
          onLeave: () => onNavbarVisible(true),
          onEnterBack: () => onNavbarVisible(false),
        },
      })

      // Each phrase gets ~1/3 of the scroll
      // Phrase 1 — starts visible, exits up
      tl.fromTo('.phrase-0 .word-top',
        { y: 0, opacity: 1 },
        { y: 0, opacity: 1, duration: 0.2 }, 0
      )
      tl.to('.phrase-0 .word-top', { y: -80, opacity: 0, duration: 0.18, ease: 'power3.in' }, 0.22)
      tl.to('.phrase-0 .word-bottom', { y: 80, opacity: 0, duration: 0.18, ease: 'power3.in' }, 0.22)
      tl.to('.phrase-0 .line-accent', { scaleX: 0, duration: 0.12 }, 0.22)

      // Phrase 2 — enters from below, exits up
      tl.fromTo('.phrase-1',
        { opacity: 1 },
        { opacity: 1, duration: 0.01 }, 0
      )
      tl.fromTo('.phrase-1 .word-top',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, ease: 'power3.out' }, 0.3
      )
      tl.fromTo('.phrase-1 .word-bottom',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, ease: 'power3.out', delay: 0.04 }, 0.3
      )
      tl.fromTo('.phrase-1 .line-accent',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.15, ease: 'power2.out' }, 0.42
      )
      tl.to('.phrase-1 .word-top', { y: -80, opacity: 0, duration: 0.18, ease: 'power3.in' }, 0.55)
      tl.to('.phrase-1 .word-bottom', { y: 80, opacity: 0, duration: 0.18, ease: 'power3.in' }, 0.55)
      tl.to('.phrase-1 .line-accent', { scaleX: 0, duration: 0.12 }, 0.55)

      // Phrase 3 — enters from below, exits by fading whole screen to dark
      tl.fromTo('.phrase-2 .word-top',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, ease: 'power3.out' }, 0.63
      )
      tl.fromTo('.phrase-2 .word-bottom',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, ease: 'power3.out', delay: 0.04 }, 0.63
      )
      tl.fromTo('.phrase-2 .line-accent',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.15, ease: 'power2.out' }, 0.75
      )
      // Fade whole intro to black at the very end
      tl.to('.intro-overlay', { opacity: 1, duration: 0.18, ease: 'power2.in' }, 0.88)

    }, sectionRef)

    return () => ctx.revert()
  }, [onNavbarVisible])

  return (
    <section
      ref={sectionRef}
      style={{ height: '400vh', position: 'relative' }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          background: 'var(--ws-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >


        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.55rem',
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(83,83,83,0.6)',
          }}>scroll</span>
          <div style={{
            width: 1, height: 32,
            background: 'linear-gradient(to bottom, rgba(236,43,37,0.6), transparent)',
            animation: 'scroll-pulse 2s ease-in-out infinite',
          }} />
        </div>

        {/* Phrase stack — all 3 absolutely positioned at center */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          {PHRASES.map((phrase, i) => (
            <div
              key={i}
              className={`phrase-${i}`}
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                top: i === 0 ? undefined : '50%',
                left: i === 0 ? undefined : '50%',
                transform: i === 0 ? undefined : 'translate(-50%, -50%)',
                width: i === 0 ? undefined : 'max(70vw, 400px)',
                pointerEvents: 'none',
              }}
            >
              {/* Line 1 */}
              <div
                className="word-top"
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 900,
                  fontSize: 'clamp(4rem, 13vw, 11rem)',
                  lineHeight: 0.88,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  color: i === 1 ? 'var(--ws-cream)' : i === 2 ? 'var(--ws-cream)' : 'var(--ws-cream)',
                  WebkitTextStroke: i === 1 ? '0px' : '0px',
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                {phrase.line1}
              </div>

              {/* Accent line between words */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '12px 0' }}>
                <div
                  className="line-accent"
                  style={{
                    height: 2,
                    background: 'var(--ws-red)',
                    width: 60,
                    transformOrigin: 'center',
                    transform: i === 0 ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--ws-red)',
                  opacity: 0.8,
                }} />
                <div
                  className="line-accent"
                  style={{
                    height: 2,
                    background: 'var(--ws-red)',
                    width: 60,
                    transformOrigin: 'center',
                    transform: i === 0 ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </div>

              {/* Line 2 — outlined style */}
              <div
                className="word-bottom"
                style={{
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 900,
                  fontSize: 'clamp(3rem, 9vw, 7.5rem)',
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'transparent',
                  WebkitTextStroke: '1.5px rgba(221,219,216,0.55)',
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                {phrase.line2}
              </div>
            </div>
          ))}
        </div>

        {/* Fade-to-black overlay at end of intro */}
        <div
          className="intro-overlay"
          style={{
            position: 'absolute', inset: 0,
            background: 'var(--ws-dark)',
            opacity: 0, pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      </div>

      <style>{`
        @keyframes scroll-pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 0.9; transform: scaleY(1.3); }
        }
      `}</style>
    </section>
  )
}