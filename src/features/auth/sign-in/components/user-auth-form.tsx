import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { userService } from '@/lib/api/userService'
import { useAuthStore, AuthUser } from '@/stores/auth-store'
import { ROLE_ROUTES } from '@/config/role-routes'

export function UserAuthForm() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [isLoading, setIsLoading]   = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Email and Password are required')
      return
    }

    try {
      setIsLoading(true)

      const loginRes = await userService.login({
        strEmail: email,
        password,
      })

      if (!loginRes?.Issuccess) {
        toast.error(loginRes?.message || 'Login failed')
        return
      }

      const u = loginRes.response

      const mapped: AuthUser = {
        userId:    u.UserId,
        firstName: u.FirstName,
        lastName:  u.LastName,
        email:     u.Email,
        roleId:    Number(u.Role),
      }

      // Saves to Zustand + sessionStorage
      auth.setUser(mapped)

      toast.success(`Welcome ${mapped.firstName}!`)

      // Respect ?redirect= only if the role is actually allowed to go there
      const params      = new URLSearchParams(window.location.search)
      const redirectTo  = params.get('redirect')
      const roleConfig  = ROLE_ROUTES[mapped.roleId]
      const defaultPath = roleConfig?.defaultRedirect ?? '/'

      let destination = defaultPath
      if (redirectTo) {
        const decoded = decodeURIComponent(redirectTo)
        // Only honour the saved redirect if this role can access it
        const isAllowed = roleConfig?.allowed.some((pattern) => pattern.test(decoded))
        destination = isAllowed ? decoded : defaultPath
      }

      navigate(destination, { replace: true })

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <PasswordInput
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </>
        )}
      </Button>
    </form>
  )
}