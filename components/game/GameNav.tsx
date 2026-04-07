'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'

const navLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-barlow)',
  fontWeight: 700,
  fontSize: '0.72rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'color 0.2s',
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-barlow)',
  fontWeight: 700,
  fontSize: '0.6rem',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'all 0.2s',
  padding: '6px 14px',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 4,
  flexShrink: 0,
}

interface GameNavProps {
  accentColor?: string
}

export default function GameNav({ accentColor }: GameNavProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const color = accentColor ?? 'var(--ws-red)'

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(221,219,216,0.06)',
        background: 'rgba(7,13,14,0.7)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 48px',
          height: 80,
        }}
      >
        {/* LEFT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 32,
            paddingRight: 36,
          }}
        >
          <Link
            href="/game"
            style={{ ...navLinkStyle, color: 'var(--ws-sand)' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-sand)')
            }
          >
            Game
          </Link>
          <Link
            href="/game/chapters"
            style={{ ...navLinkStyle, color: 'var(--ws-sand)' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--ws-sand)')
            }
          >
            Chapters
          </Link>
        </div>

        {/* CENTER — Logo → home theatre */}
        <Link href="/" style={{ flexShrink: 0, display: 'block' }}>
          <div style={{ width: 180, height: 72 }}>
            <img
              src="/assets/logo-white.png"
              alt="Wondershock Theatre"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </Link>

        {/* RIGHT */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 36,
            gap: 20,
          }}
        >
          <Link
            href="/game/rewards"
            style={{
              ...navLinkStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--ws-gold)',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '0.75')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.opacity = '1')
            }
          >
            <span>🏆</span> Rewards
          </Link>

          <div style={{ flex: 1 }} />

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-barlow)',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  color: 'white',
                  flexShrink: 0,
                  border: `1.5px solid ${color === 'var(--ws-red)' ? 'rgba(236,43,37,0.4)' : color + '60'}`,
                  transition: 'background 0.5s',
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.78rem',
                  color: 'rgba(221,219,216,0.55)',
                }}
              >
                {user.name.split(' ')[0]}
              </span>
            </div>
          )}

          {user?.role === 'admin' && (
            <Link
              href="/game/admin"
              style={{
                ...btnStyle,
                color: 'rgba(221,219,216,0.4)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-cream)'
                ;(e.currentTarget as HTMLElement).style.borderColor =
                  'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.color =
                  'rgba(221,219,216,0.4)'
                ;(e.currentTarget as HTMLElement).style.borderColor =
                  'rgba(255,255,255,0.08)'
              }}
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => {
              logout()
              router.push('/')
            }}
            style={{
              ...btnStyle,
              background: 'transparent',
              color: 'rgba(221,219,216,0.4)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor =
                'rgba(236,43,37,0.5)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ws-red)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor =
                'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLElement).style.color =
                'rgba(221,219,216,0.4)'
            }}
          >
            Keluar
          </button>
        </div>
      </div>
    </nav>
  )
}
