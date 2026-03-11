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
  const welcomeRef = useRef<HTMLDivElement>(null)
  const [activeLabel, setActiveLabel] = useState(0)
  const [activePerformer, setActivePerformer] = useState(0)
  const [performerDir, setPerformerDir] = useState(1)

  useEffect(() => {
    const id = setInterval(() => setActiveLabel(p => (p + 1) % EVENT_LABELS.length), 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setPerformerDir(1)
      setActivePerformer(p => (p + 1) % PERFORMERS.length)
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
          end: '+=320%',
          scrub: 1.2,
          pin: pinRef.current,
          anticipatePin: 1,
        },
      })

      // ── Phase 0: Spotlight iris — scaleX 0→1 from center (garis membuka ke kiri & kanan) ──
      gsap.set('.spotlight-svg', { left: '50%', xPercent: -50, scaleX: 0, transformOrigin: '50% 0%' })
      tl.to('.spotlight-svg',
        { scaleX: 1, duration: 0.22, ease: 'power2.out' }, 0
      )

      // ── Phase 1: Welcome h1 fades in centered ──
      // All secondary elements already hidden via inline style (opacity:0)
      tl.fromTo('.welcome-text',
        { xPercent: -50, left: '50%', top: '50%', yPercent: -50, opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.out' }, 0.15
      )

      // ── Phase 2: Move welcome text to left, switch textAlign ──
      tl.to('.welcome-text', {
        xPercent: 0,
        left: 'max(5%, 32px)',
        top: '28%',
        yPercent: 0,
        duration: 0.25,
        ease: 'power3.inOut',
        onComplete: () => {
          const el = document.querySelector('.welcome-text') as HTMLElement
          if (el) el.style.textAlign = 'left'
        },
      }, 0.33)

      // ── Phase 3: After settled left — all secondary elements appear ──
      tl.to('.performer-wrap', { opacity: 1, duration: 0.18, ease: 'power2.out' }, 0.57)
      tl.to('.welcome-est',    { opacity: 1, duration: 0.15, ease: 'power2.out' }, 0.57)
      tl.to('.welcome-subtitle', { opacity: 1, duration: 0.15, ease: 'power2.out' }, 0.60)
      tl.fromTo('.events-col',
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.2, ease: 'power3.out' }, 0.57
      )
      tl.to('.spotlight-cone-inner', { opacity: 0.45, duration: 0.2 }, 0.45)

      // ── Phase 4: Exit — spotlight iris closes (scaleX 1→0) ──
      tl.to('.welcome-text', { opacity: 0, x: -30, duration: 0.2 }, 0.75)
      tl.to('.performer-wrap', { x: -30, opacity: 0, duration: 0.22, ease: 'power2.in' }, 0.78)
      tl.to('.events-col', { opacity: 0, duration: 0.15 }, 0.75)
      tl.to('.spotlight-svg', { scaleX: 0, duration: 0.2, ease: 'power2.in' }, 0.82)

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const goToPerformer = (i: number) => {
    setPerformerDir(i > activePerformer ? 1 : -1)
    setActivePerformer(i)
  }

  return (
    <section ref={sectionRef} id="hero" style={{ height: '420vh', position: 'relative' }}>
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

        {/* Spotlight — scaleX from 0 (thin line) opens outward, closes back in */}
        <svg
          className="spotlight-svg"
          viewBox="0 0 560 720"
          style={{
            position: 'absolute', top: 0,
            width: 'min(560px, 70vw)',
            height: '82%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <radialGradient id="spotGrad" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
              <stop offset="0%"   stopColor="#fff8d6" stopOpacity="0.26" />
              <stop offset="50%"  stopColor="#fde98a" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floorGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fde98a" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon
            className="spotlight-cone-inner"
            points="280,0 10,700 550,700"
            fill="url(#spotGrad)"
            style={{ opacity: 0.22 }}
          />
          <ellipse cx="280" cy="700" rx="240" ry="32" fill="url(#floorGrad)" opacity="0.5" />
          <line x1="280" y1="0" x2="10"  y2="700" stroke="rgba(255,235,150,0.12)" strokeWidth="1" />
          <line x1="280" y1="0" x2="550" y2="700" stroke="rgba(255,235,150,0.12)" strokeWidth="1" />
        </svg>

        {/* Performer Carousel — prev (left shadow) | active (center) | next (right shadow) */}
        <div
          className="performer-wrap"
          style={{
            position: 'absolute',
            bottom: '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(1200px, 130vw)',
            height: 'min(380px, 50vh)',
            zIndex: 10,
            opacity: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 'min(120px, 15vw)',
          }}
        >
          {/* PREV — left shadow */}
          <PerformerSlot
            key={`prev-${activePerformer}`}
            img={PERFORMERS[(activePerformer - 1 + PERFORMERS.length) % PERFORMERS.length].img}
            title={PERFORMERS[(activePerformer - 1 + PERFORMERS.length) % PERFORMERS.length].title}
            role="prev"
            dir={performerDir}
          />

          {/* ACTIVE — center, lit */}
          <div style={{ position: 'relative', flexShrink: 0, width: 'min(200px, 28vw)', height: '100%' }}>
            <AnimatePresence mode="wait" custom={performerDir}>
              <motion.div
                key={activePerformer}
                custom={performerDir}
                variants={{
                  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <Image
                  src={PERFORMERS[activePerformer].img}
                  alt={PERFORMERS[activePerformer].title}
                  fill
                  style={{
                    objectFit: 'cover', objectPosition: 'top',
                    maskImage: 'linear-gradient(to top, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%, black 85%, transparent 100%)',
                    filter: 'grayscale(10%) contrast(1.1)',
                  }}
                  sizes="200px"
                />
              </motion.div>
            </AnimatePresence>

            {/* Tag label below active */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${activePerformer}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                style={{
                  position: 'absolute', bottom: '-26px', left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: PERFORMERS[activePerformer].tagColor, flexShrink: 0,
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

            {/* Dot nav */}
            <div style={{
              position: 'absolute', bottom: '-48px',
              left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
              {PERFORMERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPerformer(i)}
                  style={{
                    width: i === activePerformer ? 18 : 4,
                    height: 3, borderRadius: 2,
                    border: 'none', cursor: 'pointer', padding: 0,
                    background: i === activePerformer ? 'var(--ws-red)' : 'rgba(83,83,83,0.5)',
                    transition: 'width 0.4s ease, background 0.4s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* NEXT — right shadow */}
          <PerformerSlot
            key={`next-${activePerformer}`}
            img={PERFORMERS[(activePerformer + 1) % PERFORMERS.length].img}
            title={PERFORMERS[(activePerformer + 1) % PERFORMERS.length].title}
            role="next"
            dir={performerDir}
          />
        </div>

        {/* Welcome Text — starts centered, animates to left via GSAP */}
        <div
          ref={welcomeRef}
          className="welcome-text"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            zIndex: 20,
            opacity: 0,
            textAlign: 'center',
          }}
        >
          <p className="welcome-est" style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', fontWeight: 400,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--ws-gray)', marginBottom: 10,
            opacity: 0,
          }}>Est. 2023</p>
          <h1 style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(3rem, 7.5vw, 7rem)',
            lineHeight: 0.92, textTransform: 'uppercase', color: 'var(--ws-cream)',
          }}>
            WELCOME<br />
            <span style={{ color: 'var(--ws-red)' }}>TO OUR</span><br />
            STAGE
          </h1>
          <p className="welcome-subtitle" style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem',
            color: 'var(--ws-gray)', marginTop: 16, lineHeight: 1.7, maxWidth: 170,
            opacity: 0,
          }}>
            Theatre that moves,<br />shocks, and wonders.
          </p>
        </div>

        {/* Events Column */}
        <div
          className="events-col"
          style={{ position: 'absolute', right: 'max(5%, 32px)', top: '26%', textAlign: 'right', zIndex: 20, opacity: 0 }}
        >
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', fontWeight: 400,
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'var(--ws-gray)', marginBottom: 16,
          }}>Navigate</p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid var(--ws-red)',
            width: 300,
            height: 100,
            position: 'relative',
            overflow: 'hidden',
          }}>
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
                  fontSize: '3.2rem', letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--ws-cream)',
                  whiteSpace: 'nowrap',
                }}
              >
                {EVENT_LABELS[activeLabel]}
              </motion.span>
            </AnimatePresence>
          </div>

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

// ── Shadow performer (prev/next) ────────────────────────────────
function PerformerSlot({ img, title, role, dir }: { img: string; title: string; role: 'prev' | 'next'; dir: number }) {
  return (
    <AnimatePresence custom={dir}>
      <motion.div
        key={img}
        custom={dir}
        variants={{
          enter: (d: number) => ({ x: d * 40, opacity: 0 }),
          center: { x: 0, opacity: 1 },
          exit: (d: number) => ({ x: d * -40, opacity: 0 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flexShrink: 0,
          width: 'min(120px, 14vw)',
          height: '78%',
          alignSelf: 'flex-end',
          position: 'relative',
        }}
      >
        <Image
          src={img}
          alt={title}
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'top',
            filter: 'grayscale(80%) brightness(0.25) contrast(1.1)',
            maskImage: role === 'prev'
              ? 'linear-gradient(to right, transparent 0%, black 40%, black 75%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%, black 88%, transparent 100%)'
              : 'linear-gradient(to left, transparent 0%, black 40%, black 75%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage: role === 'prev'
              ? 'linear-gradient(to right, transparent 0%, black 40%, black 75%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%, black 88%, transparent 100%)'
              : 'linear-gradient(to left, transparent 0%, black 40%, black 75%, transparent 100%), linear-gradient(to top, transparent 0%, black 12%, black 88%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
          sizes="120px"
        />
      </motion.div>
    </AnimatePresence>
  )
}