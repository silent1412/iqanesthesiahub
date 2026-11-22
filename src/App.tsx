import { Navigate, Route, Routes, useLocation } from 'react-router'
import AppShell from '@/components/AppShell'
import { memberStatus, useAuth } from '@/lib/store'
import Admin from '@/pages/Admin'
import Dashboard from '@/pages/Dashboard'
import Library from '@/pages/Library'
import Login from '@/pages/Login'
import Renewal from '@/pages/Renewal'

export default function App() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const blocked = memberStatus(user) === 'expired' || memberStatus(user) === 'revoked'
  if (blocked) {
    return (
      <Routes>
        <Route path="*" element={<Renewal />} />
      </Routes>
    )
  }

  if (user.role !== 'admin' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/" replace />
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        {user.role === 'admin' && <Route path="/admin" element={<Admin />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
