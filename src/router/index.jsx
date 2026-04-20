import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Layout = lazy(() => import('../components/layout/Layout'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Listening = lazy(() => import('../pages/Listening'))
const Login = lazy(() => import('../pages/Login'))
const Reading = lazy(() => import('../pages/Reading'))
const Students = lazy(() => import('../pages/Students'))
const Vocabulary = lazy(() => import('../pages/Vocabulary'))

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <div style={{ padding: 24 }}>Access Denied</div>
  return children
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/reading" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reading" element={<Reading />} />
            <Route path="listening" element={<Listening />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="students" element={<Students />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
