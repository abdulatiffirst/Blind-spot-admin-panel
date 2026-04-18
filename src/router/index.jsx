import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Dashboard from '../pages/Dashboard'
import Listening from '../pages/Listening'
import Login from '../pages/Login'
import Reading from '../pages/Reading'
import Students from '../pages/Students'
import Vocabulary from '../pages/Vocabulary'
import { useAuth } from '../hooks/useAuth'
// import { agentLog } from '../debug/instrument.js'

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()
  // #region agent log
  // agentLog({
  //   runId: 'run1',
  //   hypothesisId: 'H2',
  //   location: 'src/router/index.jsx:15',
  //   message: 'protected route state',
  //   data: { loading, hasUser: Boolean(user), isAdmin },
  // })
  // #endregion
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <div style={{ padding: 24 }}>Access Denied</div>
  return children
}

const AppRouter = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default AppRouter
