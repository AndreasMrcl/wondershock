'use client'
// hooks/useGameTimer.ts
import { useEffect, useRef, useState, useCallback } from 'react'

export function useGameTimer(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback((s: number) => {
    setRunning(false)
    setTimeLeft(s)
  }, [])

  // Penalise: kurangi detik dari timer (untuk jawaban salah & hint)
  const penalise = useCallback((seconds: number) => {
    setTimeLeft(t => Math.max(0, t - seconds))
  }, [])

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setRunning(false); return 0 }
        return t - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const hh = Math.floor(timeLeft / 3600)
  const mm = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const display = hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`

  const pct = initialSeconds > 0 ? timeLeft / initialSeconds : 0
  const urgent = timeLeft <= 300 && timeLeft > 0   // ≤5 menit = urgent
  const warning = timeLeft <= 600 && timeLeft > 300 // ≤10 menit = warning

  return {
    timeLeft,
    display,
    pct,
    urgent,
    warning,
    expired: timeLeft === 0,
    start,
    pause,
    reset,
    penalise,
  }
}