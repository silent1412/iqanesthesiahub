import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { CircleCheck, Link2, Plus, RotateCcw, Trash2, UserX } from 'lucide-react'
import { LIBRARY_SECTIONS } from '@/lib/content'
import {
  daysLeft,
  formatDate,
  memberStatus,
  useAuth,
  type Member,
  type MemberStatus,
  type PlanMonths,
} from '@/lib/store'

const STATUS_STYLE: Record<MemberStatus, string> = {
  active: 'bg-[#12b886]/15 text-[#0b7a5e] dark:text-[#34d399]',
  expiring: 'bg-warning/10 text-warning',
  expired: 'bg-destructive/10 text-destructive',
  revoked: 'bg-black/[0.06] dark:bg-white/[0.10] text-muted-foreground',
}

const STATUS_LABEL: Record<MemberStatus, string> = {
  active: 'Active',
  expiring: 'Expiring',
  expired: 'Expired',
  revoked: 'Revoked',
}

function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border-0 bg-black/[0.05] dark:bg-white/[0.09] px-3.5 text-[15px] font-medium text-foreground outline-none transition-shadow placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring'

function MemberActions({ m, isSelf }: { m: Member; isSelf: boolean }) {
  const { extendMember, setRevoked, removeMember } = useAuth()
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => {
          extendMember(m.id, 6)
          toast.success(`${m.name} extended by 6 months`)
        }}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#0a355e]/[0.08] dark:bg-white/[0.09] px-3 text-xs font-bold text-[#005eb8] dark:text-[#5eb3f6] transition-colors hover:bg-[#0a355e]/[0.14] dark:hover:bg-white/[0.15] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        +6 months
      </button>
      {m.role !== 'admin' && !isSelf && (
        <>
          <button
            type="button"
            onClick={() => {
              setRevoked(m.id, !m.revoked)
              toast.success(m.revoked ? `${m.name} reinstated` : `${m.name}'s access revoked`)
            }}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.09] px-3 text-xs font-bold text-foreground transition-colors hover:bg-black/[0.09] dark:hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {m.revoked ? (
              <CircleCheck className="size-3.5" aria-hidden />
            ) : (
              <UserX className="size-3.5" aria-hidden />
            )}
            {m.revoked ? 'Reinstate' : 'Revoke'}
          </button>
          <button
            type="button"
            onClick={() => {
              removeMember(m.id)
              toast.success(`${m.name} removed`)
            }}
            aria-label={`Remove ${m.name}`}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </>
      )}
    </div>
  )
}

function MembersTab() {
  const { members, addMember, user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState<PlanMonths>(6)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = addMember({ name, email, password, planMonths: plan })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`${name.trim()} added — ${plan}-month membership starts today`)
    setName('')
    setEmail('')
    setPassword('')
    setPlan(6)
  }

  const sorted = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name)),
    [members],
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Add member */}
      <form onSubmit={submit} className="ios-card p-5" noValidate>
        <h2 className="text-[17px] font-bold tracking-tight text-foreground">Add a member</h2>
        <p className="mt-1 text-[13px] font-medium leading-relaxed text-muted-foreground">
          Their membership starts today. Share the email and password with them after payment is
          confirmed.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            aria-label="Member name"
            className={inputClass}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            aria-label="Member email"
            className={inputClass}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Temporary password (min 6 chars)"
            aria-label="Temporary password"
            className={inputClass}
          />
          {/* iOS segmented plan picker */}
          <div
            role="radiogroup"
            aria-label="Membership plan"
            className="flex h-11 rounded-xl bg-black/[0.05] dark:bg-white/[0.09] p-0.5"
          >
            {([6, 12] as PlanMonths[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={plan === m}
                onClick={() => setPlan(m)}
                className={`flex-1 cursor-pointer rounded-[10px] text-sm font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  plan === m
                    ? 'bg-white dark:bg-white/[0.14] text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m} months
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0a355e] text-[15px] font-bold text-[#f2f7fc] transition-transform duration-150 active:scale-[0.98] md:w-auto md:px-6 md:hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden />
          Add member
        </button>
      </form>

      {/* Members — cards on mobile, table on desktop */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {sorted.map((m) => {
          const status = memberStatus(m)
          return (
            <div key={m.id} className="ios-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-foreground">
                    {m.name}
                    {m.id === user?.id && (
                      <span className="ml-2 text-[11px] font-semibold uppercase text-muted-foreground">
                        you
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[13px] font-medium text-muted-foreground">
                    {m.email}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>
              <p className="mt-2 text-[13px] font-medium text-muted-foreground">
                {m.planMonths}-month plan · expires {formatDate(m.expiresAt)}
                {status === 'active' || status === 'expiring'
                  ? ` · ${daysLeft(m)} days left`
                  : ''}
              </p>
              <div className="mt-3">
                <MemberActions m={m} isSelf={m.id === user?.id} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="ios-card hidden overflow-hidden md:block">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.10] text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Expires</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {sorted.map((m) => {
                const status = memberStatus(m)
                return (
                  <tr key={m.id} className="align-middle">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-foreground">
                        {m.name}
                        {m.id === user?.id && (
                          <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            you
                          </span>
                        )}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">{m.email}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      {m.planMonths} months
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">{formatDate(m.expiresAt)}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {status === 'expired' || status === 'revoked'
                          ? '—'
                          : `${daysLeft(m)} days left`}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <MemberActions m={m} isSelf={m.id === user?.id} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function LinksTab() {
  const { links, setLink } = useAuth()
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const save = (itemId: string, title: string) => {
    const value = (drafts[itemId] ?? links[itemId] ?? '').trim()
    setLink(itemId, value)
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    toast.success(value ? `Link saved for “${title}”` : `Link cleared for “${title}”`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="ios-card px-4 py-3.5">
        <p className="text-[13px] font-medium leading-relaxed text-muted-foreground">
          Paste each item’s Google Drive share link. Members see an{' '}
          <span className="font-bold text-foreground">Open in Google Drive</span> button as soon as
          a link is saved. Set Drive sharing to “anyone with the link can view” for now — the
          production build will proxy files through the server so raw links stop working.
        </p>
      </div>
      {LIBRARY_SECTIONS.map((section) => (
        <section key={section.id}>
          <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </h2>
          <div className="ios-card mt-2 overflow-hidden">
            <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {section.items.map((item) => {
                const saved = links[item.id] ?? ''
                const draft = drafts[item.id] ?? saved
                const dirty = draft.trim() !== saved
                return (
                  <li key={item.id} className="flex flex-col gap-2 px-4 py-3.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 truncate text-[15px] font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="shrink-0 text-xs font-medium text-muted-foreground">
                        {item.kind}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative min-w-0 flex-1">
                        <Link2
                          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <input
                          value={draft}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="https://drive.google.com/…"
                          aria-label={`Google Drive link for ${item.title}`}
                          className="h-10 w-full rounded-xl border-0 bg-black/[0.05] dark:bg-white/[0.09] pl-9 pr-3 text-[13px] font-medium text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => save(item.id, item.title)}
                        disabled={!dirty}
                        className="h-10 shrink-0 cursor-pointer rounded-full bg-[#0a355e] px-4 text-xs font-bold text-[#f2f7fc] transition-all duration-150 enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        Save
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}

export default function Admin() {
  const { members } = useAuth()
  const [tab, setTab] = useState<'members' | 'links'>('members')

  const stats = useMemo(() => {
    const counts: Record<MemberStatus, number> = { active: 0, expiring: 0, expired: 0, revoked: 0 }
    members.forEach((m) => (counts[memberStatus(m)] += 1))
    return counts
  }, [members])

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[34px] font-bold leading-tight tracking-tight text-foreground">
          Admin
        </h1>
        <p className="mt-0.5 text-[15px] font-medium text-muted-foreground">
          Memberships and Google Drive links
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {(
          [
            ['Active', stats.active, 'text-[#0b7a5e] dark:text-[#34d399]'],
            ['Expiring', stats.expiring, 'text-warning'],
            ['Expired', stats.expired, 'text-destructive'],
            ['Revoked', stats.revoked, 'text-muted-foreground'],
          ] as const
        ).map(([label, value, color]) => (
          <div key={label} className="ios-card p-4">
            <p className={`text-[28px] font-bold tabular-nums leading-none ${color}`}>{value}</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* iOS segmented control */}
      <div className="flex rounded-xl bg-black/[0.05] dark:bg-white/[0.09] p-0.5 md:w-fit">
        {(
          [
            ['members', 'Members'],
            ['links', 'Library links'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`h-9 flex-1 cursor-pointer rounded-[10px] px-5 text-sm font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex-none ${
              tab === key
                ? 'bg-white dark:bg-white/[0.14] text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'members' ? <MembersTab /> : <LinksTab />}
    </div>
  )
}
