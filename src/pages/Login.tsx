import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, ChevronRight, FileText, ListChecks, Video } from 'lucide-react'
import { useAuth } from '@/lib/store'

const DEMO_ACCOUNTS = [
  { email: 'admin@iqahub.com', password: 'admin123', label: 'Admin · 12-month plan' },
  { email: 'member@iqahub.com', password: 'member123', label: 'Member · active' },
  { email: 'expiring@iqahub.com', password: 'expiring123', label: 'Member · expiring soon' },
  { email: 'expired@iqahub.com', password: 'expired123', label: 'Member · expired' },
]

const HIGHLIGHTS = [
  { icon: FileText, text: 'Curated lecture notes and quick-reference cards' },
  { icon: ListChecks, text: 'Question bank with timed mock exams' },
  { icon: Video, text: 'Recorded webinars and case discussions' },
  { icon: BookOpen, text: 'One library, always up to date on Google Drive' },
]

const inputClass =
  'h-12 w-full rounded-xl border-0 bg-black/[0.05] px-4 text-[16px] font-medium text-foreground outline-none transition-shadow placeholder:text-muted-foreground/80 focus-visible:ring-2 focus-visible:ring-ring'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = login(email, password)
    if (result.ok) navigate('/')
    else setError(result.error ?? 'Sign-in failed.')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      {/* Brand panel */}
      <section className="pt-safe relative flex flex-col justify-between bg-[#1c3a13] px-6 pb-10 md:w-[46%] md:px-12 md:py-14">
        <div className="flex items-center gap-3 pt-6 md:pt-0">
          <div className="flex size-11 items-center justify-center rounded-[12px] bg-[#f6f6f4] text-sm font-extrabold text-[#1c3a13] shadow-md">
            IQ
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-[#f6f6f4]">IQ Anaesthesia Hub</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#f6f6f4]/50">
              Member Portal
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-0">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9dc98a]">
            Members only
          </p>
          <h1 className="mt-3 max-w-md text-[34px] font-bold leading-[1.1] tracking-tight text-[#f6f6f4] md:text-5xl">
            One library for your entire anaesthesia practice.
          </h1>
          <ul className="mt-9 flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-[15px] font-medium text-[#f6f6f4]/85"
              >
                <Icon className="size-4 shrink-0 text-[#9dc98a]" strokeWidth={1.8} aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12 text-xs font-medium text-[#f6f6f4]/40 md:mt-0">
          6 &amp; 12-month memberships · Access managed by the hub administrator
        </p>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-start justify-center px-5 py-10 md:items-center md:px-10">
        <div className="w-full max-w-sm">
          <h2 className="text-[28px] font-bold tracking-tight text-foreground">Sign in</h2>
          <p className="mt-1 text-[15px] font-medium text-muted-foreground">
            Use the account provided with your membership.
          </p>

          <form onSubmit={submit} className="mt-7 flex flex-col gap-3" noValidate>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-label="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="Email"
              className={inputClass}
            />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Password"
              className={inputClass}
            />

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 h-[50px] cursor-pointer rounded-full bg-[#1c3a13] text-[17px] font-bold text-[#f6f6f4] transition-transform duration-150 active:scale-[0.98] md:hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sign In
            </button>
          </form>

          {/* Demo accounts — iOS grouped list */}
          <p className="mt-9 px-1 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            Demo accounts — tap to fill
          </p>
          <div className="ios-card mt-2 overflow-hidden">
            <ul className="divide-y divide-black/[0.06]">
              {DEMO_ACCOUNTS.map((acc) => (
                <li key={acc.email}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(acc.email)
                      setPassword(acc.password)
                      setError(null)
                    }}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 active:bg-black/[0.04] md:hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-foreground">
                        {acc.email}
                      </span>
                      <span className="block text-[13px] font-medium text-muted-foreground">
                        {acc.label}
                      </span>
                    </span>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground/70"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 px-1 text-xs font-medium leading-relaxed text-muted-foreground">
            Demo build: accounts are stored in this browser only. The production build will verify
            sign-ins on the server.
          </p>
        </div>
      </section>
    </div>
  )
}
