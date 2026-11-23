import { useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import CountdownRing from '@/components/CountdownRing'
import { formatDate, memberStatus, planLabel, useAuth } from '@/lib/store'

export default function Renewal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const revoked = memberStatus(user) === 'revoked'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0a355e] px-5 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-fit">
          <CountdownRing fraction={0} size={120} stroke={8} tone="expired" />
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-[#f2f7fc]">
          {revoked
            ? 'Access revoked'
            : user.plan === 'trial'
              ? 'Your free trial has ended'
              : 'Your membership has expired'}
        </h1>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-[#f2f7fc]/70">
          {revoked
            ? 'Your access to the IQ Anaesthesia Hub library has been revoked. If you believe this is a mistake, please contact the hub administrator.'
            : `Your ${planLabel(user)} ended on ${formatDate(
                user.expiresAt,
              )}. To continue with a 6 or 12-month membership, contact the hub administrator through your usual channel — access is restored as soon as your payment is confirmed.`}
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-left backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8ecdf0]">
            Renewal options
          </p>
          <ul className="mt-2.5 flex flex-col gap-2 text-sm font-semibold text-[#f2f7fc]">
            <li className="flex justify-between">
              <span>6-month membership</span>
              <span className="text-[#f2f7fc]/60">Bank transfer</span>
            </li>
            <li className="flex justify-between">
              <span>12-month membership</span>
              <span className="text-[#f2f7fc]/60">Best value</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="mt-8 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-[#f2f7fc] px-6 text-[15px] font-bold text-[#0a355e] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2f7fc]"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  )
}
