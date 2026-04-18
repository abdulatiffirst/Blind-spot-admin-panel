import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { loginWithEmail, logout as logoutReq } from '../firebase/auth'
// import { agentLog } from '../debug/instrument.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      // #region agent log
     
      // #endregion
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
        // #region agent lo
        // agentLog({
        //   runId: 'run1',
        //   hypothesisId: 'H2',
        //   location: 'src/hooks/useAuth.:35',
        //   message: 'user role resolved',
        //   data: { docExists: snap.exists(), role: role || 'none' },
        // })
        // #endregion
        setUser(currentUser)
        setIsAdmin(role === 'admin')
      } catch (err) {
        setError(err.message || 'Authentication error')
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  const login = async (email, password) => {
    setError('')
    await loginWithEmail(email, password)
  }

  const logout = async () => {
    await logoutReq()
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
