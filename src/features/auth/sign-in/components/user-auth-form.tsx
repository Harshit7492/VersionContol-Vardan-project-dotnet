import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { userService } from '@/lib/api/userService'
import { useAuthStore } from '@/stores/auth-store'
import { server } from 'vitest/browser'

export function UserAuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!email || !password) {
    toast.error('Email and Password are required')
    return
  }

  setIsLoading(true)

  try {
    // 1. LOGIN API
    const loginRes = await userService.login({ strEmail: email, password })
    console.log({ loginRes })

    // Early exit if API failure flag
    if (!loginRes || loginRes.Issuccess !== true) {
      toast.error(loginRes?.message || 'Login failed')
      setIsLoading(false)
      return 
    }

    // 2. EXTRACT USER ID FROM THE RESPONSE ARRAY
    // Added [0] here because your log shows response is an array: [{...}]
    const userData = loginRes.response?.[0]
    
    if (!userData?.UserID) {
      toast.error('User data missing from response')
      setIsLoading(false)
      return
    }

    // 3. UPDATE AUTH STORE / GET PROFILE
    console.log('User data extracted from login response:', userData)
    localStorage.setItem('current_user_id', String(userData.UserID))
    const profile = await userService.getUserProfile(userData.UserID)

    // 4. SUCCESS TOAST & NAVIGATE
    // const firstName = profile?.FirstName || 'Back'
    // toast.success(`Welcome ${firstName}!`)

    navigate({
      to: '/',
      replace: true,
    })

  } catch (error) {
    console.error('Unexpected login error:', error)
    toast.error('Something went wrong. Please try again.')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <form onSubmit={onSubmit} className='grid gap-3'>
      <Input
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordInput
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type='submit' disabled={isLoading}>
        {isLoading ? (
          <Loader2 className='animate-spin' />
        ) : (
          <LogIn />
        )}
        Sign In
      </Button>
    </form>
  )
}