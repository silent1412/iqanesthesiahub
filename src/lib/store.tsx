import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type PlanMonths = 6 | 12
export type Role = 'admin' | 'member'
export type MemberStatus = 'active' | 'expiring' | 'expired' | 'revoked'

export interface Member {
  id: string
  name: string
  email: string
  password: string
  role: Role
  planMonths: PlanMonths
  startedAt: string // ISO
  expiresAt: string // ISO
  revoked: boolean
}

const MEMBERS_KEY = 'iqa_members_v1'
const SESSION_KEY = 'iqa_session_v1'
const LINKS_KEY = 'iqa_links_v1'
const PREFS_KEY = 'iqa_prefs_v1'
export const DAY_MS = 86_400_000

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function makeMember(
  id: string,
  name: string,
  email: string,
  password: string,
  role: Role,
  planMonths: PlanMonths,
  startedDaysAgo: number,
): Member {
  const started = new Date(Date.now() - startedDaysAgo * DAY_MS)
  return {
    id,
    name,
    email,
    password,
    role,
    planMonths,
    startedAt: started.toISOString(),
    expiresAt: addMonths(started, planMonths).toISOString(),
    revoked: false,
  }
}

function seedMembers(): Member[] {
  return [
    makeMember('m-admin', 'Hub Admin', 'admin@iqahub.com', 'admin123', 'admin', 12, 10),
    makeMember('m-sara', 'Dr. Sara Lim', 'member@iqahub.com', 'member123', 'member', 6, 45),
    makeMember('m-daniel', 'Dr. Daniel Wong', 'expiring@iqahub.com', 'expiring123', 'member', 6, 170),
    makeMember('m-amy', 'Dr. Amy Chen', 'expired@iqahub.com', 'expired123', 'member', 6, 200),
  ]
}

export function msLeft(m: Member): number {
  return Math.max(0, new Date(m.expiresAt).getTime() - Date.now())
}

export function daysLeft(m: Member): number {
  return Math.ceil(msLeft(m) / DAY_MS)
}

export function memberStatus(m: Member): MemberStatus {
  if (m.revoked) return 'revoked'
  if (msLeft(m) <= 0) return 'expired'
  if (daysLeft(m) <= 30) return 'expiring'
  return 'active'
}

export function planProgress(m: Member): number {
  const start = new Date(m.startedAt).getTime()
  const end = new Date(m.expiresAt).getTime()
  if (end <= start) return 1
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function loadJSON<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    /* corrupted storage -> reseed */
  }
  const value = fallback()
  localStorage.setItem(key, JSON.stringify(value))
  return value
}

export interface MemberPrefs {
  expiryReminders: boolean
  newContentAlerts: boolean
}

const DEFAULT_PREFS: MemberPrefs = { expiryReminders: true, newContentAlerts: true }

interface AuthContextValue {
  user: Member | null
  members: Member[]
  links: Record<string, string>
  prefs: MemberPrefs
  login: (email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  addMember: (input: {
    name: string
    email: string
    password: string
    planMonths: PlanMonths
  }) => { ok: boolean; error?: string }
  extendMember: (id: string, months: PlanMonths) => void
  setRevoked: (id: string, revoked: boolean) => void
  removeMember: (id: string) => void
  setLink: (itemId: string, url: string) => void
  updateMember: (id: string, patch: { name?: string }) => void
  changePassword: (
    id: string,
    current: string,
    next: string,
  ) => { ok: boolean; error?: string }
  setPref: (key: keyof MemberPrefs, value: boolean) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() => loadJSON(MEMBERS_KEY, seedMembers))
  const [links, setLinks] = useState<Record<string, string>>(() => loadJSON(LINKS_KEY, () => ({})))
  const [allPrefs, setAllPrefs] = useState<Record<string, MemberPrefs>>(() =>
    loadJSON(PREFS_KEY, () => ({})),
  )
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY),
  )

  useEffect(() => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
  }, [members])

  useEffect(() => {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links))
  }, [links])

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(allPrefs))
  }, [allPrefs])

  const user = useMemo(
    () => members.find((m) => m.id === sessionId) ?? null,
    [members, sessionId],
  )

  const login = useCallback(
    (email: string, password: string) => {
      const found = members.find(
        (m) => m.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (!found || found.password !== password) {
        return { ok: false, error: 'Incorrect email or password.' }
      }
      localStorage.setItem(SESSION_KEY, found.id)
      setSessionId(found.id)
      return { ok: true }
    },
    [members],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSessionId(null)
  }, [])

  const addMember: AuthContextValue['addMember'] = useCallback(
    ({ name, email, password, planMonths }) => {
      const cleanEmail = email.trim().toLowerCase()
      if (!name.trim()) return { ok: false, error: 'Name is required.' }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
        return { ok: false, error: 'Enter a valid email address.' }
      if (password.length < 6)
        return { ok: false, error: 'Password must be at least 6 characters.' }
      if (members.some((m) => m.email.toLowerCase() === cleanEmail))
        return { ok: false, error: 'A member with this email already exists.' }
      const now = new Date()
      const member: Member = {
        id: `m-${now.getTime()}`,
        name: name.trim(),
        email: cleanEmail,
        password,
        role: 'member',
        planMonths,
        startedAt: now.toISOString(),
        expiresAt: addMonths(now, planMonths).toISOString(),
        revoked: false,
      }
      setMembers((prev) => [...prev, member])
      return { ok: true }
    },
    [members],
  )

  const extendMember = useCallback((id: string, months: PlanMonths) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const base = msLeft(m) > 0 ? new Date(m.expiresAt) : new Date()
        return { ...m, expiresAt: addMonths(base, months).toISOString() }
      }),
    )
  }, [])

  const setRevoked = useCallback((id: string, revoked: boolean) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, revoked } : m)))
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const setLink = useCallback((itemId: string, url: string) => {
    setLinks((prev) => {
      const next = { ...prev }
      if (url.trim()) next[itemId] = url.trim()
      else delete next[itemId]
      return next
    })
  }, [])

  const updateMember = useCallback((id: string, patch: { name?: string }) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id && patch.name?.trim() ? { ...m, name: patch.name.trim() } : m,
      ),
    )
  }, [])

  const changePassword = useCallback(
    (id: string, current: string, next: string) => {
      const member = members.find((m) => m.id === id)
      if (!member) return { ok: false, error: 'Account not found.' }
      if (member.password !== current)
        return { ok: false, error: 'Current password is incorrect.' }
      if (next.length < 6)
        return { ok: false, error: 'New password must be at least 6 characters.' }
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, password: next } : m)))
      return { ok: true }
    },
    [members],
  )

  const prefs = useMemo<MemberPrefs>(
    () => (user ? { ...DEFAULT_PREFS, ...allPrefs[user.id] } : DEFAULT_PREFS),
    [user, allPrefs],
  )

  const setPref = useCallback(
    (key: keyof MemberPrefs, value: boolean) => {
      if (!user) return
      setAllPrefs((prev) => ({
        ...prev,
        [user.id]: { ...DEFAULT_PREFS, ...prev[user.id], [key]: value },
      }))
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      members,
      links,
      prefs,
      login,
      logout,
      addMember,
      extendMember,
      setRevoked,
      removeMember,
      setLink,
      updateMember,
      changePassword,
      setPref,
    }),
    [
      user,
      members,
      links,
      prefs,
      login,
      logout,
      addMember,
      extendMember,
      setRevoked,
      removeMember,
      setLink,
      updateMember,
      changePassword,
      setPref,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
