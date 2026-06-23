import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { userService } from '@/lib/api/userService'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({
  open,
  onOpenChange,
}: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await userService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }

    // Preserve current route for redirect after login
    const currentPath = `${location.pathname}${location.search}`

    auth.reset()
    localStorage.clear()

    navigate(
      `/sign-in?redirect=${encodeURIComponent(currentPath)}`,
      { replace: true }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Sign out"
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  )
}