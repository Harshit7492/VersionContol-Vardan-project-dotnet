import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const handleSignIn = () => {
    auth.reset()
    navigate('/login', { replace: true })
  }

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>Access Forbidden</span>
        <p className='text-center text-muted-foreground'>
          You don't have necessary permission <br />
          to view this resource.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={handleSignIn}>Go to Sign In</Button>
        </div>
      </div>
    </div>
  )
}
