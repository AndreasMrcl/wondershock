'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const SHOWS = [
  {
    id: 1,
    title: 'AHA Moment #3',
    subtitle: 'The Art of Storytelling',
    date: 'Mar 15, 2026',
    type: 'SHOW',
    typeColor: '#ec2b25',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  },
  {
    id: 2,
    title: 'My Story. My Brand.',
    subtitle: 'Personal Branding Workshop',
    date: 'Apr 5, 2026',
    type: 'WORKSHOP',
    typeColor: '#f6bc05',
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80',
  },
  {
    id: 3,
    title: 'Celebrating Disability',
    subtitle: 'Bonnie & Anna Armistead',
    date: 'Apr 20, 2026',
    type: 'SHOW',
    typeColor: '#ec2b25',
    img: 'https://images.unsplash.com/photo-1543269664-647163b02c9a?w=600&q=80',
  },
  {
    id: 4,
    title: 'Voice & Movement',
    subtitle: 'Intensive 2-Day Program',
    date: 'May 3, 2026',
    type: 'WORKSHOP',
    typeColor: '#f6bc05',
    img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
  },
  {
    id: 5,
    title: 'The Unsaid Word',
    subtitle: 'Drama in 3 Acts',
    date: 'May 18, 2026',
    type: 'SHOW',
    typeColor: '#ec2b25',
    img: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=600&q=80',
  },
]

export default function WhatsOnSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return

    const ctx = gsap.context(() => {
      // Section heading reveal
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      )

      // Horizontal scroll pinning
      const cards = trackRef.current?.querySelectorAll('.show-card-item')
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
        },
      })

      // Cards stagger reveal
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="whats-on"
      className="relative bg-ws-dark"
      style={{ minHeight: '100vh' }}
    >
      {/* Curtain edges */}
      <div className="curtain-left" />
      <div className="curtain-right" />

      {/* Section label */}
      <div ref={headingRef} className="absolute top-8 left-0 right-0 z-20 px-8 md:px-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className="font-heading font-900 text-ws-cream text-2xl md:text-3xl uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-barlow)' }}
          >
            What&apos;s On
          </span>
          <div className="h-px flex-1 w-12 bg-ws-red opacity-60" />
        </div>
        <span className="text-ws-gray text-xs tracking-[0.2em] uppercase font-body">
          Drag to explore →
        </span>
      </div>

      {/* Horizontal track */}
      <div
        className="flex items-center h-screen pt-20 pb-10"
        style={{ paddingLeft: '8vw' }}
      >
        <div
          ref={trackRef}
          className="flex gap-5 items-stretch"
          style={{ willChange: 'transform' }}
        >
          {SHOWS.map((show, i) => (
            <ShowCard key={show.id} show={show} index={i} />
          ))}

          {/* CTA card */}
          <div
            className="show-card-item flex-shrink-0 border border-ws-red flex flex-col items-center justify-center"
            style={{ width: 260, minHeight: 380 }}
          >
            <span
              className="font-heading font-900 text-ws-red text-4xl uppercase mb-4 block"
              style={{ fontFamily: 'var(--font-barlow)' }}
            >
              See All
            </span>
            <div className="w-8 h-8 border border-ws-red flex items-center justify-center">
              <span className="text-ws-red">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress line */}
      <div className="absolute bottom-6 left-8 right-8 h-px bg-ws-gray opacity-20">
        <motion.div
          className="h-full bg-ws-red"
          style={{ width: '15%' }}
        />
      </div>
    </section>
  )
}

function ShowCard({ show, index }: { show: typeof SHOWS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={cardRef}
      className="show-card-item show-card flex-shrink-0 relative overflow-hidden group"
      style={{ width: 280, minHeight: 400, cursor: 'pointer' }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <Image
          src={show.img}
          alt={show.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="280px"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(7,13,14,0.95) 0%, rgba(7,13,14,0.4) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Type badge */}
      <div className="absolute top-4 left-4 z-10">
        <span
          className="event-pill text-ws-dark"
          style={{ background: show.typeColor }}
        >
          {show.type}
        </span>
      </div>

      {/* Number */}
      <div
        className="absolute top-3 right-4 z-10 font-heading font-900 text-ws-cream opacity-20 text-4xl leading-none"
        style={{ fontFamily: 'var(--font-barlow)' }}
      >
        0{index + 1}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <p className="font-body text-ws-gray text-[0.65rem] tracking-[0.15em] uppercase mb-1">{show.date}</p>
        <h3
          className="font-heading font-900 text-ws-cream text-xl uppercase leading-tight mb-1"
          style={{ fontFamily: 'var(--font-barlow)' }}
        >
          {show.title}
        </h3>
        <p className="font-body text-ws-sand text-xs">{show.subtitle}</p>

        {/* CTA line */}
        <motion.div
          className="mt-4 flex items-center gap-2 overflow-hidden"
          initial={{ width: 0 }}
        >
          <div className="h-px flex-1 bg-ws-red" />
          <span className="text-ws-red text-xs font-heading tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-barlow)' }}>
            Book
          </span>
        </motion.div>
      </div>

      {/* Hover red line accent */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-[2px] bg-ws-red"
        initial={{ scaleX: 0, transformOrigin: 'left' }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  )
}
