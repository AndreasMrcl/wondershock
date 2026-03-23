'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi, tokenHelper } from '@/lib/gameApi'
import { useAuth } from '@/lib/authContext'
import CustomCursor from '@/components/CustomCursor'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const submit = async () => {
    if (!email || !password) return setError('Email dan password wajib diisi')
    setError(''); setLoading(true)
    try {
      const res = await authApi.login(email, password)
      tokenHelper.save(res.token)
      setUser(res.user)
      // Redirect ke game kalau dari sana, atau ke beranda
      const from = new URLSearchParams(window.location.search).get('from')
      router.push(from || '/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Email atau password salah')
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

        {/* ── LEFT — Visual panel ── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#050a0b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 48px',
        }}>
          {/* Red accent lines */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 3, height: '100%',
            background: 'linear-gradient(to bottom, transparent, var(--ws-red), transparent)',
          }} />

          {/* Spotlight cone */}
          <svg viewBox="0 0 400 600" style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '70%', opacity: 0.12,
            pointerEvents: 'none',
          }}>
            <defs>
              <radialGradient id="lg" cx="50%" cy="0%" r="100%">
                <stop offset="0%" stopColor="#fde98a" stopOpacity="1" />
                <stop offset="100%" stopColor="#fde98a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <polygon points="200,0 20,600 380,600" fill="url(#lg)" />
          </svg>

          {/* Ghost text */}
          <div style={{
            position: 'absolute', bottom: -20, left: -10,
            fontFamily: 'var(--font-barlow)', fontWeight: 900,
            fontSize: '11rem', lineHeight: 0.85,
            color: 'rgba(255,255,255,0.025)',
            userSelect: 'none', pointerEvents: 'none',
            letterSpacing: '-0.02em',
          }}>
            WS
          </div>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
            <img
              src="/assets/logo-white.png"
              alt="Wondershock Theatre"
              style={{ width: 140, display: 'block' }}
            />
          </Link>

          {/* Bottom quote */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 32, height: 2,
              background: 'var(--ws-red)',
              marginBottom: 16,
            }} />
            <p style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: 'clamp(1.8rem, 2.5vw, 2.8rem)',
              textTransform: 'uppercase', lineHeight: 0.95,
              color: 'var(--ws-cream)',
            }}>
              SELAMAT<br />
              <span style={{ color: 'var(--ws-red)' }}>DATANG</span><br />
              KEMBALI.
            </p>
            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem',
              color: 'var(--ws-gray)', marginTop: 14, lineHeight: 1.7,
            }}>
              Theatre yang mengejutkan,<br />menggerakkan, dan menakjubkan.
            </p>
          </div>
        </div>

        {/* ── RIGHT — Form panel ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 48px',
          position: 'relative',
        }}>
          {/* Top right nav */}
          <div style={{
            position: 'absolute', top: 32, right: 40,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem',
              color: 'var(--ws-gray)',
            }}>Belum punya akun?</span>
            <Link href="/register" style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 700,
              fontSize: '0.75rem', letterSpacing: '1.5px',
              textTransform: 'uppercase', color: 'var(--ws-red)',
              textDecoration: 'none', transition: 'opacity 0.2s',
            }}>Daftar →</Link>
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
            }}>Masuk</p>
            <h1 style={{
              fontFamily: 'var(--font-barlow)', fontWeight: 900,
              fontSize: 'clamp(2rem, 3vw, 2.8rem)',
              textTransform: 'uppercase', color: 'var(--ws-cream)',
              lineHeight: 0.95, marginBottom: 36,
            }}>
              LOGIN<br />
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55em', letterSpacing: '0.1em' }}>
                KE AKUNMU
              </span>
            </h1>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
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
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
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
                    paddingLeft: 10,
                    borderLeft: '2px solid var(--ws-red)',
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
                opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
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
                  Memproses...
                </>
              ) : 'Masuk →'}
            </motion.button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              margin: '24px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem', color: 'var(--ws-gray)' }}>atau</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <Link href="/register" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', padding: '14px',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
              color: 'var(--ws-sand)', fontFamily: 'var(--font-barlow)',
              fontWeight: 700, fontSize: '0.78rem', letterSpacing: '2px',
              textTransform: 'uppercase', textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--ws-red)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-red)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-sand)'
            }}
            >
              Buat Akun Baru
            </Link>

            <p style={{
              fontFamily: 'var(--font-dm-sans)', fontSize: '0.65rem',
              color: 'var(--ws-gray)', textAlign: 'center', marginTop: 28,
              lineHeight: 1.6,
            }}>
              Dengan masuk, kamu setuju dengan{' '}
              <Link href="#" style={{ color: 'var(--ws-sand)', textDecoration: 'underline' }}>
                Syarat & Ketentuan
              </Link>{' '}kami.
            </p>
          </motion.div>
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
  width: '100%',
}