// lib/gameApi.ts
// Typed API client untuk City Hunt Quiz + Theatre backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

async function apiFetchForm<T>(path: string, body: FormData): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// ── Types ──
export interface User {
  id: string
  name: string
  email: string
  role: 'peserta' | 'admin'
}

export interface Question {
  id: string
  question_text: string
  location_name: string
  answer_type: 'text' | 'photo' | 'video' | 'any'
  timer_seconds: number
  penalty_seconds: number
  hint?: string
  order_num: number
  chapter_id?: string
  // admin only:
  answer_key?: string
  similarity_threshold?: number
  ai_confidence_threshold?: number
  is_active?: boolean
}

export interface Session {
  id: string
  user_id: string
  status: 'active' | 'finished'
  started_at: string
  finished_at?: string
}

export interface SubmitResult {
  passed: boolean
  attempt_number: number
  answer_id: string
  penalty_seconds?: number
  hint?: string
}

export interface Answer {
  id: string
  session_id: string
  question_id: string
  attempt_number: number
  answer_type: string
  text_content?: string
  file_url?: string
  validation_method: string
  similarity_score?: number
  ai_reason?: string
  ai_confidence?: number
  passed: boolean
  submitted_at: string
  // joined:
  user_name?: string
  user_email?: string
  question_text?: string
  location_name?: string
}

// ── Auth ──
export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  adminLogin: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<{ user: User }>('/api/auth/me'),
}

// ── Questions ──
export const questionsApi = {
  list: (chapterId?: string) => apiFetch<{ questions: Question[] }>(`/api/questions${chapterId ? `?chapter_id=${chapterId}` : ''}`),
  listAdmin: (chapterId?: string) => apiFetch<{ questions: Question[] }>(`/api/questions/admin${chapterId ? `?chapter_id=${chapterId}` : ''}`),
  create: (data: Partial<Question>) =>
    apiFetch<{ question: Question }>('/api/questions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Question>) =>
    apiFetch<{ question: Question }>(`/api/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/questions/${id}`, { method: 'DELETE' }),
}

// ── Sessions ──
export const sessionsApi = {
  start: () => apiFetch<{ session: Session }>('/api/sessions/start', { method: 'POST' }),
  finish: (id: string) =>
    apiFetch<{ session: Session }>(`/api/sessions/${id}/finish`, { method: 'POST' }),
  progress: (id: string) =>
    apiFetch<{ session: Session; passed_count: number; total_count: number; passed_ids: string[] }>(
      `/api/sessions/${id}/progress`
    ),
  listAdmin: (chapterId?: string) => apiFetch<{ sessions: (Session & { user_name: string; passed_count: number })[] }>(`/api/sessions${chapterId ? `?chapter_id=${chapterId}` : ''}`),
}

// ── Answers ──
export const answersApi = {
  submitText: (session_id: string, question_id: string, text_content: string) =>
    apiFetch<SubmitResult>('/api/answers/submit', {
      method: 'POST',
      body: JSON.stringify({ session_id, question_id, answer_type: 'text', text_content }),
    }),

  submitFile: (session_id: string, question_id: string, answer_type: 'photo' | 'video', file: File) => {
    const form = new FormData()
    form.append('session_id', session_id)
    form.append('question_id', question_id)
    form.append('answer_type', answer_type)
    form.append('file', file)
    return apiFetchForm<SubmitResult>('/api/answers/submit', form)
  },

  listAdmin: (params?: { question_id?: string; passed?: boolean; chapter_id?: string }) => {
    const qs = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : ''
    return apiFetch<{ answers: Answer[] }>(`/api/answers/admin${qs}`)
  },

  detail: (id: string) => apiFetch<{ answer: Answer }>(`/api/answers/${id}/detail`),
  bySession: (sessionId: string) => apiFetch<{ answers: Answer[] }>(`/api/answers/session/${sessionId}`),
}

// ── Chapters ──
export interface ChapterDB {
  id: string
  slug: string
  title: string
  subtitle?: string
  location?: string
  city?: string
  status: 'ongoing' | 'upcoming' | 'expired'
  bg_image?: string
  color: string
  tags: string[]
  date_start?: string
  date_end?: string
  description?: string
  timer_seconds: number
  hint_penalty_seconds: number
  order_num: number
  is_active: boolean
  question_count?: number
  participants?: number
  created_at?: string
}

export interface RewardDB {
  id: string
  chapter_id: string
  title: string
  description?: string
  type: 'ticket' | 'voucher' | 'merchandise' | 'experience'
  icon: string
  value?: string
  requirement?: string
  order_num: number
  is_active: boolean
  created_at?: string
}

export const chaptersApi = {
  list: () => apiFetch<{ chapters: ChapterDB[] }>('/api/chapters'),
  listAdmin: () => apiFetch<{ chapters: ChapterDB[] }>('/api/chapters/admin'),
  getBySlug: (slug: string) => apiFetch<{ chapter: ChapterDB }>(`/api/chapters/${slug}`),
  create: (data: Partial<ChapterDB>) =>
    apiFetch<{ chapter: ChapterDB }>('/api/chapters', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ChapterDB>) =>
    apiFetch<{ chapter: ChapterDB }>(`/api/chapters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/chapters/${id}`, { method: 'DELETE' }),

  // Rewards
  rewards: (chapterId: string) =>
    apiFetch<{ rewards: RewardDB[] }>(`/api/chapters/${chapterId}/rewards`),
  createReward: (chapterId: string, data: Partial<RewardDB>) =>
    apiFetch<{ reward: RewardDB }>(`/api/chapters/${chapterId}/rewards`, { method: 'POST', body: JSON.stringify(data) }),
  updateReward: (rewardId: string, data: Partial<RewardDB>) =>
    apiFetch<{ reward: RewardDB }>(`/api/chapters/rewards/${rewardId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReward: (rewardId: string) =>
    apiFetch<{ message: string }>(`/api/chapters/rewards/${rewardId}`, { method: 'DELETE' }),
}

// ── Token helpers ──
// Semua auth (theatre + game) pakai key yang sama: auth_token & auth_user
export const tokenHelper = {
  save: (token: string) => localStorage.setItem('auth_token', token),
  clear: () => localStorage.removeItem('auth_token'),
  saveUser: (user: User) => localStorage.setItem('auth_user', JSON.stringify(user)),
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const s = localStorage.getItem('auth_user')
    return s ? JSON.parse(s) : null
  },
  clearUser: () => localStorage.removeItem('auth_user'),
}