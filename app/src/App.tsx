import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import AppShell from '@/components/AppShell'
import { memberStatus, useAuth } from '@/lib/store'
import Admin from '@/pages/Admin'
import Dashboard from '@/pages/Dashboard'
import Library from '@/pages/Library'
import Login from '@/pages/Login'
import Renewal from '@/pages/Renewal'
import Settings from '@/pages/Settings'

const Reader = lazy(() => import('@/pages/Reader'))

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

  if (location.pathname.startsWith('/reader')) {
    return (
      <Routes>
        <Route
          path="/reader/:itemId"
          element={
            <Suspense
              fallback={
                <div className="fixed inset-0 flex items-center justify-center bg-[#eef3f8] dark:bg-[#0a1522]">
                  <span className="size-9 animate-spin rounded-full border-[3px] border-[#005eb8]/20 border-t-[#005eb8]" />
                </div>
              }
            >
              <Reader />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        {user.role === 'admin' && <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
