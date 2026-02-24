'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const EVENT_LABELS = ['EVENTS', 'SHOWS', 'WORKSHOP']

// 3 performer slides — each has an image + category tag + title
const PERFORMERS = [
  {
    img: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80&auto=format&fit=crop',
    tag: 'SHOW',
    tagColor: '#ec2b25',
    title: 'AHA Moment #3',
  },
  {
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80&auto=format&fit=crop',
    tag: 'WORKSHOP',
    tagColor: '#f6bc05',
    title: 'Voice & Movement',
  },
  {
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80&auto=format&fit=crop',
    tag: 'SHOW',
    tagColor: '#ec2b25',
    title: 'The Unsaid Word',
  },
]

const CYCLE_INTERVAL = 3000

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [activeLabel, setActiveLabel] = useState(0)
  const [activePerformer, setActivePerformer] = useState(0)
  const [performerDir, setPerformerDir] = useState(1) // 1 = left→right, -1 = right→left

  // Cycle event label
  useEffect(() => {
    const id = setInterval(() => {
      setActiveLabel((p) => (p + 1) % EVENT_LABELS.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // Cycle performer
  useEffect(() => {
    const id = setInterval(() => {
      setPerformerDir(1)
      setActivePerformer((p) => (p + 1) % PERFORMERS.length)
    }, CYCLE_INTERVAL)
    return () => clearInterval(id)
  }, [])

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
      tl.fromTo('.performer-wrap', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.1)
      tl.fromTo('.welcome-text', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.15)
      tl.fromTo('.events-col', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.15)
      tl.to('.spotlight-cone-inner', { opacity: 0.45, duration: 0.3 }, 0.35)
      tl.to('.spotlight-svg', { scaleX: 0.6, duration: 0.4, ease: 'power2.inOut' }, 0.55)
      tl.to('.welcome-text', { opacity: 0, x: -30, duration: 0.25 }, 0.75)
      tl.to('.performer-wrap', { x: -30, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.85)
      tl.to('.spotlight-svg', { opacity: 0, duration: 0.2 }, 0.9)
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const goToPerformer = (i: number) => {
    setPerformerDir(i > activePerformer ? 1 : -1)
    setActivePerformer(i)
  }

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
          viewBox="0 0 420 720"
          style={{
            position: 'absolute', top: 0,
            left: '50%', transform: 'translateX(-50%)',
            width: 'min(420px, 55vw)',
            height: '82%',
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
            points="210,0 30,660 390,660"
            fill="url(#spotGrad)"
            style={{ opacity: 0.28 }}
          />
          <ellipse cx="210" cy="660" rx="168" ry="28" fill="url(#floorGrad)" opacity="0.5" />
          <line x1="210" y1="0" x2="30" y2="660" stroke="rgba(255,235,150,0.1)" strokeWidth="1" />
          <line x1="210" y1="0" x2="390" y2="660" stroke="rgba(255,235,150,0.1)" strokeWidth="1" />
        </svg>

        {/* ── Performer Carousel ── */}
        <div
          className="performer-wrap"
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
          {/* Sliding image */}
          <AnimatePresence mode="wait" custom={performerDir}>
            <motion.div
              key={activePerformer}
              custom={performerDir}
              variants={{
                enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <Image
                src={PERFORMERS[activePerformer].img}
                alt={PERFORMERS[activePerformer].title}
                fill
                style={{
                  objectFit: 'cover', objectPosition: 'top',
                  maskImage: 'linear-gradient(to top, transparent 0%, black 18%, black 82%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 18%, black 82%, transparent 100%)',
                  filter: 'grayscale(15%) contrast(1.1)',
                }}
                sizes="200px"
              />
            </motion.div>
          </AnimatePresence>

          {/* Tag pill — bottom of performer frame */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`tag-${activePerformer}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              style={{
                position: 'absolute', bottom: '-28px', left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex', alignItems: 'center', gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: PERFORMERS[activePerformer].tagColor,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.58rem',
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--ws-gray)',
              }}>
                {PERFORMERS[activePerformer].title}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Dot nav — below tag */}
          <div style={{
            position: 'absolute', bottom: '-50px',
            left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            {PERFORMERS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToPerformer(i)}
                style={{
                  width: i === activePerformer ? 18 : 4,
                  height: 3,
                  borderRadius: 2,
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  background: i === activePerformer ? 'var(--ws-red)' : 'rgba(83,83,83,0.5)',
                  transition: 'width 0.4s ease, background 0.4s ease',
                }}
              />
            ))}
          </div>
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

        {/* ── Events Column ── */}
        <div
          className="events-col"
          style={{ position: 'absolute', right: 'max(5%, 32px)', top: '26%', textAlign: 'right', zIndex: 20 }}
        >
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.55rem', fontWeight: 400,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'var(--ws-gray)', marginBottom: 16,
          }}>Navigate</p>

          {/* Static box — text cycles inside */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid var(--ws-red)',
            width: 230,
            height: 76,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: '2px solid var(--ws-red)', borderLeft: '2px solid var(--ws-red)' }} />
            <div style={{ position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderTop: '2px solid var(--ws-red)', borderRight: '2px solid var(--ws-red)' }} />
            <div style={{ position: 'absolute', bottom: -1, left: -1, width: 10, height: 10, borderBottom: '2px solid var(--ws-red)', borderLeft: '2px solid var(--ws-red)' }} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: '2px solid var(--ws-red)', borderRight: '2px solid var(--ws-red)' }} />

            <AnimatePresence mode="wait">
              <motion.span
                key={activeLabel}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  fontFamily: 'var(--font-barlow)', fontWeight: 900,
                  fontSize: '2.4rem', letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--ws-cream)',
                  whiteSpace: 'nowrap',
                }}
              >
                {EVENT_LABELS[activeLabel]}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Progress bar + index */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <span style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.6rem', letterSpacing: '0.15em',
              color: 'rgba(83,83,83,0.7)',
            }}>
              0{activeLabel + 1} / 0{EVENT_LABELS.length}
            </span>
            <div style={{ width: 56, height: 1.5, background: 'rgba(83,83,83,0.25)', position: 'relative' }}>
              <motion.div
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--ws-red)' }}
                animate={{ width: `${((activeLabel + 1) / EVENT_LABELS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.52rem',
              letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ws-gray)',
            }}>Scroll</span>
            <motion.div
              style={{ width: 1.5, background: 'var(--ws-red)' }}
              animate={{ height: [8, 24, 8] }}
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