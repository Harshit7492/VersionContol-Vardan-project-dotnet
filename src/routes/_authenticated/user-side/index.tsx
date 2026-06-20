import { createFileRoute } from '@tanstack/react-router'
import UserDashboard from '@/features/user-side-dashboard'

export const Route = createFileRoute('/_authenticated/user-side/')({
  component: UserDashboard,
})
