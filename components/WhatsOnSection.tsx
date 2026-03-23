'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ── Types ────────────────────────────────────────────────────────
interface Event {
  id: string
  title: string
  subtitle: string | null
  date: string
  type: 'show' | 'workshop' | 'special'
  image_url: string | null
  price: string | null
  description: string | null
  order_num: number
}

// ── Type color map ───────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  show:     '#ec2b25',
  workshop: '#f6bc05',
  special:  '#266adf',
}

// ── Fallback placeholder image per type ─────────────────────────
const TYPE_IMG: Record<string, string> = {
  show:     'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  workshop: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
  special:  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WhatsOnSection() {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const trackRef    = useRef<HTMLDivElement>(null)
  const headingRef  = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fetch events ────────────────────────────────────────────────
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    fetch(`${apiUrl}/api/events`)
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  // ── GSAP horizontal scroll ───────────────────────────────────────
  useEffect(() => {
    if (!sectionRef.current || !trackRef.current || loading) return

    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )

      const totalWidth     = trackRef.current?.scrollWidth || 0
      const containerWidth = sectionRef.current?.offsetWidth || 0
      const scrollDistance = totalWidth - containerWidth + 80

      if (scrollDistance <= 0) return

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
            if (progressRef.current)
              progressRef.current.style.width = (self.progress * 100) + '%'
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
  }, [loading, events])

  return (
    <section
      ref={sectionRef}
      id="whats-on"
      style={{ minHeight: '100vh', position: 'relative', background: 'var(--ws-dark)' }}
    >
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
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--ws-gray)', marginBottom: 4,
            }}>Programme</p>
            <span style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
              textTransform: 'uppercase', color: 'var(--ws-cream)',
            }}>What&apos;s On</span>
          </div>
          <div style={{ width: 40, height: 1.5, background: 'var(--ws-red)', opacity: 0.7, flexShrink: 0 }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
          letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ws-gray)',
        }}>Scroll to explore →</span>
      </div>

      {/* Track */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: '100vh', paddingTop: 80, paddingBottom: 40,
        paddingLeft: 'max(5%, 32px)',
      }}>
        {loading ? (
          // Loading skeleton
          <div style={{ display: 'flex', gap: 18, alignItems: 'stretch' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                flexShrink: 0, width: 268, minHeight: 'min(420px, 70vh)',
                background: 'rgba(221,219,216,0.04)', borderRadius: 2,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : (
          <div
            ref={trackRef}
            style={{ display: 'flex', gap: 18, alignItems: 'stretch', willChange: 'transform' }}
          >
            {events.length === 0 ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 400, minHeight: 'min(420px,70vh)',
                color: 'var(--ws-gray)',
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem',
              }}>
                Belum ada event. Tambahkan melalui admin panel.
              </div>
            ) : (
              events.map((event, i) => (
                <ShowCard key={event.id} event={event} index={i} />
              ))
            )}

            {/* CTA card */}
            <Link href="/events" style={{ textDecoration: 'none' }}>
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
            </Link>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 24,
        left: 'max(5%,32px)', right: 'max(5%,32px)',
        height: 1, background: 'rgba(83,83,83,0.25)',
      }}>
        <div ref={progressRef} style={{ height: '100%', background: 'var(--ws-red)', width: '0%' }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </section>
  )
}

// ── Show Card ────────────────────────────────────────────────────
function ShowCard({ event, index }: { event: Event; index: number }) {
  const color = TYPE_COLOR[event.type] || '#ec2b25'
  const img   = event.image_url || TYPE_IMG[event.type] || TYPE_IMG.show

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
        <img
          src={img}
          alt={event.title}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(20%) contrast(1.05)',
            transition: 'transform 0.7s',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,13,14,0.96) 0%, rgba(7,13,14,0.35) 55%, transparent 100%)',
        }} />
      </div>

      {/* Badge */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 5 }}>
        <span className="event-pill" style={{ background: color, color: 'var(--ws-dark)' }}>
          {event.type.toUpperCase()}
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
        }}>{formatDate(event.date)}</p>
        <h3 style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: '1.25rem', textTransform: 'uppercase',
          color: 'var(--ws-cream)', lineHeight: 1.05, marginBottom: 4,
        }}>{event.title}</h3>
        {event.subtitle && (
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--ws-sand)' }}>
            {event.subtitle}
          </p>
        )}
        {event.price && (
          <p style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 700,
            fontSize: '0.75rem', color: color, marginTop: 6,
            letterSpacing: '0.08em',
          }}>{event.price}</p>
        )}

        {/* CTA */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div
            style={{ flex: 1, height: 1, background: color, scaleX: 0, transformOrigin: 'left' }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.35 }}
          />
          <span style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 700,
            fontSize: '0.6rem', letterSpacing: '0.18em',
            textTransform: 'uppercase', color: color,
          }}>Book</span>
        </div>
      </div>

      {/* Bottom accent */}
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: 2,
          background: color, scaleX: 0, transformOrigin: 'left',
        }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  )
}