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

const EVENTS_DATA: Record<string, { title: string; type: 'show' | 'workshop'; color: string }[]> = {
  '2026-3-15': [{ title: 'AHA Moment #3', type: 'show', color: '#ec2b25' }],
  '2026-3-20': [{ title: 'Voice Workshop', type: 'workshop', color: '#f6bc05' }],
  '2026-3-28': [{ title: 'Open Mic Night', type: 'show', color: '#ec2b25' }],
  '2026-4-5': [{ title: 'My Story.Brand', type: 'workshop', color: '#f6bc05' }],
  '2026-4-12': [{ title: 'Movement Lab', type: 'workshop', color: '#266adf' }],
  '2026-4-20': [{ title: 'Celebrating Disability', type: 'show', color: '#ec2b25' }],
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
    if (!sectionRef.current || !gridRef.current) return

    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        '.cal-heading',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      )

      // Grid cells stagger
      gsap.fromTo(
        '.cal-cell',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: { amount: 0.7, from: 'start' },
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          },
        }
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
      className="relative py-20 px-6 md:px-14"
      style={{ background: 'var(--ws-dark)' }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(236,43,37,0.3), transparent)' }}
      />

      {/* Heading */}
      <div className="cal-heading mb-12 flex items-end justify-between">
        <div>
          <p className="text-ws-gray text-[0.65rem] tracking-[0.25em] uppercase font-body mb-2">Schedule</p>
          <h2
            className="font-heading font-900 text-ws-cream uppercase leading-none"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontFamily: 'var(--font-barlow)' }}
          >
            CALENDAR
          </h2>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="w-8 h-8 border border-ws-gray text-ws-gray hover:border-ws-red hover:text-ws-red flex items-center justify-center transition-colors text-sm"
          >
            ←
          </button>
          <span
            className="font-heading font-700 text-ws-cream text-lg uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-barlow)', minWidth: 160, textAlign: 'center' }}
          >
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 border border-ws-gray text-ws-gray hover:border-ws-red hover:text-ws-red flex items-center justify-center transition-colors text-sm"
          >
            →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mb-6">
        {[
          { label: 'Show', color: '#ec2b25' },
          { label: 'Workshop', color: '#f6bc05' },
          { label: 'Special', color: '#266adf' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-ws-gray text-[0.65rem] tracking-widest uppercase font-body">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        ref={gridRef}
        className="border border-ws-sand border-opacity-10 rounded-sm overflow-hidden"
        style={{ borderColor: 'rgba(221,219,216,0.1)' }}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DAYS.map(day => (
            <div
              key={day}
              className="py-3 text-center text-[0.6rem] tracking-[0.2em] text-ws-gray font-heading font-700 uppercase border-b"
              style={{
                fontFamily: 'var(--font-barlow)',
                borderColor: 'rgba(221,219,216,0.08)',
                background: 'rgba(221,219,216,0.02)',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const eventKey = `${currentYear}-${currentMonth + 1}-${day}`
            const hasEvent = day && EVENTS_DATA[eventKey]
            const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()

            return (
              <div
                key={i}
                className={`cal-cell relative p-2 md:p-3 ${day ? 'cursor-pointer' : ''} ${hasEvent ? 'has-event' : ''}`}
                style={{
                  borderRight: (i + 1) % 7 !== 0 ? '1px solid rgba(221,219,216,0.06)' : 'none',
                  borderBottom: i < cells.length - 7 ? '1px solid rgba(221,219,216,0.06)' : 'none',
                  background: isToday ? 'rgba(236,43,37,0.08)' : undefined,
                  minHeight: 80,
                }}
              >
                {day && (
                  <>
                    <span
                      className={`font-heading font-700 text-sm leading-none block mb-1`}
                      style={{
                        fontFamily: 'var(--font-barlow)',
                        color: isToday ? 'var(--ws-red)' : hasEvent ? 'var(--ws-cream)' : 'rgba(221,219,216,0.35)',
                      }}
                    >
                      {isToday ? (
                        <span className="relative">
                          {day}
                          <span
                            className="absolute -bottom-0.5 left-0 right-0 h-[1.5px]"
                            style={{ background: 'var(--ws-red)' }}
                          />
                        </span>
                      ) : day}
                    </span>

                    {/* Event pills */}
                    {hasEvent && EVENTS_DATA[eventKey].map((ev, j) => (
                      <div
                        key={j}
                        className="event-pill mt-1 text-ws-dark truncate"
                        style={{ background: ev.color, maxWidth: '100%' }}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <motion.a
          href="#"
          className="inline-flex items-center gap-3 border border-ws-sand border-opacity-20 px-8 py-3 text-ws-sand text-xs tracking-widest uppercase font-heading hover:border-ws-red hover:text-ws-red transition-colors"
          style={{ fontFamily: 'var(--font-barlow)', borderColor: 'rgba(221,219,216,0.2)' }}
          whileHover={{ letterSpacing: '0.22em' }}
          transition={{ duration: 0.3 }}
        >
          View Full Schedule
          <span className="text-ws-red">→</span>
        </motion.a>
      </div>
    </section>
  )
}
