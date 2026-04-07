// lib/chapters.ts
// Single source of truth untuk semua data chapter City Hunt.
// Nanti bisa diganti dengan fetch dari /api/chapters/:id.

export type ChapterStatus = 'ongoing' | 'upcoming' | 'expired'

export interface Chapter {
  id: number
  slug: string          // dipakai di URL: /game/[slug]
  title: string
  subtitle: string
  location: string
  city: string
  status: ChapterStatus
  question_count: number
  participants: number
  bg_image: string
  color: string         // accent color chapter
  tags: string[]
  date_start: string
  date_end: string
  description: string
  // Mekanisme game
  timer_seconds: number        // total timer satu chapter
  hint_penalty_seconds: number // berapa detik dikurangi saat pakai hint
}

export const CHAPTERS: Chapter[] = [
  {
    id: 4,
    slug: 'kota-dalam-diam',
    title: 'Kota Dalam Diam',
    subtitle: 'Telusuri sudut tersembunyi Kota Lama',
    location: 'Kota Lama Semarang',
    city: 'Semarang',
    status: 'ongoing',
    question_count: 8,
    participants: 34,
    bg_image:
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600&q=80&auto=format&fit=crop',
    color: '#ec2b25',
    tags: ['Heritage', 'Sejarah', 'Arsitektur'],
    date_start: '2026-03-10',
    date_end: '2026-04-10',
    description:
      'Telusuri sudut-sudut tersembunyi Kota Lama. Temukan cerita di balik bangunan tua yang diam menyimpan sejarah.',
    timer_seconds: 88 * 60,
    hint_penalty_seconds: 10 * 60,
  },
  {
    id: 3,
    slug: 'malam-tanpa-batas',
    title: 'Malam Tanpa Batas',
    subtitle: 'Jelajahi Braga di bawah cahaya malam',
    location: 'Kawasan Braga',
    city: 'Bandung',
    status: 'expired',
    question_count: 10,
    participants: 87,
    bg_image:
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1600&q=80&auto=format&fit=crop',
    color: '#818cf8',
    tags: ['Malam', 'Urban', 'Seni'],
    date_start: '2025-11-01',
    date_end: '2025-12-31',

    description:
      'Jelajahi Braga di malam hari. Setiap lampu, setiap sudut menyimpan tantangan yang menguji ketajaman mata dan pikiran.',
    timer_seconds: 90 * 60,
    hint_penalty_seconds: 10 * 60,
  },
  {
    id: 2,
    slug: 'jejak-rempah',
    title: 'Jejak Rempah',
    subtitle: 'Ikuti jalur rempah dari pasar ke keraton',
    location: 'Pasar Beringharjo & Kraton',
    city: 'Yogyakarta',
    status: 'expired',
    question_count: 12,
    participants: 112,
    bg_image:
      'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=1600&q=80&auto=format&fit=crop',
    color: '#f6bc05',
    tags: ['Budaya', 'Kuliner', 'Sejarah'],
    date_start: '2025-07-15',
    date_end: '2025-09-15',

    description:
      'Ikuti jalur perdagangan rempah yang pernah mengubah dunia. Dari pasar kuno hingga keraton, sejarah berbicara.',
    timer_seconds: 100 * 60,
    hint_penalty_seconds: 10 * 60,
  },
  {
    id: 1,
    slug: 'akar-kota',
    title: 'Akar Kota',
    subtitle: 'Chapter perdana di jantung ibu kota',
    location: 'Kawasan Kota Tua',
    city: 'Jakarta',
    status: 'expired',
    question_count: 6,
    participants: 58,
    bg_image:
      'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=1600&q=80&auto=format&fit=crop',
    color: '#266adf',
    tags: ['Perdana', 'Sejarah', 'Jakarta'],
    date_start: '2025-02-01',
    date_end: '2025-04-30',

    description:
      'Chapter perdana Wondershock City Hunt. Menggali akar sejarah ibu kota dari sudut yang jarang diperhatikan.',
    timer_seconds: 60 * 60,
    hint_penalty_seconds: 10 * 60,
  },
  {
    id: 5,
    slug: 'pulau-seribu-cerita',
    title: 'Pulau Seribu Cerita',
    subtitle: 'Segera hadir — persiapkan dirimu',
    location: 'Kepulauan Seribu',
    city: 'Jakarta',
    status: 'upcoming',
    question_count: 0,
    participants: 0,
    bg_image:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1600&q=80&auto=format&fit=crop',
    color: '#266adf',
    tags: ['Laut', 'Alam', 'Eksklusif'],
    date_start: '2026-06-01',
    date_end: '2026-07-31',
    description:
      'Chapter berikutnya membawa kamu ke lautan. Segera hadir — persiapkan dirimu.',
    timer_seconds: 88 * 60,
    hint_penalty_seconds: 10 * 60,
  },
]

// ── Helpers ──────────────────────────────────────────────────────

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug)
}

export function getChapterById(id: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

export function getOngoingChapters(): Chapter[] {
  return CHAPTERS.filter((c) => c.status === 'ongoing')
}

export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} jam ${m} menit`
  return `${m} menit`
}

export function formatHintPenalty(seconds: number): string {
  const m = Math.floor(seconds / 60)
  if (m > 0) return `-${m} menit`
  return `-${seconds} detik`
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}