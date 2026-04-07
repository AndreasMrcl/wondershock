'use client'

// app/events/page.tsx
// Halaman publik list event + admin panel inline untuk admin

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/lib/authContext'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

// ── Types ────────────────────────────────────────────────────────
interface Performer { name: string; role: string; photo_url?: string }
interface TicketType { name: string; price: number; quota: number; description?: string }

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
  is_active: boolean
  venue: string | null
  venue_address: string | null
  venue_maps_url: string | null
  performers: Performer[]
  terms: string | null
  ticket_types: TicketType[]
  capacity: number | null
  tags: string[]
}

const TYPE_COLOR: Record<string, string> = {
  show: '#ec2b25', workshop: '#f6bc05', special: '#266adf',
}
const TYPE_IMG: Record<string, string> = {
  show:     'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  workshop: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
  special:  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
}

const EMPTY_PERFORMER = { name: '', role: '', photo_url: '' }

const EMPTY_FORM = {
  title: '', subtitle: '', date: '', 
  type: 'show' as 'show' | 'workshop' | 'special',
  image_url: '', price: '', description: '',
  order_num: 0, is_active: true,
  venue: '', venue_address: '', venue_maps_url: '',
  performers: [{ ...EMPTY_PERFORMER }] as { name: string; role: string; photo_url: string }[],
  terms: '', ticket_types: '[]',
  capacity: '', tags: '',
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [events, setEvents]         = useState<Event[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<'all' | 'show' | 'workshop' | 'special'>('all')
  const [adminOpen, setAdminOpen]   = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Event | null>(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState('')
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [hoveredId, setHoveredId]   = useState<string | null>(null)

  const headerRef = useRef<HTMLDivElement>(null)
  const listRef   = useRef<HTMLDivElement>(null)

  const token   = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const endpoint = isAdmin ? `${API}/api/events/all` : `${API}/api/events`
      const opts     = isAdmin ? { headers } : {}
      const r        = await fetch(endpoint, opts)
      const d        = await r.json()
      setEvents(d.events || [])
    } catch { setEvents([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [isAdmin])

  // ── GSAP entrance ──────────────────────────────────────────────
  useEffect(() => {
    if (loading || !headerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.ev-header-line',
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
      )
      gsap.fromTo('.ev-title-word',
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.3 }
      )
      gsap.fromTo('.ev-card',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: listRef.current, start: 'top 80%' } }
      )
    })
    return () => ctx.revert()
  }, [loading])

  // ── Form helpers ───────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setFormError(''); setShowForm(true)
  }
  const openEdit = (ev: Event) => {
    setEditing(ev)
    setForm({
      title: ev.title, subtitle: ev.subtitle || '', date: ev.date?.split('T')[0] || '',
      type: ev.type, image_url: ev.image_url || '',
      price: ev.price || '', description: ev.description || '',
      order_num: ev.order_num, is_active: ev.is_active,
      venue: ev.venue || '', venue_address: ev.venue_address || '',
      venue_maps_url: ev.venue_maps_url || '',
      performers: (() => {
        let raw = ev.performers
        if (typeof raw === 'string') { try { raw = JSON.parse(raw) } catch { raw = [] } }
        if (!Array.isArray(raw) || raw.length === 0) return [{ ...EMPTY_PERFORMER }]
        return raw.map((p: Performer) => ({ name: p.name || '', role: p.role || '', photo_url: p.photo_url || '' }))
      })(),
      terms: ev.terms || '',
      ticket_types: JSON.stringify(ev.ticket_types || [], null, 2),
      capacity: ev.capacity?.toString() || '',
      tags: (ev.tags || []).join(', '),
    })
    setFormError(''); setShowForm(true)
  }
  const handleSave = async () => {
    if (!form.title.trim()) return setFormError('Judul wajib diisi')
    if (!form.date)         return setFormError('Tanggal wajib diisi')
    setSaving(true); setFormError('')
    try {
      // Parse JSON fields
      let ticket_types = []
      try { ticket_types = JSON.parse((form as any).ticket_types || '[]') } catch { ticket_types = [] }
      const performers = ((form as any).performers || []).filter((p: any) => p.name.trim())
      const tags = (form as any).tags
        ? (form as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : []
      const payload = {
        ...form,
        performers, ticket_types, tags,
        capacity: (form as any).capacity ? parseInt((form as any).capacity) : null,
      }
      const url    = editing ? `${API}/api/events/${editing.id}` : `${API}/api/events`
      const method = editing ? 'PUT' : 'POST'
      const r      = await fetch(url, { method, headers, body: JSON.stringify(payload) })
      const d      = await r.json()
      if (!r.ok) throw new Error(d.error || 'Gagal')
      await fetchEvents(); setShowForm(false)
    } catch (e: any) { setFormError(e.message) }
    finally { setSaving(false) }
  }
  const toggleActive = async (ev: Event) => {
    await fetch(`${API}/api/events/${ev.id}`, {
      method: 'PUT', headers, body: JSON.stringify({ is_active: !ev.is_active }),
    })
    fetchEvents()
  }
  const handleDelete = async (id: string) => {
    await fetch(`${API}/api/events/${id}`, { method: 'DELETE', headers })
    setDeleteId(null); fetchEvents()
  }

  const filtered = events.filter(e => filter === 'all' ? true : e.type === filter)

  // ── Input styles ───────────────────────────────────────────────
  const inp = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 3, padding: '10px 14px', color: 'var(--ws-cream)',
    fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', outline: 'none', width: '100%',
  }
  const lbl = {
    fontFamily: 'var(--font-barlow)', fontWeight: 700 as const, fontSize: '0.62rem',
    letterSpacing: '0.15em', textTransform: 'uppercase' as const,
    color: 'var(--ws-gray)', display: 'block', marginBottom: 6,
  }

  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--ws-dark)', minHeight: '100vh', paddingTop: 80 }}>

        {/* ── HERO HEADER ── */}
        <div ref={headerRef} style={{
          position: 'relative', padding: '80px max(5%,48px) 60px',
          borderBottom: '1px solid rgba(221,219,216,0.06)',
          overflow: 'hidden',
        }}>
          {/* Background number */}
          <div style={{
            position: 'absolute', right: 'max(5%,48px)', top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: 'clamp(8rem,18vw,16rem)',
            color: 'rgba(221,219,216,0.025)',
            userSelect: 'none', lineHeight: 1,
          }}>02</div>

          {/* Top label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div className="ev-header-line" style={{ height: 1, width: 48, background: 'var(--ws-red)' }} />
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem',
              letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--ws-red)',
            }}>Programme</span>
          </div>

          {/* Title */}
          <div style={{ overflow: 'hidden' }}>
            <h1 style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(3.5rem, 9vw, 9rem)',
              textTransform: 'uppercase', lineHeight: 0.9,
              color: 'var(--ws-cream)', letterSpacing: '-0.02em',
            }}>
              {'WHAT\'S ON'.split(' ').map((word, i) => (
                <span key={i} className="ev-title-word" style={{ display: 'inline-block', marginRight: '0.3em' }}>
                  {i === 1 ? <span style={{ color: 'var(--ws-red)' }}>{word}</span> : word}
                </span>
              ))}
            </h1>
          </div>

          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem',
            color: 'var(--ws-gray)', marginTop: 24, maxWidth: 400, lineHeight: 1.7,
          }}>
            Shows, workshops, dan momen spesial yang akan datang di Wondershock Theatre.
          </p>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 40, flexWrap: 'wrap' }}>
            {(['all', 'show', 'workshop', 'special'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? (f === 'all' ? 'var(--ws-cream)' : TYPE_COLOR[f]) : 'transparent',
                border: `1px solid ${filter === f ? 'transparent' : 'rgba(221,219,216,0.15)'}`,
                borderRadius: 2, padding: '8px 20px', cursor: 'pointer',
                fontFamily: 'var(--font-barlow)', fontWeight: 700,
                fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: filter === f ? 'var(--ws-dark)' : 'var(--ws-gray)',
                transition: 'all 0.2s',
              }}>
                {f === 'all' ? 'Semua' : f}
              </button>
            ))}
          </div>

          {/* Admin toggle */}
          {isAdmin && (
            <button onClick={() => setAdminOpen(o => !o)} style={{
              position: 'absolute', top: 32, right: 'max(5%,48px)',
              background: adminOpen ? 'rgba(246,188,5,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${adminOpen ? 'rgba(246,188,5,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 4, padding: '8px 18px', cursor: 'pointer',
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase',
              color: adminOpen ? '#f6bc05' : 'var(--ws-gray)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: '0.8rem' }}>⚙</span>
              {adminOpen ? 'Tutup Panel' : 'Kelola Event'}
            </button>
          )}
        </div>

        {/* ── ADMIN PANEL (inline, collapsible) ── */}
        <AnimatePresence>
          {isAdmin && adminOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden', borderBottom: '1px solid rgba(246,188,5,0.15)' }}
            >
              <div style={{
                background: 'rgba(246,188,5,0.03)',
                padding: '32px max(5%,48px)',
              }}>
                {/* Panel header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 3, height: 24, background: '#f6bc05' }} />
                    <span style={{
                      fontFamily: 'var(--font-barlow)', fontWeight: 900,
                      fontSize: '1rem', textTransform: 'uppercase',
                      letterSpacing: '0.12em', color: '#f6bc05',
                    }}>Admin Panel</span>
                  </div>
                  <button onClick={openAdd} style={{
                    background: 'var(--ws-red)', border: 'none', borderRadius: 3,
                    padding: '9px 20px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'white',
                  }}>+ Tambah Event</button>
                </div>

                {/* Event rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.map(ev => (
                    <div key={ev.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 4, padding: '12px 16px',
                      opacity: ev.is_active ? 1 : 0.45,
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: TYPE_COLOR[ev.type], flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: 'var(--font-barlow)', fontWeight: 700,
                          fontSize: '0.9rem', textTransform: 'uppercase',
                          color: 'var(--ws-cream)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{ev.title}</p>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--ws-gray)', marginTop: 2 }}>
                          {ev.date?.split('T')[0]} · {ev.type}{ev.price ? ` · ${ev.price}` : ''}
                          {!ev.is_active && <span style={{ color: 'rgba(246,188,5,0.6)', marginLeft: 8 }}>• nonaktif</span>}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {[
                          { label: ev.is_active ? 'Hide' : 'Show', color: '#f6bc05', action: () => toggleActive(ev) },
                          { label: 'Edit', color: 'var(--ws-sand)', action: () => openEdit(ev) },
                          { label: 'Hapus', color: 'rgba(236,43,37,0.7)', action: () => setDeleteId(ev.id) },
                        ].map(btn => (
                          <button key={btn.label} onClick={btn.action} style={{
                            background: 'none',
                            border: `1px solid ${btn.color}33`,
                            borderRadius: 3, padding: '5px 12px', cursor: 'pointer',
                            fontFamily: 'var(--font-barlow)', fontWeight: 700,
                            fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: btn.color, transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${btn.color}11`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                          >{btn.label}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── EVENT LIST ── */}
        <div ref={listRef} style={{ padding: '60px max(5%,48px) 100px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: 440, background: 'rgba(221,219,216,0.04)', borderRadius: 2,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 0',
              fontFamily: 'var(--font-dm-sans)', color: 'var(--ws-gray)',
            }}>
              <p style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>🎭</p>
              <p style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>Belum ada event{filter !== 'all' ? ` tipe ${filter}` : ''}.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 2,
            }}>
              {filtered.map((ev, i) => (
                <EventCard
                  key={ev.id} event={ev} index={i}
                  hovered={hoveredId === ev.id}
                  onHover={id => setHoveredId(id)}
                  isAdmin={isAdmin}
                  adminOpen={adminOpen}
                  onEdit={() => openEdit(ev)}
                  onToggle={() => toggleActive(ev)}
                  onDelete={() => setDeleteId(ev.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── FORM MODAL ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(7,13,14,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
              }}
              onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.28 }}
                style={{
                  background: '#0a1213', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6, padding: '32px 36px',
                  width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
                }}
              >
                {/* Form header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                  <div style={{ width: 3, height: 28, background: 'var(--ws-red)' }} />
                  <h3 style={{
                    fontFamily: 'var(--font-barlow)', fontWeight: 900,
                    fontSize: '1.4rem', textTransform: 'uppercase', color: 'var(--ws-cream)',
                  }}>{editing ? 'Edit Event' : 'Tambah Event'}</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={lbl}>Judul *</label>
                    <input style={inp} value={form.title} placeholder="AHA Moment #3"
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>Subtitle</label>
                    <input style={inp} value={form.subtitle} placeholder="The Art of Storytelling"
                      onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={lbl}>Tanggal *</label>
                      <input style={inp} type="date" value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div>
                      <label style={lbl}>Tipe *</label>
                      <select style={{ ...inp, cursor: 'pointer' }} value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                        <option value="show">Show</option>
                        <option value="workshop">Workshop</option>
                        <option value="special">Special</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>URL Gambar</label>
                    <input style={inp} value={form.image_url} placeholder="https://i.ibb.co/..."
                      onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.68rem', color: 'rgba(83,83,83,0.6)', marginTop: 5 }}>
                      Upload foto ke imgbb.com → copy URL direct link
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={lbl}>Harga</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                          fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem',
                          color: 'var(--ws-gray)', pointerEvents: 'none',
                        }}>Rp</span>
                        <input style={{ ...inp, paddingLeft: 36 }}
                          value={(() => {
                            const raw = (form.price || '').replace(/^Rp\s?/, '').replace(/\./g, '')
                            return raw ? parseInt(raw).toLocaleString('id-ID') : ''
                          })()}
                          placeholder="150.000"
                          inputMode="numeric"
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, '')
                            const formatted = raw ? parseInt(raw).toLocaleString('id-ID') : ''
                            setForm(f => ({ ...f, price: formatted ? `Rp ${formatted}` : '' }))
                          }} />
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Kapasitas</label>
                      <input style={inp} type="number" value={(form as any).capacity} placeholder="200"
                        onChange={e => setForm(f => ({ ...f, capacity: e.target.value } as any))} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={lbl}>Urutan tampil</label>
                      <input style={inp} type="number" value={form.order_num}
                        onChange={e => setForm(f => ({ ...f, order_num: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div>
                      <label style={lbl}>Tags (pisah koma)</label>
                      <input style={inp} value={(form as any).tags} placeholder="teater, drama, jakarta"
                        onChange={e => setForm(f => ({ ...f, tags: e.target.value } as any))} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Deskripsi</label>
                    <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={form.description}
                      placeholder="Deskripsi event..."
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>

                  {/* Venue */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
                    <p style={{ ...lbl, color: 'rgba(246,188,5,0.6)', marginBottom: 12 }}>Lokasi & Venue</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input style={inp} value={(form as any).venue} placeholder="Nama venue (cth: Taman Budaya Yogyakarta)"
                        onChange={e => setForm(f => ({ ...f, venue: e.target.value } as any))} />
                      <input style={inp} value={(form as any).venue_address} placeholder="Alamat lengkap"
                        onChange={e => setForm(f => ({ ...f, venue_address: e.target.value } as any))} />
                      <input style={inp} value={(form as any).venue_maps_url} placeholder="URL Google Maps"
                        onChange={e => setForm(f => ({ ...f, venue_maps_url: e.target.value } as any))} />
                    </div>
                  </div>

                  {/* Performers */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <p style={{ ...lbl, color: 'rgba(246,188,5,0.6)', margin: 0 }}>Lineup & Performer</p>
                      <button type="button" onClick={() => setForm(f => ({
                        ...f, performers: [...((f as any).performers || []), { ...EMPTY_PERFORMER }]
                      } as any))} style={{
                        background: 'none', border: '1px solid rgba(246,188,5,0.3)',
                        borderRadius: 3, padding: '4px 12px', cursor: 'pointer',
                        fontFamily: 'var(--font-barlow)', fontWeight: 700,
                        fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: 'rgba(246,188,5,0.7)',
                      }}>+ Tambah</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(Array.isArray((form as any).performers) ? (form as any).performers : []).map((p: any, i: number) => (
                        <div key={i} style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 4, padding: '12px 14px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--ws-gray)', textTransform: 'uppercase' }}>
                              Performer {i + 1}
                            </span>
                            {(Array.isArray((form as any).performers) ? (form as any).performers : []).length > 1 && (
                              <button type="button" onClick={() => setForm(f => ({
                                ...f,
                                performers: ((f as any).performers || []).filter((_: any, j: number) => j !== i)
                              } as any))} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'rgba(236,43,37,0.6)', fontSize: '0.75rem', padding: '2px 6px',
                              }}>✕ Hapus</button>
                            )}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                            <div>
                              <label style={{ ...lbl, marginBottom: 4 }}>Nama *</label>
                              <input style={{ ...inp }} value={p.name} placeholder="Nama performer"
                                onChange={e => setForm(f => {
                                  const arr = [...((f as any).performers || [])]
                                  arr[i] = { ...arr[i], name: e.target.value }
                                  return { ...f, performers: arr } as any
                                })} />
                            </div>
                            <div>
                              <label style={{ ...lbl, marginBottom: 4 }}>Peran / Role *</label>
                              <input style={{ ...inp }} value={p.role} placeholder="Sutradara, Aktor, dll"
                                onChange={e => setForm(f => {
                                  const arr = [...((f as any).performers || [])]
                                  arr[i] = { ...arr[i], role: e.target.value }
                                  return { ...f, performers: arr } as any
                                })} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...lbl, marginBottom: 4 }}>URL Foto (opsional)</label>
                            <input style={{ ...inp }} value={p.photo_url} placeholder="https://i.ibb.co/..."
                              onChange={e => setForm(f => {
                                const arr = [...((f as any).performers || [])]
                                arr[i] = { ...arr[i], photo_url: e.target.value }
                                return { ...f, performers: arr } as any
                              })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
                    <p style={{ ...lbl, color: 'rgba(246,188,5,0.6)', marginBottom: 8 }}>Syarat & Ketentuan</p>
                    <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }}
                      value={(form as any).terms} placeholder="Tulis syarat & ketentuan event..."
                      onChange={e => setForm(f => ({ ...f, terms: e.target.value } as any))} />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_active}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: 'var(--ws-red)' }} />
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-sand)' }}>
                      Tampilkan di website
                    </span>
                  </label>

                  {formError && (
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-red)' }}>⚠ {formError}</p>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowForm(false)} style={{
                      flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 3, padding: 12, cursor: 'pointer',
                      fontFamily: 'var(--font-barlow)', fontWeight: 700,
                      fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'var(--ws-gray)',
                    }}>Batal</button>
                    <button onClick={handleSave} disabled={saving} style={{
                      flex: 2,
                      background: saving ? 'rgba(236,43,37,0.5)' : 'var(--ws-red)',
                      border: 'none', borderRadius: 3, padding: 12,
                      cursor: saving ? 'wait' : 'pointer',
                      fontFamily: 'var(--font-barlow)', fontWeight: 700,
                      fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'white',
                    }}>{saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Event'}</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DELETE CONFIRM ── */}
        <AnimatePresence>
          {deleteId && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 1001,
                background: 'rgba(7,13,14,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0.94 }} animate={{ scale: 1 }} exit={{ scale: 0.94 }}
                style={{
                  background: '#0a1213', border: '1px solid rgba(236,43,37,0.25)',
                  borderRadius: 6, padding: '32px 36px', maxWidth: 380, width: '90%',
                }}
              >
                <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 12 }}>
                  Hapus Event?
                </p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-gray)', marginBottom: 28, lineHeight: 1.6 }}>
                  Event yang dihapus tidak bisa dikembalikan.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setDeleteId(null)} style={{
                    flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3, padding: '10px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ws-gray)',
                  }}>Batal</button>
                  <button onClick={() => handleDelete(deleteId)} style={{
                    flex: 1, background: 'var(--ws-red)', border: 'none',
                    borderRadius: 3, padding: '10px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '0.72rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: 'white',
                  }}>Hapus</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.7} }
      `}</style>
    </>
  )
}

// ── Event Card ───────────────────────────────────────────────────
function EventCard({
  event, index, hovered, onHover, isAdmin, adminOpen, onEdit, onToggle, onDelete
}: {
  event: Event; index: number; hovered: boolean
  onHover: (id: string | null) => void
  isAdmin: boolean
  adminOpen: boolean
  onEdit: () => void; onToggle: () => void; onDelete: () => void
}) {
  const color = TYPE_COLOR[event.type]
  const img   = event.image_url || TYPE_IMG[event.type]

  const cardContent = (
    <motion.div
      className="ev-card"
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: 'relative', overflow: 'hidden',
        aspectRatio: '3/4', cursor: 'pointer',
        opacity: !event.is_active && isAdmin ? 0.5 : 1,
      }}
    >
      {/* Image */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={img} alt={event.title}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(30%) contrast(1.05)',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.7s cubic-bezier(0.23,1,0.32,1)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(7,13,14,0.98) 0%, rgba(7,13,14,0.5) 50%, rgba(7,13,14,0.2) 100%)'
            : 'linear-gradient(to top, rgba(7,13,14,0.95) 0%, rgba(7,13,14,0.3) 60%, transparent 100%)',
          transition: 'background 0.4s',
        }} />
      </div>

      {/* Top row */}
      <div style={{
        position: 'absolute', top: 20, left: 20, right: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 5,
      }}>
        <span style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 700,
          fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          background: color, color: 'var(--ws-dark)',
          padding: '3px 10px', borderRadius: 2,
        }}>{event.type}</span>
        <span style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: '2.5rem', color: 'rgba(241,241,239,0.1)', lineHeight: 1,
        }}>0{index + 1}</span>
      </div>

      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 24px 28px', zIndex: 5 }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)', fontSize: '0.62rem',
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--ws-gray)', marginBottom: 8,
        }}>{formatDate(event.date)}</p>

        <h2 style={{
          fontFamily: 'var(--font-barlow)', fontWeight: 900,
          fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
          textTransform: 'uppercase', color: 'var(--ws-cream)',
          lineHeight: 1, marginBottom: 6,
        }}>{event.title}</h2>

        {event.subtitle && (
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-sand)', marginBottom: 8 }}>
            {event.subtitle}
          </p>
        )}

        {/* Description — only on hover */}
        <motion.div
          animate={{ height: hovered && event.description ? 'auto' : 0, opacity: hovered && event.description ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          style={{ overflow: 'hidden' }}
        >
          <p style={{
            fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
            color: 'var(--ws-gray)', lineHeight: 1.6, marginBottom: 12,
          }}>{event.description}</p>
        </motion.div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          {event.price ? (
            <span style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.85rem', color: color, letterSpacing: '0.06em',
            }}>
              {event.price.startsWith('Rp') ? event.price : `Rp ${event.price}`}
            </span>
          ) : <span />}

          <motion.div
            animate={{ x: hovered ? 0 : -8, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: color,
            }}
          >
            Book Now <span>→</span>
          </motion.div>
        </div>

        {/* Admin quick actions — hanya saat panel kelola aktif */}
        {isAdmin && adminOpen && (
          <div
            style={{ display: 'flex', gap: 6, marginTop: 14 }}
            onClick={e => e.stopPropagation()}
          >
            {[
              { label: event.is_active ? 'Hide' : 'Show', action: onToggle },
              { label: 'Edit', action: onEdit },
              { label: 'Hapus', action: onDelete },
            ].map(b => (
              <button key={b.label}
                onClick={e => { e.preventDefault(); e.stopPropagation(); b.action() }}
                style={{
                  background: 'rgba(7,13,14,0.7)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 2, padding: '5px 12px', cursor: 'pointer',
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: b.label === 'Hapus' ? 'rgba(236,43,37,0.8)' : 'var(--ws-sand)',
                }}>{b.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <motion.div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: color, scaleX: hovered ? 1 : 0, transformOrigin: 'left',
        transition: 'transform 0.35s ease',
      }} />
    </motion.div>
  )

  // Kalau admin panel aktif, jangan wrap dengan Link supaya tombol bisa diklik
  if (isAdmin && adminOpen) {
    return <div style={{ display: 'block' }}>{cardContent}</div>
  }

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      {cardContent}
    </Link>
  )
}