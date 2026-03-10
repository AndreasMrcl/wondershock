'use client'
// app/register/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi, tokenHelper } from '@/lib/gameApi'
import { useAuth } from '@/lib/authContext'
import CustomCursor from '@/components/CustomCursor'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const submit = async () => {
    setError('')
    if (!name || !email || !password) return setError('Semua field wajib diisi')
    if (password.length < 6) return setError('Password minimal 6 karakter')
    if (password !== confirm) return setError('Password tidak cocok')

    setLoading(true)
    try {
      const res = await authApi.register(name, email, password)
      tokenHelper.save(res.token)
      setUser(res.user)
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal mendaftar')
    } finally { setLoading(false) }
  }

  return (
    <>
      <CustomCursor />
      <div style={{
        minHeight: '100vh',
        background: 'var(--ws-dark)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* ── LEFT — Form panel ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 48px',
          position: 'relative',
        }}>
          {/* Top left nav */}
          <div style={{
            position: 'absolute', top: 32, left: 40,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: 'var(--font-barlow)', fontWeight: 900,
                fontSize: '0.9rem', letterSpacing: '4px',
                color: 'var(--ws-cream)',
              }}>WS</span>
              <span style={{
                fontFamily: 'var(--font-barlow)', fontWeight: 900,
                fontSize: '0.9rem', letterSpacing: '4px',
                color: 'var(--ws-red)',
              }}>T</span>
            </Link>
          </div>

          <div style={{
            position: 'absolute', top: 32, right: 40,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
              color: 'var(--ws-gray)',
            }}>Sudah punya akun?</span>
            <Link href="/login" style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '1.5px',
              textTransform: 'uppercase', color: 'var(--ws-red)',
              textDecoration: 'none',
            }}>Masuk →</Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.6rem',
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'var(--ws-red)', marginBottom: 10,
            }}>Buat Akun</p>
            <h1 style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(2rem, 3vw, 2.8rem)',
              textTransform: 'uppercase', color: 'var(--ws-cream)',
              lineHeight: 0.95, marginBottom: 36,
            }}>
              GABUNG<br />
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55em', letterSpacing: '0.1em' }}>
                BERSAMA KAMI
              </span>
            </h1>

            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nama Lengkap</label>
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkapmu"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ws-red)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@kamu.com"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ws-red)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ws-red)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Konfirmasi Password</label>
              <input
                type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Ulangi password"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ws-red)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
                    color: 'var(--ws-red)', marginBottom: 16,
                    paddingLeft: 10, borderLeft: '2px solid var(--ws-red)',
                  }}
                >{error}</motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              onClick={submit} disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '15px',
                background: 'var(--ws-red)', border: 'none', borderRadius: 4,
                color: 'white', fontFamily: 'var(--font-barlow)',
                fontWeight: 700, fontSize: '0.85rem', letterSpacing: '3px',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                  />
                  Mendaftar...
                </>
              ) : 'Daftar Sekarang →'}
            </motion.button>

            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem',
              color: 'var(--ws-gray)', textAlign: 'center', marginTop: 20,
              lineHeight: 1.6,
            }}>
              Dengan mendaftar, kamu setuju dengan{' '}
              <Link href="#" style={{ color: 'var(--ws-sand)', textDecoration: 'underline' }}>
                Syarat & Ketentuan
              </Link>{' '}kami.
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT — Visual panel ── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#050a0b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px',
        }}>
          {/* Right accent line */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 3, height: '100%',
            background: 'linear-gradient(to bottom, transparent, var(--ws-red), transparent)',
          }} />

          {/* Spotlight */}
          <svg viewBox="0 0 400 600" style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '70%', opacity: 0.1,
            pointerEvents: 'none',
          }}>
            <defs>
              <radialGradient id="lg2" cx="50%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#fde98a" stopOpacity="1" />
                <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <polygon points="200,0 20,600 380,600" fill="url(#lg2)" />
          </svg>

          {/* Ghost text */}
          <div style={{
            position: 'absolute', bottom: -20, right: -10,
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: '11rem', lineHeight: 0.85,
            color: 'rgba(255,255,255,0.025)',
            userSelect: 'none', pointerEvents: 'none',
            letterSpacing: '-0.02em',
          }}>WS</div>

          {/* Top decoration */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.6rem', letterSpacing: '4px',
              textTransform: 'uppercase', color: 'var(--ws-red)',
              marginBottom: 8,
            }}>Est. 2023</p>
          </div>

          {/* Center: perks list */}
          <div style={{ position: 'relative', zIndex: 1, margin: 'auto 0' }}>
            {[
              { icon: '🎭', text: 'Akses ke semua acara & workshop' },
              { icon: '🎟', text: 'Beli tiket show lebih mudah' },
              { icon: '🏙', text: 'Ikuti City Hunt Quiz eksklusif' },
              { icon: '📧', text: 'Update jadwal terbaru di email' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  marginBottom: 20,
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem',
                  color: 'var(--ws-sand)', lineHeight: 1.4,
                }}>{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 32, height: 2, background: 'var(--ws-red)', marginBottom: 12 }} />
            <p style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '1rem', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            }}>WONDERSHOCK THEATRE</p>
          </div>
        </div>
      </div>
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-barlow)',
  fontSize: '0.6rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
  marginBottom: 7,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  padding: '13px 16px',
  color: 'var(--ws-cream)',
  fontFamily: 'var(--font-dm-sans)',
  fontSize: '0.92rem',
  outline: 'none',
  transition: 'border-color 0.2s',
}
