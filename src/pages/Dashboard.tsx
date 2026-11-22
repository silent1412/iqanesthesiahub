import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import CountdownRing from '@/components/CountdownRing'
import { LIBRARY_SECTIONS } from '@/lib/content'
import {
  daysLeft,
  formatDate,
  memberStatus,
  msLeft,
  planProgress,
  useAuth,
} from '@/lib/store'

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0')
}

export default function Dashboard() {
  const { user, links } = useAuth()
  useNow(1000)

  const countdown = (() => {
    if (!user) return { d: 0, h: 0, m: 0, s: 0 }
    const totalSec = Math.floor(msLeft(user) / 1000)
    return {
      d: Math.floor(totalSec / 86400),
      h: Math.floor((totalSec % 86400) / 3600),
      m: Math.floor((totalSec % 3600) / 60),
      s: totalSec % 60,
    }
  })()

  if (!user) return null

  const status = memberStatus(user)
  const days = daysLeft(user)
  const totalDays = Math.max(
    1,
    Math.round(
      (new Date(user.expiresAt).getTime() - new Date(user.startedAt).getTime()) / 86_400_000,
    ),
  )
  const remainingFraction = 1 - planProgress(user)
  const tone = status === 'active' ? 'active' : status === 'expiring' ? 'expiring' : 'expired'
  const firstName = user.name.replace(/^Dr\.\s*/i, '').split(/\s+/)[0]
  const totalItems = LIBRARY_SECTIONS.reduce((n, s) => n + s.items.length, 0)
  const linkedItems = LIBRARY_SECTIONS.reduce(
    (n, s) => n + s.items.filter((i) => links[i.id]).length,
    0,
  )

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[34px] font-bold leading-tight tracking-tight text-foreground">
          Hello, {firstName}
        </h1>
        <p className="mt-0.5 text-[15px] font-medium text-muted-foreground">
          {formatDate(new Date().toISOString())}
        </p>
      </header>

      {status === 'expiring' && (
        <div className="ios-card flex items-start gap-3 border border-warning/20 !bg-warning/[0.08] px-4 py-3.5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <p className="text-sm font-semibold leading-relaxed text-foreground">
            Your membership expires in {days} day{days === 1 ? '' : 's'}. Contact the hub
            administrator to renew for another 6 or 12 months.
          </p>
        </div>
      )}

      {/* Subscription card — Apple Fitness-style ring card */}
      <section className="rounded-3xl bg-[#0a355e] p-6 text-[#f2f7fc] shadow-lg shadow-[#0a355e]/20 md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#8ecdf0]">
            {user.planMonths}-month membership
          </p>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
            {status === 'active' ? 'Active' : 'Expiring'}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-6">
          <div className="relative shrink-0">
            <CountdownRing fraction={remainingFraction} size={112} stroke={9} tone={tone} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-bold tabular-nums leading-none">{days}</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#f2f7fc]/60">
                days left
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[22px] font-bold tabular-nums tracking-tight md:text-2xl">
              {countdown.d}d {pad(countdown.h)}h {pad(countdown.m)}m {pad(countdown.s)}s
            </p>
            <p className="mt-1 text-[13px] font-medium text-[#f2f7fc]/60">
              Live countdown to expiry
            </p>
            <div className="mt-4 h-1.5 w-full max-w-44 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#8ecdf0] transition-[width] duration-500 ease-out"
                style={{ width: `${Math.round(planProgress(user) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-[#f2f7fc]/50">
              {Math.round(planProgress(user) * 100)}% of {totalDays} days used
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f2f7fc]/45">
              Started
            </p>
            <p className="mt-1 text-[15px] font-bold">{formatDate(user.startedAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f2f7fc]/45">
              Expires
            </p>
            <p className="mt-1 text-[15px] font-bold">{formatDate(user.expiresAt)}</p>
          </div>
        </div>
      </section>

      {/* Library — iOS grouped rows */}
      <section>
        <div className="flex items-end justify-between px-1">
          <h2 className="text-[22px] font-bold tracking-tight text-foreground">Library</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            {linkedItems}/{totalItems} linked
          </p>
        </div>
        <div className="ios-card mt-3 overflow-hidden">
          <ul className="divide-y divide-black/[0.06]">
            {LIBRARY_SECTIONS.map((section) => (
              <li key={section.id}>
                <Link
                  to={`/library?section=${section.id}`}
                  className="flex min-h-11 items-center gap-3.5 px-4 py-3 transition-colors duration-150 active:bg-black/[0.04] md:hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#0a355e]/[0.08] text-[15px] font-extrabold text-[#005eb8]">
                    {section.title
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-foreground">
                      {section.title}
                    </span>
                    <span className="block truncate text-[13px] font-medium text-muted-foreground">
                      {section.items.length} items
                      {section.items.some((i) => !links[i.id]) ? ' · links pending' : ''}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
