'use client'

// components/admin/EventsManager.tsx
// CRUD events untuk admin panel

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Event {
  id: string
  title: string
  subtitle: string
  date: string
  type: 'show' | 'workshop' | 'special'
  image_url: string
  price: string
  description: string
  order_num: number
  is_active: boolean
}

const EMPTY_FORM = {
  title: '', subtitle: '', date: '', type: 'show' as const,
  image_url: '', price: '', description: '', order_num: 0, is_active: true,
}

const TYPE_COLOR: Record<string, string> = {
  show: '#ec2b25', workshop: '#f6bc05', special: '#266adf',
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function EventsManager() {
  const [events, setEvents]       = useState<Event[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Event | null>(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [deleteId, setDeleteId]   = useState<string | null>(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('ws_token') : null

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  // ── Fetch ──
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/events/all`, { headers })
      const d = await r.json()
      setEvents(d.events || [])
    } catch { setEvents([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [])

  // ── Open form ──
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  const openEdit = (ev: Event) => {
    setEditing(ev)
    setForm({
      title: ev.title, subtitle: ev.subtitle || '',
      date: ev.date?.split('T')[0] || '',
      type: ev.type, image_url: ev.image_url || '',
      price: ev.price || '', description: ev.description || '',
      order_num: ev.order_num, is_active: ev.is_active,
    })
    setError('')
    setShowForm(true)
  }

  // ── Save ──
  const handleSave = async () => {
    if (!form.title.trim()) return setError('Judul wajib diisi')
    if (!form.date)         return setError('Tanggal wajib diisi')
    setSaving(true)
    setError('')
    try {
      const url    = editing ? `${API}/api/events/${editing.id}` : `${API}/api/events`
      const method = editing ? 'PUT' : 'POST'
      const r      = await fetch(url, { method, headers, body: JSON.stringify(form) })
      const d      = await r.json()
      if (!r.ok) throw new Error(d.error || 'Gagal menyimpan')
      await fetchEvents()
      setShowForm(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle active ──
  const toggleActive = async (ev: Event) => {
    try {
      await fetch(`${API}/api/events/${ev.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ is_active: !ev.is_active }),
      })
      await fetchEvents()
    } catch {}
  }

  // ── Delete ──
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/api/events/${id}`, { method: 'DELETE', headers })
      await fetchEvents()
      setDeleteId(null)
    } catch {}
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4, padding: '10px 14px',
    color: 'var(--ws-cream)',
    fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem',
    outline: 'none', width: '100%',
  }

  const labelStyle = {
    fontFamily: 'var(--font-barlow)', fontWeight: 700,
    fontSize: '0.65rem', letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: 'var(--ws-gray)', display: 'block', marginBottom: 6,
  }

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.6rem', textTransform: 'uppercase', color: 'var(--ws-cream)' }}>
            Events
          </h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-gray)', marginTop: 4 }}>
            Kelola event yang tampil di website
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            background: 'var(--ws-red)', border: 'none', borderRadius: 4,
            padding: '10px 20px', color: 'white', cursor: 'pointer',
            fontFamily: 'var(--font-barlow)', fontWeight: 700,
            fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}
        >+ Tambah Event</button>
      </div>

      {/* Event list */}
      {loading ? (
        <p style={{ color: 'var(--ws-gray)', fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem' }}>Memuat...</p>
      ) : events.length === 0 ? (
        <div style={{
          border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 6,
          padding: '48px 24px', textAlign: 'center',
          color: 'var(--ws-gray)', fontFamily: 'var(--font-dm-sans)', fontSize: '0.9rem',
        }}>
          Belum ada event. Klik "+ Tambah Event" untuk mulai.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map(ev => (
            <div key={ev.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${ev.is_active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`,
              borderRadius: 6, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 16,
              opacity: ev.is_active ? 1 : 0.5,
            }}>
              {/* Color dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLOR[ev.type], flexShrink: 0 }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 700, fontSize: '1rem', color: 'var(--ws-cream)', textTransform: 'uppercase' }}>
                    {ev.title}
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-barlow)', fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: TYPE_COLOR[ev.type] + '22', color: TYPE_COLOR[ev.type],
                    padding: '2px 8px', borderRadius: 2,
                  }}>{ev.type}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.75rem', color: 'var(--ws-gray)', marginTop: 2 }}>
                  {ev.date?.split('T')[0]} {ev.subtitle ? `· ${ev.subtitle}` : ''} {ev.price ? `· ${ev.price}` : ''}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => toggleActive(ev)}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: ev.is_active ? '#f6bc05' : 'var(--ws-gray)',
                  }}
                >{ev.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>

                <button
                  onClick={() => openEdit(ev)}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '6px 14px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--ws-sand)',
                  }}
                >Edit</button>

                <button
                  onClick={() => setDeleteId(ev.id)}
                  style={{
                    background: 'none', border: '1px solid rgba(236,43,37,0.3)',
                    borderRadius: 4, padding: '6px 12px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'rgba(236,43,37,0.7)',
                  }}
                >Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(7,13,14,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              style={{
                background: '#0d1517',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '28px 32px',
                width: '100%', maxWidth: 560,
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-barlow)', fontWeight: 900,
                fontSize: '1.3rem', textTransform: 'uppercase',
                color: 'var(--ws-cream)', marginBottom: 24,
              }}>
                {editing ? 'Edit Event' : 'Tambah Event'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Title */}
                <div>
                  <label style={labelStyle}>Judul *</label>
                  <input style={inputStyle} value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="AHA Moment #3" />
                </div>

                {/* Subtitle */}
                <div>
                  <label style={labelStyle}>Subtitle</label>
                  <input style={inputStyle} value={form.subtitle}
                    onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                    placeholder="The Art of Storytelling" />
                </div>

                {/* Date + Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Tanggal *</label>
                    <input style={inputStyle} type="date" value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tipe *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                      <option value="show">Show</option>
                      <option value="workshop">Workshop</option>
                      <option value="special">Special</option>
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label style={labelStyle}>URL Gambar</label>
                  <input style={inputStyle} value={form.image_url}
                    onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://..." />
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'rgba(83,83,83,0.7)', marginTop: 5 }}>
                    Upload ke imgbb.com lalu paste URL-nya di sini
                  </p>
                </div>

                {/* Price + Order */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Harga</label>
                    <input style={inputStyle} value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="Rp 150.000" />
                  </div>
                  <div>
                    <label style={labelStyle}>Urutan</label>
                    <input style={inputStyle} type="number" value={form.order_num}
                      onChange={e => setForm(f => ({ ...f, order_num: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Deskripsi</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Deskripsi singkat event..." />
                </div>

                {/* Active toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--ws-red)' }} />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-sand)' }}>
                    Tampilkan di website
                  </span>
                </label>

                {error && (
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--ws-red)' }}>
                    ⚠ {error}
                  </p>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={() => setShowForm(false)} style={{
                    flex: 1, background: 'none',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '11px', cursor: 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'var(--ws-gray)',
                  }}>Batal</button>
                  <button onClick={handleSave} disabled={saving} style={{
                    flex: 2, background: saving ? 'rgba(236,43,37,0.5)' : 'var(--ws-red)',
                    border: 'none', borderRadius: 4, padding: '11px', cursor: saving ? 'wait' : 'pointer',
                    fontFamily: 'var(--font-barlow)', fontWeight: 700,
                    fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: 'white',
                  }}>{saving ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Tambah Event')}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1001,
              background: 'rgba(7,13,14,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{
                background: '#0d1517', border: '1px solid rgba(236,43,37,0.3)',
                borderRadius: 8, padding: '28px 32px', maxWidth: 380, width: '90%',
              }}
            >
              <p style={{ fontFamily: 'var(--font-barlow)', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--ws-cream)', marginBottom: 10 }}>
                Hapus Event?
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', color: 'var(--ws-gray)', marginBottom: 24 }}>
                Event yang dihapus tidak bisa dikembalikan.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleteId(null)} style={{
                  flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4, padding: '10px', cursor: 'pointer',
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--ws-gray)',
                }}>Batal</button>
                <button onClick={() => handleDelete(deleteId)} style={{
                  flex: 1, background: 'var(--ws-red)', border: 'none',
                  borderRadius: 4, padding: '10px', cursor: 'pointer',
                  fontFamily: 'var(--font-barlow)', fontWeight: 700,
                  fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'white',
                }}>Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}