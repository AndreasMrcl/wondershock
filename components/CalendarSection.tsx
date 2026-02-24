'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const EVENTS_DATA: Record<string, { title: string; color: string }[]> = {
  '2026-3-15': [{ title: 'AHA Moment #3', color: '#ec2b25' }],
  '2026-3-20': [{ title: 'Voice Workshop', color: '#f6bc05' }],
  '2026-3-28': [{ title: 'Open Mic Night', color: '#ec2b25' }],
  '2026-4-5':  [{ title: 'My Story.Brand', color: '#f6bc05' }],
  '2026-4-12': [{ title: 'Movement Lab',   color: '#266adf' }],
  '2026-4-20': [{ title: 'Celebrating Disability', color: '#ec2b25' }],
  '2026-5-3':  [{ title: 'Voice & Movement', color: '#f6bc05' }],
  '2026-5-18': [{ title: 'The Unsaid Word', color: '#ec2b25' }],
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function CalendarSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  const cells = getCalendarDays(currentYear, currentMonth)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.cal-heading',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )
      gsap.fromTo('.cal-cell',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.35,
          stagger: { amount: 0.6, from: 'start' }, ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [currentMonth, currentYear])

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  return (
    <section
      ref={sectionRef}
      id="calendar"
      style={{ position: 'relative', padding: '80px max(5%,32px)', background: 'var(--ws-dark)' }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(to right, transparent, rgba(236,43,37,0.3), transparent)',
      }} />

      {/* Heading row */}
      <div
        className="cal-heading"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}
      >
        <div>
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', fontWeight: 400,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'var(--ws-gray)', marginBottom: 6,
          }}>Schedule</p>
          <h2 style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            textTransform: 'uppercase', color: 'var(--ws-cream)', lineHeight: 0.9,
          }}>CALENDAR</h2>
        </div>

        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={prevMonth} style={{
            width: 34, height: 34, border: '1px solid var(--ws-gray)',
            background: 'none', color: 'var(--ws-gray)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ws-red)'; e.currentTarget.style.color = 'var(--ws-red)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ws-gray)'; e.currentTarget.style.color = 'var(--ws-gray)' }}
          >←</button>

          <span style={{
            fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1.1rem',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: 'var(--ws-cream)', minWidth: 180, textAlign: 'center',
          }}>
            {MONTHS[currentMonth]} {currentYear}
          </span>

          <button onClick={nextMonth} style={{
            width: 34, height: 34, border: '1px solid var(--ws-gray)',
            background: 'none', color: 'var(--ws-gray)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ws-red)'; e.currentTarget.style.color = 'var(--ws-red)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ws-gray)'; e.currentTarget.style.color = 'var(--ws-gray)' }}
          >→</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 20 }}>
        {[
          { label: 'Show', color: '#ec2b25' },
          { label: 'Workshop', color: '#f6bc05' },
          { label: 'Special', color: '#266adf' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
              letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ws-gray)',
            }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        ref={gridRef}
        style={{ border: '1px solid rgba(221,219,216,0.08)', borderRadius: 2, overflow: 'hidden' }}
      >
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {DAYS.map(day => (
            <div key={day} style={{
              padding: '12px 8px', textAlign: 'center',
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.58rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--ws-gray)',
              borderBottom: '1px solid rgba(221,219,216,0.07)',
              background: 'rgba(221,219,216,0.02)',
            }}>{day}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            const key = `${currentYear}-${currentMonth + 1}-${day}`
            const evs = day ? (EVENTS_DATA[key] || []) : []
            const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()
            const hasEvent = evs.length > 0

            return (
              <div
                key={i}
                className="cal-cell"
                style={{
                  minHeight: 82, padding: '10px 8px',
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid rgba(221,219,216,0.06)' : 'none',
                  borderBottom: i < cells.length - 7 ? '1px solid rgba(221,219,216,0.06)' : 'none',
                  background: !day ? 'rgba(0,0,0,0.15)' : isToday ? 'rgba(236,43,37,0.09)' : hasEvent ? 'rgba(236,43,37,0.07)' : 'transparent',
                  cursor: day ? 'pointer' : 'default',
                }}
              >
                {day && (
                  <>
                    <span style={{
                      fontFamily: 'var(--font-barlow)', fontWeight: 700,
                      fontSize: '0.82rem', display: 'block', lineHeight: 1, marginBottom: 5,
                      color: isToday ? 'var(--ws-red)' : hasEvent ? 'var(--ws-cream)' : 'rgba(221,219,216,0.22)',
                      textDecoration: isToday ? 'underline' : 'none',
                      textDecorationColor: 'var(--ws-red)',
                      textUnderlineOffset: 3,
                    }}>{day}</span>
                    {evs.map((ev, j) => (
                      <div key={j} className="event-pill" style={{
                        background: ev.color, color: 'var(--ws-dark)',
                        marginTop: 2, maxWidth: '100%', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }} title={ev.title}>{ev.title}</div>
                    ))}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <motion.a
          href="#"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            border: '1px solid rgba(221,219,216,0.2)', padding: '12px 32px',
            fontFamily: 'var(--font-barlow)', fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--ws-sand)', textDecoration: 'none',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          whileHover={{ borderColor: 'var(--ws-red)', color: 'var(--ws-red)', letterSpacing: '0.26em' }}
          transition={{ duration: 0.3 }}
        >
          View Full Schedule
          <span style={{ color: 'var(--ws-red)' }}>→</span>
        </motion.a>
      </div>
    </section>
  )
}
