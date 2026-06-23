
// import { ReactNode } from 'react'

// type Props = { children: ReactNode }

// // User is rehydrated directly from cookie into Zustand store on init.
// // No async API call needed on refresh — ProfileProvider just renders children.
// export function ProfileProvider({ children }: Props) {
//   return <>{children}</>
// }
import { ReactNode } from 'react'

type Props = { children: ReactNode }

// User is rehydrated from sessionStorage directly into Zustand on store init.
// No API call needed.
export function ProfileProvider({ children }: Props) {
  return <>{children}</>
}