import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import '../styles/globals.css'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-barlow',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Wondershock Theatre — Welcome to Our Stage',
  description: 'A theatre that shocks, moves, and wonders.',
  openGraph: {
    title: 'Wondershock Theatre',
    description: 'A theatre that shocks, moves, and wonders.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${barlowCondensed.variable} ${dmSans.variable}`}>
      <body className="grain">
        {children}
      </body>
    </html>
  )
}
