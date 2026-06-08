import { Link, useSearch } from '@tanstack/react-router'
import { Logo } from '@/assets/logo'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[620px]">
          
          {/* Left Side - Illustration */}
          <div className="relative hidden md:flex bg-[#f0f4ff] items-center justify-center overflow-hidden">
            <div className="relative z-10 h-full w-full ">
              {/* Illustration - Person opening door */}
              <img 
                src="/images/login1.jpg" 
                alt="Login Illustration" 
                className=" h-full w-full object-cover "
              />
            </div>

            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#60a5fa_0.8px,transparent_1px)] [background-size:20px_20px] opacity-20" />
          </div>

          {/* Right Side - Login Form */}
          <div className="flex border border-l flex-col justify-center px-8 md:px-12 py-12 bg-white">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <Logo />
                <h1 className="text-2xl font-semibold text-gray-800">Vardaan Admin</h1>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900">Login to Dashboard</h2>
              <p className="mt-2 text-gray-600">
                Enter your credentials to access your dashboard
              </p>
            </div>

            <div className="mt-8">
              <UserAuthForm redirectTo={redirect} />
            </div>

            {/* <div className="mt-6 text-center text-sm">
              <Link 
                to="/forget-password" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot your password?
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}