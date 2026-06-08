import { createFileRoute } from '@tanstack/react-router'
import UsersRole from '@/features/users/user-roles'

export const Route = createFileRoute('/_authenticated/users/roles/')({
  component: UsersRole,
})
