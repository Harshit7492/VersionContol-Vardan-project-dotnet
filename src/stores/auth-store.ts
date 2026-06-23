

// import { create } from 'zustand'
// import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

// const USER_COOKIE = 'app_user'

// export interface AuthUser {
//   userId: number
//   firstName: string
//   lastName: string
//   email: string
//   roleId: number
// }

// interface AuthState {
//   auth: {
//     user: AuthUser | null
//     setUser: (user: AuthUser | null) => void
//     reset: () => void
//   }
// }

// export const useAuthStore = create<AuthState>()((set) => {
//   // Rehydrate from cookie on page refresh
//   const cookieState = getCookie(USER_COOKIE)
//   const initUser: AuthUser | null = cookieState ? JSON.parse(cookieState) : null

//   return {
//     auth: {
//       user: initUser,
//       setUser: (user) =>
//         set((state) => {
//           if (user) {
//             setCookie(USER_COOKIE, JSON.stringify(user))
//           } else {
//             removeCookie(USER_COOKIE)
//           }
//           return { ...state, auth: { ...state.auth, user } }
//         }),
//       reset: () =>
//         set((state) => {
//           removeCookie(USER_COOKIE)
//           return { ...state, auth: { ...state.auth, user: null } }
//         }),
//     },
//   }
// })


import { create } from 'zustand'

const SESSION_KEY = 'app_user'

export interface AuthUser {
  userId: number
  firstName: string
  lastName: string
  email: string
  roleId: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    isHydrated: boolean
    setUser: (user: AuthUser | null) => void
    setHydrated: (val: boolean) => void
    reset: () => void
  }
}

function loadUserFromSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  // Rehydrate from sessionStorage on page refresh
  const savedUser = loadUserFromSession()

  return {
    auth: {
      user: savedUser,
      isHydrated: true,        // ← already hydrated from sessionStorage, no API needed
      setUser: (user) =>
        set((state) => {
          if (user) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
          } else {
            sessionStorage.removeItem(SESSION_KEY)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      setHydrated: (val) =>
        set((state) => ({ ...state, auth: { ...state.auth, isHydrated: val } })),
      reset: () =>
        set((state) => {
          sessionStorage.removeItem(SESSION_KEY)
          return { ...state, auth: { ...state.auth, user: null, isHydrated: true } }
        }),
    },
  }
})