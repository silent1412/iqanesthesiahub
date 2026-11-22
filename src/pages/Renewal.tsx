import { useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import CountdownRing from '@/components/CountdownRing'
import { formatDate, memberStatus, useAuth } from '@/lib/store'

export default function Renewal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const revoked = memberStatus(user) === 'revoked'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#1c3a13] px-5 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-fit">
          <CountdownRing fraction={0} size={120} stroke={8} tone="expired" />
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-[#f6f6f4]">
          {revoked ? 'Access revoked' : 'Your membership has expired'}
        </h1>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-[#f6f6f4]/70">
          {revoked
            ? 'Your access to the IQ Anaesthesia Hub library has been revoked. If you believe this is a mistake, please contact the hub administrator.'
            : `Your ${user.planMonths}-month membership ended on ${formatDate(
                user.expiresAt,
              )}. To renew for another 6 or 12 months, contact the hub administrator through your usual channel — access is restored as soon as your payment is confirmed.`}
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9dc98a]">
            Renewal options
          </p>
          <ul className="mt-2.5 flex flex-col gap-2 text-sm font-semibold text-[#f6f6f4]">
            <li className="flex justify-between">
              <span>6-month membership</span>
              <span className="text-[#f6f6f4]/60">Bank transfer</span>
            </li>
            <li className="flex justify-between">
              <span>12-month membership</span>
              <span className="text-[#f6f6f4]/60">Best value</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="mt-8 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-[#f6f6f4] px-6 text-[15px] font-bold text-[#1c3a13] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6f6f4]"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  )
}
