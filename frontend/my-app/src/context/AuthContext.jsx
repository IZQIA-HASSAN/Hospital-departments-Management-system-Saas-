import React, { createContext, useContext, useCallback, useEffect, useState } from "react"
import { getMe, logout as logoutApi } from "../Api/settings_api"

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readStoredUser)
  const [loading, setLoading] = useState(true)

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser)
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser))
    } else {
      localStorage.removeItem("user")
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((freshUser) => { if (!cancelled) setUser(freshUser) })
      .catch(() => { if (!cancelled) setUser(null) }) // no valid session — clear stale cache
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [setUser])

  const logout = useCallback(async () => {
    try {
      await logoutApi() // clears the httpOnly cookie server-side
    } catch (err) {
      console.error("logout error:", err)
    } finally {
      setUser(null) // clear local state regardless, so the UI reflects logged-out even if the request failed
    }
  }, [setUser])

  const value = { user, accountType: user?.role || null, loading, setUser, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}