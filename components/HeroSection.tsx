'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
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
  const spotlightRef = useRef<SVGSVGElement>(null)
  const performerRef = useRef<HTMLDivElement>(null)
  const textWelcomeRef = useRef<HTMLDivElement>(null)
  const eventLabelRef = useRef<HTMLDivElement>(null)
  const eventIndexRef = useRef(0)
  const eventLabelEls = useRef<HTMLSpanElement[]>([])
  const { scrollY } = useScroll()

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

      // 1. Spotlight opens (cone scales + opacity)
      tl.fromTo(
        '.spotlight-svg',
        { scaleY: 0, transformOrigin: 'top center', opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.4, ease: 'power2.out' },
        0
      )

      // 2. Performer rises
      tl.fromTo(
        '.performer-img',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.1
      )

      // 3. Welcome text slides in
      tl.fromTo(
        '.welcome-text',
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' },
        0.15
      )

      // 4. Events label appears
      tl.fromTo(
        '.events-col',
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power3.out' },
        0.15
      )

      // 5. Spotlight gets brighter / performer bigger mid-scroll
      tl.to(
        '.spotlight-cone-inner',
        { opacity: 0.45, duration: 0.3 },
        0.35
      )

      // 6. Cycle through EVENTS → SHOWS → WORKSHOP labels
      // We do this via opacity toggling of pre-rendered elements
      tl.to('.event-label-0', { opacity: 0, y: -10, duration: 0.15 }, 0.45)
      tl.fromTo('.event-label-1', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.15 }, 0.5)
      tl.to('.event-label-1', { opacity: 0, y: -10, duration: 0.15 }, 0.65)
      tl.fromTo('.event-label-2', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.15 }, 0.7)

      // 7. Spotlight narrows (dramatic focus)
      tl.to(
        '.spotlight-svg',
        { scaleX: 0.6, duration: 0.4, ease: 'power2.inOut' },
        0.55
      )

      // 8. Welcome text morphs
      tl.to(
        '.welcome-text',
        { opacity: 0, x: -30, duration: 0.25 },
        0.75
      )

      // 9. Performer exits left as section transitions
      tl.to(
        '.performer-img',
        { x: -30, opacity: 0, duration: 0.3, ease: 'power2.in' },
        0.85
      )

      tl.to(
        '.spotlight-svg',
        { opacity: 0, duration: 0.2 },
        0.9
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative"
      style={{ height: '380vh' }}
    >
      <div
        ref={pinRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--ws-dark)' }}
      >
        {/* Stage floor line */}
        <div
          className="absolute bottom-[28%] left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(221,219,216,0.15), transparent)' }}
        />

        {/* Spotlight SVG */}
        <svg
          ref={spotlightRef}
          className="spotlight-svg absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          viewBox="0 0 400 600"
          width="400"
          height="600"
          style={{ transformOrigin: 'top center' }}
        >
          <defs>
            <radialGradient id="spotGrad" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
              <stop offset="0%" stopColor="#fff9e0" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#fde98a" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floorGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde98a" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Cone */}
          <polygon
            points="200,0 20,520 380,520"
            fill="url(#spotGrad)"
            className="spotlight-cone-inner"
            style={{ opacity: 0.25 }}
          />
          {/* Floor glow ellipse */}
          <ellipse cx="200" cy="520" rx="165" ry="30" fill="url(#floorGrad)" opacity="0.5" />
          {/* Cone edge lines */}
          <line x1="200" y1="0" x2="20" y2="520" stroke="rgba(255,235,150,0.12)" strokeWidth="1" />
          <line x1="200" y1="0" x2="380" y2="520" stroke="rgba(255,235,150,0.12)" strokeWidth="1" />
        </svg>

        {/* Performer */}
        <div
          ref={performerRef}
          className="performer-img absolute bottom-[22%] left-1/2 -translate-x-1/2 z-10"
          style={{ width: 220, height: 380 }}
        >
          <Image
            src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500&q=80&auto=format&fit=crop"
            alt="Performer on stage"
            fill
            className="object-cover object-top"
            style={{
              maskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%)',
              filter: 'grayscale(20%) contrast(1.1)',
            }}
            sizes="220px"
          />
        </div>

        {/* Welcome Text */}
        <div
          ref={textWelcomeRef}
          className="welcome-text absolute left-[6%] md:left-[8%] top-[30%]"
        >
          <p className="text-ws-gray text-xs tracking-[0.2em] uppercase mb-2 font-body">Est. 2023</p>
          <h1
            className="font-heading font-900 text-ws-cream leading-none"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontFamily: 'var(--font-barlow)' }}
          >
            WELCOME<br />
            <span style={{ color: 'var(--ws-red)' }}>TO OUR</span><br />
            STAGE
          </h1>
          <p className="font-body text-ws-gray mt-4 text-sm max-w-[180px] leading-relaxed">
            Theatre that moves,<br />shocks, and wonders.
          </p>
        </div>

        {/* Events Column */}
        <div
          className="events-col absolute right-[6%] md:right-[8%] top-[28%] text-right"
        >
          <p className="text-ws-gray text-[0.6rem] tracking-[0.25em] uppercase mb-4 font-body">Navigate</p>

          {/* Stacked event labels — controlled by GSAP */}
          <div className="relative" style={{ height: 80 }}>
            {EVENTS.map((ev, i) => (
              <div
                key={ev.label}
                className={`event-label-${i} absolute right-0`}
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {i === 1 ? (
                  <div
                    className="border border-ws-red px-4 py-2"
                    style={{ fontFamily: 'var(--font-barlow)' }}
                  >
                    <span className="font-heading font-900 text-ws-cream text-3xl tracking-wide uppercase">
                      {ev.label}
                    </span>
                  </div>
                ) : (
                  <span
                    className="font-heading font-700 uppercase tracking-widest text-ws-gray text-sm"
                    style={{ fontFamily: 'var(--font-barlow)' }}
                  >
                    {ev.label}
                  </span>
                )}
                {ev.sub && (
                  <p className="text-ws-gray text-[0.55rem] tracking-widest mt-1 font-body">{ev.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="mt-8 flex flex-col items-end gap-1">
            <span className="text-ws-gray text-[0.6rem] tracking-[0.15em] font-body">SCROLL</span>
            <motion.div
              className="w-px bg-ws-red"
              animate={{ height: [8, 24, 8] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Stage number */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
          style={{ opacity: 0.25 }}
        >
          <span className="font-heading font-900 text-[8rem] leading-none text-ws-sand pointer-events-none select-none"
            style={{ fontFamily: 'var(--font-barlow)' }}>
            01
          </span>
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(7,13,14,0.8) 100%)',
          }}
        />
      </div>
    </section>
  )
}
