import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

// ─── Role Constants ──────────────────────────────────────────────────────────
const ROLE_USER = 4 // Regular user – only allowed on /user-side routes

// Routes that roleId 4 (User) is permitted to access.
// Add more paths here in the future as needed.
const USER_ALLOWED_ROUTES: string[] = ['/user-side', '/user-side/']

export const Route = createFileRoute('/_authenticated')({
  // ─── Role-Based Middleware ────────────────────────────────────────────────
  beforeLoad: ({ location }) => {
    // 1. Read stored user object written by UserAuthForm after login
    const raw = localStorage.getItem('user')
    const userData = raw ? JSON.parse(raw) : null
    const userRoleId: number | null = userData?.Role ?? null

    const currentPath = location.pathname

    // 2. If the user has roleId 4 (regular User) ──────────────────────────
    if (userRoleId === ROLE_USER) {
      // Check whether the current route is in the allowed list for this role
      const isAllowed = USER_ALLOWED_ROUTES.some(
        (allowed) =>
          currentPath === allowed || currentPath.startsWith(allowed + '/')
      )

      if (!isAllowed) {
        // Block access to any route not explicitly allowed for role 4
        // and redirect them to their designated home
        throw redirect({ to: '/user-side', replace: true })
      }

      // Route is allowed – let the navigation proceed
      return
    }

    // 3. For every OTHER role (admins, managers, etc.) ─────────────────────
    // Block access to user-side routes so they cannot visit a user-only area
    const isUserSideRoute = USER_ALLOWED_ROUTES.some(
      (allowed) =>
        currentPath === allowed || currentPath.startsWith(allowed + '/')
    )

    if (isUserSideRoute) {
      // Redirect non-user roles away from user-side back to the main dashboard
      throw redirect({ to: '/', replace: true })
    }

    // All other routes are accessible for non-user roles – proceed normally
  },

  component: AuthenticatedLayout,
})
