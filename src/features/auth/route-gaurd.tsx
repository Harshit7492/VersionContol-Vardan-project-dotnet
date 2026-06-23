import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE_ROUTES } from '@/config/role-routes'

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const location = useLocation()
  const { auth } = useAuthStore()

  // Still hydrating — show spinner
  if (!auth.isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    )
  }

  // No user → send to login
  if (!auth.user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  const roleConfig = ROLE_ROUTES[auth.user.roleId]

  // Unknown roleId → truly forbidden (misconfigured account)
  if (!roleConfig) {
    return <Navigate to="/403" replace />
  }

  const isAllowed = roleConfig.allowed.some((pattern) =>
    pattern.test(location.pathname)
  )

  // Path not allowed for this role → send them to their home, not /403
  if (!isAllowed) {
    return <Navigate to={roleConfig.defaultRedirect} replace />
  }

  return <>{children}</>
}