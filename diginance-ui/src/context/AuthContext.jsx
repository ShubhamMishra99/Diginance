import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api, clearSession, getToken, persistSession } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(() => !!getToken())

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setBootstrapping(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await api('/api/auth/me')
        if (!cancelled) {
          setUser(data.user)
          persistSession(token, data.user)
        }
      } catch {
        if (!cancelled) {
          clearSession()
          setUser(null)
        }
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    persistSession(data.token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (username, password, role) => {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: { username, password, role },
    })
    persistSession(data.token, data.user)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!user,
    }),
    [user, bootstrapping, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
