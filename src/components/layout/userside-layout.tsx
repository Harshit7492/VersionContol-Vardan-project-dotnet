// app/user-side/layout.tsx
'use client'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { LayoutProvider } from '@/context/layout-provider'
import { Outlet } from 'react-router-dom'
import { UserAppSidebar } from './user-app-sidebar'

export default function UserSideLayout() {
  return (
    <LayoutProvider>
      <SidebarProvider>
        <UserAppSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto bg-background">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </LayoutProvider>
  )
}