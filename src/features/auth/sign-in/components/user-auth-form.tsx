// import { useState } from 'react'
// import { useNavigate } from '@tanstack/react-router'
// import { Loader2, LogIn } from 'lucide-react'
// import { toast } from 'sonner'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { PasswordInput } from '@/components/password-input'
// import { userService } from '@/lib/api/userService'

// export function UserAuthForm() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [isLoading, setIsLoading] = useState(false)

//   const navigate = useNavigate()

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!email || !password) {
//       toast.error('Email and Password are required')
//       return
//     }

//     setIsLoading(true)

//     try {
//       // 1. LOGIN API
//       const loginRes = await userService.login({
//         strEmail: email,
//         password,
//       })

//       console.log('LOGIN RESPONSE:', loginRes)

//       // 2. CHECK LOGIN SUCCESS
//       if (!loginRes || loginRes.Issuccess !== true) {
//         toast.error(loginRes?.message || 'Login failed')
//         return
//       }

//       // 3. EXTRACT USER DATA (IMPORTANT FIX)
//       const userData = loginRes.response

//       if (!userData?.UserId) {
//         toast.error('User data missing from response')
//         return
//       }

//       console.log('USER DATA:', userData)

//       // 4. STORE USER ID (optional)
//       localStorage.setItem('current_user_id', String(userData.UserId))

//       // 5. OPTIONAL: FETCH PROFILE (cookie auth will be used)
//       await userService.getUserProfile(userData.UserId)

//       // 6. SUCCESS MESSAGE
//       toast.success(`Welcome ${userData.FirstName || 'User'}!`)

//       // 7. NAVIGATE TO HOME
//       console.log('Navigating to / ...')

//       navigate({
//         to: '/',
//         replace: true,
//       })

//     } catch (error) {
//       console.error('LOGIN ERROR:', error)
//       toast.error('Something went wrong. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <form onSubmit={onSubmit} className="grid gap-3">
//       <Input
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <PasswordInput
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <Button type="submit" disabled={isLoading}>
//         {isLoading ? (
//           <Loader2 className="animate-spin" />
//         ) : (
//           <LogIn />
//         )}
//         Sign In
//       </Button>
//     </form>
//   )
// }
import { useState } from 'react'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { userService } from '@/lib/api/userService'

export function UserAuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Email and Password are required')
      return
    }

    setIsLoading(true)

    userService
      .login({ strEmail: email, password })
      .then((loginRes) => {
        if (!loginRes || loginRes.Issuccess !== true) {
          toast.error(loginRes?.message || 'Login failed')
          return
        }

        const userData = loginRes.response
        const userRole = userData.Role

        // ✅ Store user data before redirecting
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.Token || userData.token || '')
        // ✅ Required by _authenticated route guard (beforeLoad checks this key)

        toast.success(`Welcome ${userData.FirstName || 'User'}!`)

        console.log('Navigating for role:', userRole)

        // ✅ Use window.location.href for reliable redirect
        if (userRole === 3) {
          window.location.href = '/'
        } else if (userRole === 4) {
          window.location.href = '/user-side'
        } else {
          window.location.href = '/'
        }
      })
      .catch((error) => {
        console.error('LOGIN ERROR:', error)
        toast.error('Something went wrong. Please try again.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
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
            <Loader2 className="animate-spin mr-2" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  )
}