// app/user-side/layout.tsx
'use client'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { LayoutProvider } from '@/context/layout-provider'
import { Outlet } from 'react-router-dom'
import { UserAppSidebar } from './user-app-sidebar'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function UserSideLayout() {
  return (
    <LayoutProvider>
      <SidebarProvider>
        <UserAppSidebar />
        <SidebarInset>
          <header className="flex h-16 items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-semibold">User Dashboard</h1>
            <div className="ml-auto flex items-center">
              <ProfileDropdown />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-background">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}