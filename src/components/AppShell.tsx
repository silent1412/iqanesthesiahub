import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router'
import {
  BookOpen,
  LayoutGrid,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { daysLeft, memberStatus, useAuth, type Member } from '@/lib/store'

function initials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function StatusChip({ member }: { member: Member }) {
  const status = memberStatus(member)
  const days = daysLeft(member)
  const styles: Record<string, string> = {
    active: 'bg-[#8ecdf0]/15 text-[#cfe8fa]',
    expiring: 'bg-[#e0a33e]/15 text-[#f0c887]',
    expired: 'bg-[#d4573f]/15 text-[#f0a495]',
    revoked: 'bg-white/10 text-white/60',
  }
  const labels: Record<string, string> = {
    active: `${days} days left`,
    expiring: `${days} days left`,
    expired: 'Expired',
    revoked: 'Revoked',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
}

function useNavItems(): NavItem[] {
  const { user } = useAuth()
  return [
    { to: '/', label: 'Home', icon: LayoutGrid, end: true },
    { to: '/library', label: 'Library', icon: BookOpen, end: false },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, end: false }]
      : []),
    { to: '/settings', label: 'Settings', icon: SettingsIcon, end: false },
  ]
}

function DesktopNav() {
  const items = useNavItems()
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2f7fc] ${
              isActive
                ? 'bg-[#f2f7fc] text-[#0a355e]'
                : 'text-[#f2f7fc]/60 hover:bg-white/5 hover:text-[#f2f7fc]'
            }`
          }
        >
          <Icon className="size-[18px] shrink-0" aria-hidden />
          {label === 'Home' ? 'Dashboard' : label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f2f7fc] text-[13px] font-extrabold tracking-tight text-[#0a355e] shadow-sm">
        IQ
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-bold text-[#f2f7fc]">IQ Anaesthesia Hub</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#f2f7fc]/50">
            Member Portal
          </p>
        </div>
      )}
    </div>
  )
}

function MemberFooter() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  return (
    <div className="rounded-2xl bg-white/[0.06] p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#8ecdf0]/20 text-xs font-bold text-[#cfe8fa]">
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-[#f2f7fc]">{user.name}</p>
          <div className="mt-1">
            <StatusChip member={user} />
          </div>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#f2f7fc]/60 transition-colors duration-200 hover:bg-white/10 hover:text-[#f2f7fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2f7fc]"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const items = useNavItems()

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-[#0a355e] p-4 md:flex">
        <div className="px-1.5 pb-6 pt-2">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <DesktopNav />
        </div>
        <MemberFooter />
      </aside>

      {/* Mobile top bar — translucent, iOS style */}
      <div className="pt-safe fixed inset-x-0 top-0 z-40 bg-[#eef3f8]/80 dark:bg-[#0b1420]/80 backdrop-blur-xl md:hidden">
        <div className="flex h-12 items-center justify-center border-b border-black/[0.06] dark:border-white/[0.10]">
          <p className="text-[17px] font-bold tracking-tight text-foreground">
            IQ Anaesthesia Hub
          </p>
          <button
            type="button"
            aria-label="Sign out"
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="absolute right-2 flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <LogOut className="size-[18px]" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mobile bottom tab bar — translucent, iOS style */}
      <nav
        aria-label="Main navigation"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] dark:border-white/[0.12] bg-white/85 dark:bg-[#0d1826]/85 backdrop-blur-xl md:hidden"
      >
        <div className="flex items-stretch justify-around">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 pb-0.5 pt-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring ${
                  isActive ? 'text-[#005eb8] dark:text-[#5eb3f6]' : 'text-[#8e8e93]'
                }`
              }
            >
              <Icon className="size-6" strokeWidth={1.8} aria-hidden />
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="min-w-0 flex-1 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(3rem+env(safe-area-inset-top)+1rem)] md:px-10 md:pb-16 md:pt-10">
        <div className="mx-auto w-full max-w-2xl md:max-w-5xl">{children}</div>
      </main>
    </div>
  )
}
