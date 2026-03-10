'use client'
// lib/authContext.tsx
// Simpan di: lib/authContext.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { tokenHelper } from '@/lib/gameApi'
import type { User } from '@/lib/gameApi'

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  setUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = tokenHelper.getUser()
    if (saved) setUserState(saved)
    setLoading(false)
  }, [])

  const setUser = (u: User) => {
    tokenHelper.saveUser(u)
    setUserState(u)
  }

  const logout = () => {
    tokenHelper.clear()
    tokenHelper.clearUser()
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
