import { createContext, createElement, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { loginWithEmail, logout as logoutReq } from '../firebase/auth'

const AuthContext = createContext(null)
const AUTH_LOAD_TIMEOUT_MS = 5000

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let resolvedInitialState = false

    const resolveAuthState = async (currentUser) => {
      if (!active) return

      setLoading(true)
      setError('')
      if (!currentUser) {
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid))
        const role = snap.exists() ? snap.data().role : null
        if (!active) return
        setUser(currentUser)
        setIsAdmin(role === 'admin')
      } catch (err) {
        if (!active) return
        setError(err.message || 'Authentication error')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    const fallbackTimer = window.setTimeout(() => {
      if (resolvedInitialState || !active) return
      resolvedInitialState = true
      setUser(null)
      setIsAdmin(false)
      setLoading(false)
    }, AUTH_LOAD_TIMEOUT_MS)

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      resolvedInitialState = true
      window.clearTimeout(fallbackTimer)
      await resolveAuthState(currentUser)
    })

    return () => {
      active = false
      window.clearTimeout(fallbackTimer)
      unsub()
    }
  }, [])

  const login = async (email, password) => {
    setError('')
    try {
      await loginWithEmail(email, password)
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      throw new Error(message)
    }
  }

  const logout = async () => {
    setError('')
    try {
      await logoutReq()
    } catch (err) {
      const message = err.message || 'Logout failed'
      setError(message)
      throw new Error(message)
    }
  }

  return createElement(
    AuthContext.Provider,
    { value: { user, isAdmin, loading, login, logout, error } },
    children,
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
