// src/features/auth/auth-permission-wrapper.tsx
import { ReactNode } from 'react'
import { useUserProfile } from '@/lib/api/userProfile'

type PermissionWrapperProps = {
  children: ReactNode
  // Optional: You can still pass specific requirements if needed in future
  requireAll?: boolean
}

export function PermissionWrapper({ children }: PermissionWrapperProps) {
  const { data: userProfile, isLoading } = useUserProfile()

  if (isLoading) return null
  if (!userProfile) return null

  // Extract permissions based on your actual API structure
  const permission = userProfile.UserRole?.Permission

  const hasAdd = permission?.Addpermission === 1
  const hasEdit = permission?.Editpermission === 1
  const hasView = permission?.Viewpermission === 1

  // Show only if ALL permissions are 1
  const hasAllPermissions = hasAdd && hasEdit && hasView

  console.log('Permission Check →', {
    hasAdd,
    hasEdit,
    hasView,
    hasAllPermissions,
  })

  return hasAllPermissions ? <>{children}</> : null
}
