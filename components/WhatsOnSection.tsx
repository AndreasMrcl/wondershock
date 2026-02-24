'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const SHOWS = [
  {
    id: 1, title: 'AHA Moment #3', subtitle: 'The Art of Storytelling',
    date: 'Mar 15, 2026', type: 'SHOW', typeColor: '#ec2b25',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  },
  {
    id: 2, title: 'My Story. My Brand.', subtitle: 'Personal Branding Workshop',
    date: 'Apr 5, 2026', type: 'WORKSHOP', typeColor: '#f6bc05',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
  },
  {
    id: 3, title: 'Celebrating Disability', subtitle: 'Bonnie & Anna Armistead',
    date: 'Apr 20, 2026', type: 'SHOW', typeColor: '#ec2b25',
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80&auto=format&fit=crop',
  },
  {
    id: 4, title: 'Voice & Movement', subtitle: 'Intensive 2-Day Program',
    date: 'May 3, 2026', type: 'WORKSHOP', typeColor: '#f6bc05',
    img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
  },
  {
    id: 5, title: 'The Unsaid Word', subtitle: 'Drama in 3 Acts',
    date: 'May 18, 2026', type: 'SHOW', typeColor: '#ec2b25',
    img: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&q=80',
  },
]

export default function WhatsOnSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )

      const totalWidth = trackRef.current?.scrollWidth || 0
      const containerWidth = sectionRef.current?.offsetWidth || 0
      const scrollDistance = totalWidth - containerWidth + 80

      gsap.to(trackRef.current, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${scrollDistance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onUpdate: self => {
            if (progressRef.current) {
              progressRef.current.style.width = (self.progress * 100) + '%'
            }
          },
        },
      })

      gsap.fromTo('.show-card-item',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="whats-on"
      style={{ minHeight: '100vh', position: 'relative', background: 'var(--ws-dark)' }}
    >
      {/* Curtain edges */}
      <div className="curtain-left" />
      <div className="curtain-right" />

      {/* Header */}
      <div
        ref={headingRef}
        style={{
          position: 'absolute', top: 28, left: 0, right: 0, zIndex: 20,
          padding: '0 max(5%,32px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem', fontWeight: 400,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--ws-gray)', marginBottom: 4,
            }}>Programme</p>
            <span style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
              textTransform: 'uppercase', color: 'var(--ws-cream)', letterSpacing: '0.02em',
            }}>What&apos;s On</span>
          </div>
          <div style={{ width: 40, height: 1.5, background: 'var(--ws-red)', opacity: 0.7, flexShrink: 0 }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
          letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ws-gray)',
        }}>Scroll to explore →</span>
      </div>

      {/* Horizontal track container */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: '100vh', paddingTop: 80, paddingBottom: 40,
        paddingLeft: 'max(5%, 32px)',
      }}>
        <div
          ref={trackRef}
          style={{ display: 'flex', gap: 18, alignItems: 'stretch', willChange: 'transform' }}
        >
          {SHOWS.map((show, i) => (
            <ShowCard key={show.id} show={show} index={i} />
          ))}

          {/* CTA card */}
          <div
            className="show-card-item"
            style={{
              flexShrink: 0, width: 240, minHeight: 'min(420px, 70vh)',
              border: '1.5px solid var(--ws-red)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 14,
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(236,43,37,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: '2.2rem', textTransform: 'uppercase', color: 'var(--ws-red)',
            }}>See All</span>
            <div style={{
              width: 32, height: 32, border: '1.5px solid var(--ws-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ws-red)', fontSize: '1rem',
            }}>→</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 24,
        left: 'max(5%,32px)', right: 'max(5%,32px)',
        height: 1, background: 'rgba(83,83,83,0.25)',
      }}>
        <div
          ref={progressRef}
          style={{ height: '100%', background: 'var(--ws-red)', width: '0%', transition: 'width 0.1s' }}
        />
      </div>
    </section>
  )
}

function ShowCard({ show, index }: { show: typeof SHOWS[0]; index: number }) {
  return (
    <motion.div
      className="show-card-item"
      style={{
        flexShrink: 0, width: 268, minHeight: 'min(420px, 70vh)',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
      }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Image */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <Image
          src={show.img}
          alt={show.title}
          fill
          style={{ objectFit: 'cover', filter: 'grayscale(20%) contrast(1.05)', transition: 'transform 0.7s' }}
          sizes="268px"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,13,14,0.96) 0%, rgba(7,13,14,0.35) 55%, transparent 100%)',
        }} />
      </div>

      {/* Badge */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 5 }}>
        <span className="event-pill" style={{ background: show.typeColor, color: 'var(--ws-dark)' }}>
          {show.type}
        </span>
      </div>

      {/* Number */}
      <div style={{
        position: 'absolute', top: 10, right: 14, zIndex: 5,
        fontFamily: 'var(--font-barlow)', fontWeight: 900,
        fontSize: '3rem', color: 'rgba(241,241,239,0.12)', lineHeight: 1,
      }}>0{index + 1}</div>

      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, zIndex: 5 }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ws-gray)', marginBottom: 5,
        }}>{show.date}</p>
        <h3 style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: '1.25rem', textTransform: 'uppercase',
          color: 'var(--ws-cream)', lineHeight: 1.05, marginBottom: 4,
        }}>{show.title}</h3>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--ws-sand)' }}>
          {show.subtitle}
        </p>

        {/* CTA */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div
            style={{ flex: 1, height: 1, background: 'var(--ws-red)', scaleX: 0, transformOrigin: 'left' }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.35 }}
          />
          <span style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 700,
            fontSize: '0.6rem', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--ws-red)',
          }}>Book</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 2,
          background: 'var(--ws-red)', scaleX: 0, transformOrigin: 'left',
        }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  )
}
