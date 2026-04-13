import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }
    api.auth
      .me()
      .then((u) => {
        if (u.role !== 'admin') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
          setToken(null)
          setUser(null)
        } else {
          setUser(u)
        }
      })
      .catch(() => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    localStorage.setItem('auth_token', res.token)
    localStorage.setItem('refresh_token', res.refresh_token)
    setToken(res.token)
    setUser(res.user)
    if (res.user.role !== 'admin') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      setToken(null)
      setUser(null)
      throw new Error('No tienes permisos de administrador')
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}