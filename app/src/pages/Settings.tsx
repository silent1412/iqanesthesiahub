import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ChevronRight, LogOut, Moon, Pencil } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  daysLeft,
  formatDate,
  memberStatus,
  planLabel,
  useAuth,
  type MemberStatus,
} from '@/lib/store'

const STATUS_TEXT: Record<MemberStatus, string> = {
  active: 'text-[#0b7a5e] dark:text-[#34d399]',
  expiring: 'text-warning',
  expired: 'text-destructive',
  revoked: 'text-muted-foreground',
}

const STATUS_LABEL: Record<MemberStatus, string> = {
  active: 'Active',
  expiring: 'Expiring soon',
  expired: 'Expired',
  revoked: 'Revoked',
}

function initials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="px-1 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="ios-card mt-2 overflow-hidden">
        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">{children}</div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-3">
      <span className="text-[15px] font-medium text-foreground">{label}</span>
      <span className="text-right text-[15px] font-medium text-muted-foreground">{value}</span>
    </div>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border-0 bg-black/[0.05] dark:bg-white/[0.09] px-3.5 text-[15px] font-medium text-foreground outline-none transition-shadow placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring'

export default function Settings() {
  const { user, prefs, setPref, updateMember, changePassword, logout, theme, setTheme } = useAuth()
  const navigate = useNavigate()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  if (!user) return null
  const status = memberStatus(user)

  const saveName = () => {
    if (!nameDraft.trim()) {
      toast.error('Name cannot be empty.')
      return
    }
    updateMember(user.id, { name: nameDraft })
    setEditingName(false)
    toast.success('Name updated')
  }

  const submitPassword = (e: FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match.')
      return
    }
    const result = changePassword(user.id, currentPw, newPw)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Password changed')
    setChangingPw(false)
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[34px] font-bold leading-tight tracking-tight text-foreground">
          Settings
        </h1>
      </header>

      {/* Profile */}
      <Group title="Profile">
        <div className="flex items-center gap-3.5 px-4 py-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0a355e]/10 dark:bg-white/[0.09] text-sm font-bold text-[#005eb8] dark:text-[#5eb3f6]">
            {initials(user.name)}
          </div>
          {editingName ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                aria-label="Display name"
                autoFocus
                className={`${inputClass} h-10`}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
              <button
                type="button"
                onClick={saveName}
                className="h-10 shrink-0 cursor-pointer rounded-full bg-[#0a355e] px-4 text-xs font-bold text-[#f2f7fc] transition-transform duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingName(false)}
                className="h-10 shrink-0 cursor-pointer rounded-full bg-black/[0.05] dark:bg-white/[0.09] px-4 text-xs font-bold text-foreground transition-colors hover:bg-black/[0.09] dark:hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-[13px] font-medium text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNameDraft(user.name)
                  setEditingName(true)
                }}
                className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0a355e]/[0.08] dark:bg-white/[0.09] px-3 text-xs font-bold text-[#005eb8] dark:text-[#5eb3f6] transition-colors hover:bg-[#0a355e]/[0.14] dark:hover:bg-white/[0.15] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Pencil className="size-3.5" aria-hidden />
                Edit
              </button>
            </>
          )}
        </div>
      </Group>

      {/* Membership */}
      <Group title="Membership">
        <Row label="Plan" value={planLabel(user)} />
        <Row label="Started" value={formatDate(user.startedAt)} />
        <Row label="Expires" value={formatDate(user.expiresAt)} />
        <Row
          label="Status"
          value={
            <span className={`font-bold ${STATUS_TEXT[status]}`}>
              {STATUS_LABEL[status]}
              {(status === 'active' || status === 'expiring') && ` · ${daysLeft(user)} days left`}
            </span>
          }
        />
        <div className="px-4 py-3">
          <p className="text-[13px] font-medium leading-relaxed text-muted-foreground">
            To renew or change your plan, contact the hub administrator — access is updated once
            payment is confirmed.
          </p>
        </div>
      </Group>

      {/* Security */}
      <Group title="Security">
        {!changingPw ? (
          <button
            type="button"
            onClick={() => setChangingPw(true)}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left transition-colors duration-150 active:bg-black/[0.04] dark:active:bg-white/[0.08] md:hover:bg-black/[0.03] dark:md:hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
          >
            <span className="text-[15px] font-medium text-foreground">Change password</span>
            <ChevronRight className="size-4 text-muted-foreground/70" aria-hidden />
          </button>
        ) : (
          <form onSubmit={submitPassword} className="flex flex-col gap-2.5 px-4 py-4" noValidate>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password"
              aria-label="Current password"
              autoComplete="current-password"
              className={inputClass}
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password (min 6 chars)"
              aria-label="New password"
              autoComplete="new-password"
              className={inputClass}
            />
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              aria-label="Confirm new password"
              autoComplete="new-password"
              className={inputClass}
            />
            <div className="mt-1 flex gap-2">
              <button
                type="submit"
                className="h-11 flex-1 cursor-pointer rounded-full bg-[#0a355e] text-sm font-bold text-[#f2f7fc] transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Update password
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPw(false)
                  setCurrentPw('')
                  setNewPw('')
                  setConfirmPw('')
                }}
                className="h-11 cursor-pointer rounded-full bg-black/[0.05] dark:bg-white/[0.09] px-5 text-sm font-bold text-foreground transition-colors hover:bg-black/[0.09] dark:hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Group>

      {/* Appearance */}
      <Group title="Appearance">
        <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Moon className="size-[18px] text-[#005eb8] dark:text-[#5eb3f6]" strokeWidth={1.8} aria-hidden />
            <div>
              <p className="text-[15px] font-medium text-foreground">Dark Mode</p>
              <p className="text-[13px] font-medium text-muted-foreground">
                Easier on the eyes in low light
              </p>
            </div>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
            aria-label="Dark mode"
          />
        </div>
      </Group>

      {/* Notifications */}
      <Group title="Notifications">
        <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-[15px] font-medium text-foreground">Expiry reminders</p>
            <p className="text-[13px] font-medium text-muted-foreground">
              Remind me before my membership ends
            </p>
          </div>
          <Switch
            checked={prefs.expiryReminders}
            onCheckedChange={(v) => {
              setPref('expiryReminders', v)
              toast.success(v ? 'Expiry reminders on' : 'Expiry reminders off')
            }}
            aria-label="Expiry reminders"
          />
        </div>
        <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-[15px] font-medium text-foreground">New content alerts</p>
            <p className="text-[13px] font-medium text-muted-foreground">
              When new files are added to the library
            </p>
          </div>
          <Switch
            checked={prefs.newContentAlerts}
            onCheckedChange={(v) => {
              setPref('newContentAlerts', v)
              toast.success(v ? 'Content alerts on' : 'Content alerts off')
            }}
            aria-label="New content alerts"
          />
        </div>
      </Group>

      {/* Sign out */}
      <div className="ios-card overflow-hidden">
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 px-4 py-3 text-[15px] font-semibold text-destructive transition-colors duration-150 active:bg-black/[0.04] dark:active:bg-white/[0.08] md:hover:bg-black/[0.03] dark:md:hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        >
          <LogOut className="size-4" aria-hidden />
          Sign Out
        </button>
      </div>

      <p className="px-1 text-center text-xs font-medium text-muted-foreground">
        IQ Anaesthesia Hub · demo build — settings are stored in this browser and will sync to the
        server in the production build.
      </p>
    </div>
  )
}
