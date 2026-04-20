import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import { clearStoredToken, getStoredToken, setStoredToken, type AuthUser } from "@/services/auth"

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (token: string, user: AuthUser | null) => void
  setUser: (user: AuthUser | null) => void
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORED_USER_KEY = "authUser"

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORED_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUserState] = useState<AuthUser | null>(() => readStoredUser())

  const setSession = useCallback((nextToken: string, nextUser: AuthUser | null) => {
    setStoredToken(nextToken)
    setToken(nextToken)
    setUserState(nextUser)

    if (nextUser) {
      localStorage.setItem(STORED_USER_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORED_USER_KEY)
    }
  }, [])

  const clearSession = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUserState(null)
    localStorage.removeItem(STORED_USER_KEY)
  }, [])

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser)
    if (nextUser) {
      localStorage.setItem(STORED_USER_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(STORED_USER_KEY)
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      user,
      isAuthenticated: Boolean(token),
      setSession,
      setUser,
      clearSession,
    }
  }, [token, user, setSession, setUser, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
