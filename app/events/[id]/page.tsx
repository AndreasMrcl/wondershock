'use client'

// app/events/[id]/page.tsx

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '@/components/Navbar'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const TYPE_COLOR: Record<string, string> = {
  show: '#ec2b25', workshop: '#f6bc05', special: '#266adf',
}
const TYPE_LABEL: Record<string, string> = {
  show: 'Show', workshop: 'Workshop', special: 'Special Event',
}

interface Performer {
  name: string
  role: string
  photo_url?: string
}
interface TicketType {
  name: string
  price: number
  quota: number
  description?: string
}
interface Event {
  id: string
  title: string
  subtitle: string | null
  date: string
  type: 'show' | 'workshop' | 'special'
  image_url: string | null
  price: string | null
  description: string | null
  venue: string | null
  venue_address: string | null
  venue_maps_url: string | null
  performers: Performer[]
  terms: string | null
  ticket_types: TicketType[]
  capacity: number | null
  tags: string[]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
}
function formatPrice(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function EventDetailPage() {
  const { id } = useParams()
  const router  = useRouter()
  const [event, setEvent]     = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [ticketOpen, setTicketOpen] = useState(false)
  const heroRef   = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    fetch(`${API}/api/events/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => setEvent(d.event))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!event || !heroRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.detail-hero-text > *',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo('.detail-section',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 80%' } }
      )
    })
    return () => ctx.revert()
  }, [event])

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'var(--ws-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-barlow)', color: 'var(--ws-gray)', letterSpacing: '3px', fontSize: '0.7rem', textTransform: 'uppercase' }}>
          Memuat...
        </p>
      </div>
    </>
  )

  if (notFound || !event) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'var(--ws-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '4rem', color: 'rgba(221,219,216,0.1)' }}>404</p>
        <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--ws-gray)' }}>Event tidak ditemukan.</p>
        <Link href="/events" style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ws-red)', textDecoration: 'none' }}>← Kembali ke Events</Link>
      </div>
    </>
  )

  const color       = TYPE_COLOR[event.type]
  const heroImg     = event.image_url
  const performers  = event.performers  || []
  const ticketTypes = event.ticket_types || []
  const tags        = event.tags || []
  const hasTickets  = ticketTypes.length > 0

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--ws-dark)', minHeight: '100vh' }}>

        {/* ── BACK BUTTON ── */}
        <div style={{ position: 'fixed', top: 80, left: 'max(5%,32px)', zIndex: 50 }}>
          <Link href="/events">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ x: -4 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(7,13,14,0.7)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(221,219,216,0.1)',
                borderRadius: 4, padding: '8px 16px', cursor: 'pointer',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--ws-gray)', textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: '0.8rem' }}>←</span> Events
            </motion.div>
          </Link>
        </div>

        {/* ── HERO ── */}
        <div ref={heroRef} style={{ position: 'relative', height: 'min(85vh, 700px)', overflow: 'hidden' }}>
          {/* Background image */}
          {heroImg ? (
            <img src={heroImg} alt={event.title} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', filter: 'brightness(0.35) saturate(0.8)',
            }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, #0a1213 0%, ${color}22 100%)` }} />
          )}

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, var(--ws-dark) 0%, rgba(7,13,14,0.6) 50%, rgba(7,13,14,0.3) 100%)',
          }} />

          {/* Vertical type label */}
          <div style={{
            position: 'absolute', right: 'max(5%,48px)', top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: '0.58rem', letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(221,219,216,0.2)',
          }}>{TYPE_LABEL[event.type]}</div>

          {/* Content */}
          <div className="detail-hero-text" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 max(5%,48px) 48px',
          }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Link href="/events" style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem',
                letterSpacing: '0.1em', color: 'var(--ws-gray)', textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)'}
              >Events</Link>
              <span style={{ color: 'rgba(221,219,216,0.2)', fontSize: '0.6rem' }}>›</span>
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'rgba(221,219,216,0.4)' }}>
                {event.title}
              </span>
            </div>

            {/* Type badge */}
            <span style={{
              display: 'inline-block',
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
              background: color, color: 'var(--ws-dark)',
              padding: '4px 12px', borderRadius: 2, marginBottom: 16,
            }}>{TYPE_LABEL[event.type]}</span>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(2.5rem, 7vw, 6rem)',
              textTransform: 'uppercase', lineHeight: 0.9,
              color: 'var(--ws-cream)', letterSpacing: '-0.02em',
              marginBottom: 12,
            }}>{event.title}</h1>

            {event.subtitle && (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', color: 'var(--ws-sand)', marginBottom: 16 }}>
                {event.subtitle}
              </p>
            )}

            {/* Quick info row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: color, fontSize: '0.75rem' }}>📅</span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-sand)' }}>
                  {formatDate(event.date)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: color, fontSize: '0.75rem' }}>🕐</span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-sand)' }}>
                  {formatTime(event.date)}
                </span>
              </div>
              {event.venue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: color, fontSize: '0.75rem' }}>📍</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-sand)' }}>
                    {event.venue}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div ref={contentRef} style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 340px',
          gap: 40,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px max(5%,48px) 100px',
        }}
        className="event-detail-grid"
        >

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            {/* About */}
            {event.description && (
              <div className="detail-section">
                <SectionLabel color={color}>Tentang Event</SectionLabel>
                <p style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '0.95rem',
                  color: 'var(--ws-sand)', lineHeight: 1.8,
                  whiteSpace: 'pre-line',
                }}>{event.description}</p>
              </div>
            )}

            {/* Performers */}
            {performers.length > 0 && (
              <div className="detail-section">
                <SectionLabel color={color}>Lineup & Performer</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                  {performers.map((p, i) => (
                    <PerformerCard key={i} performer={p} color={color} />
                  ))}
                </div>
              </div>
            )}

            {/* Venue */}
            {event.venue && (
              <div className="detail-section">
                <SectionLabel color={color}>Lokasi & Venue</SectionLabel>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 4, padding: '20px 24px',
                }}>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 6 }}>
                    {event.venue}
                  </p>
                  {event.venue_address && (
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-gray)', lineHeight: 1.6, marginBottom: 14 }}>
                      {event.venue_address}
                    </p>
                  )}
                  {event.venue_maps_url && (
                    <a href={event.venue_maps_url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontFamily: 'var(--font-barlow)', fontWeight: 700,
                      fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: color, textDecoration: 'none',
                    }}>
                      Lihat di Google Maps →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Terms */}
            {event.terms && (
              <div className="detail-section">
                <SectionLabel color={color}>Syarat & Ketentuan</SectionLabel>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 4, padding: '20px 24px',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
                    color: 'var(--ws-gray)', lineHeight: 1.9,
                    whiteSpace: 'pre-line',
                  }}>{event.terms}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="detail-section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((tag, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--ws-gray)',
                    border: '1px solid rgba(221,219,216,0.1)',
                    borderRadius: 2, padding: '5px 12px',
                  }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'sticky', top: 100,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>

              {/* Ticket card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}33`,
                borderRadius: 6, padding: '28px 24px',
              }}>
                {/* Accent line */}
                <div style={{ width: 32, height: 2, background: color, marginBottom: 20 }} />

                <p style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--ws-gray)', marginBottom: 6,
                }}>Harga Tiket</p>

                <p style={{
                  fontFamily: 'var(--font-barlow)', fontWeight: 900,
                  fontSize: '2rem', color: color, letterSpacing: '-0.02em', marginBottom: 4,
                }}>
                  {event.price ? (event.price.startsWith('Rp') ? event.price : `Rp ${event.price}`) : 'TBA'}
                </p>

                {event.capacity && (
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--ws-gray)', marginBottom: 20 }}>
                    Kapasitas {event.capacity.toLocaleString('id-ID')} orang
                  </p>
                )}

                {/* Ticket types preview */}
                {ticketTypes.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {ticketTypes.map((t, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 3,
                      }}>
                        <div>
                          <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--ws-cream)', textTransform: 'uppercase' }}>{t.name}</p>
                          {t.description && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)', marginTop: 2 }}>{t.description}</p>}
                        </div>
                        <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.9rem', color: color, flexShrink: 0, marginLeft: 12 }}>
                          {formatPrice(t.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <motion.button
                  onClick={() => setTicketOpen(true)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '14px',
                    background: color, border: 'none', borderRadius: 4,
                    fontFamily: 'var(--font-barlow)', fontWeight: 900,
                    fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: event.type === 'workshop' ? 'var(--ws-dark)' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  {hasTickets ? 'Pesan Tiket' : 'Daftar Sekarang'}
                </motion.button>

                <p style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem',
                  color: 'var(--ws-gray)', textAlign: 'center', marginTop: 10,
                  lineHeight: 1.5,
                }}>
                  Sistem tiket online segera hadir.<br />Hubungi kami untuk info lebih lanjut.
                </p>
              </div>

              {/* Share */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 4, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ws-gray)' }}>
                  Share Event
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { label: 'WA', href: `https://wa.me/?text=${encodeURIComponent(`${event.title} — ${typeof window !== 'undefined' ? window.location.href : ''}`)}` },
                    { label: 'IG', href: 'https://instagram.com/wondershocktheatre' },
                    { label: 'TW', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}` },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                      fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.6rem',
                      letterSpacing: '0.1em', color: 'var(--ws-gray)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 2, padding: '5px 10px', textDecoration: 'none',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = color; (e.currentTarget as HTMLElement).style.borderColor = color }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                    >{s.label}</a>
                  ))}
                </div>
              </div>

              {/* Back link */}
              <Link href="/events" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--ws-gray)', textDecoration: 'none',
                padding: '12px 0', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ws-gray)'}
              >
                ← Semua Events
              </Link>
            </div>
          </div>
        </div>

        {/* ── TICKET MODAL (placeholder) ── */}
        <AnimatePresence>
          {ticketOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(7,13,14,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              }}
              onClick={e => { if (e.target === e.currentTarget) setTicketOpen(false) }}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.28 }}
                style={{
                  background: '#0a1213',
                  border: `1px solid ${color}33`,
                  borderRadius: 8, padding: '40px 36px',
                  maxWidth: 420, width: '100%', textAlign: 'center',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.4rem' }}>
                  🎭
                </div>
                <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 12 }}>
                  Sistem Tiket<br /><span style={{ color }}>Segera Hadir</span>
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-gray)', lineHeight: 1.7, marginBottom: 28 }}>
                  Untuk sementara, hubungi kami langsung melalui WhatsApp atau Instagram untuk pemesanan tiket <strong style={{ color: 'var(--ws-sand)' }}>{event.title}</strong>.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href="https://wa.me/628XXXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, padding: '12px', background: '#25D366', border: 'none', borderRadius: 4,
                    fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem',
                    letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white',
                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>WhatsApp</a>
                  <a href="https://instagram.com/wondershocktheatre" target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, padding: '12px', background: color, border: 'none', borderRadius: 4,
                    fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem',
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: event.type === 'workshop' ? 'var(--ws-dark)' : 'white',
                    textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>Instagram</a>
                </div>
                <button onClick={() => setTicketOpen(false)} style={{
                  marginTop: 16, background: 'none', border: 'none',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem',
                  color: 'var(--ws-gray)', cursor: 'pointer',
                }}>Tutup</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <style>{`
        @media (max-width: 768px) {
          .event-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

// ── Sub components ────────────────────────────────────────────────
function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <div style={{ width: 3, height: 22, background: color, flexShrink: 0 }} />
      <h2 style={{
        fontFamily: 'var(--font-barlow)', fontWeight: 900,
        fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--ws-cream)',
      }}>{children}</h2>
    </div>
  )
}

function PerformerCard({ performer, color }: { performer: Performer; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 4, padding: '16px', textAlign: 'center',
    }}>
      {performer.photo_url ? (
        <img src={performer.photo_url} alt={performer.name} style={{
          width: 64, height: 64, borderRadius: '50%',
          objectFit: 'cover', marginBottom: 12,
          border: `2px solid ${color}44`,
        }} />
      ) : (
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: `${color}22`, border: `2px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: '1.4rem', color: color,
        }}>
          {performer.name.charAt(0)}
        </div>
      )}
      <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 4 }}>
        {performer.name}
      </p>
      <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--ws-gray)' }}>
        {performer.role}
      </p>
    </div>
  )
}