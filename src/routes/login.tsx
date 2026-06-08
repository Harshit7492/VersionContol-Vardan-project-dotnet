import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'

export const Route = createFileRoute('/login')({
  component: SignIn,
})

export default Route
