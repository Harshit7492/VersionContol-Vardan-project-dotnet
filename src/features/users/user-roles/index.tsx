import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { UsersProvider } from '../components/users-provider'
import { UsersSecondaryButtons } from '../components/users-secondary-button'
import { UsersDialogs } from '../components/users-dialogs'
import { UsersRoleTable } from './user-role-table'
import { PermissionWrapper } from '@/features/auth/auth-permission-wrapper'

export function UsersRole() {
  return (
    <UsersProvider>
      <Header fixed>
        <div className='me-auto'>User Management</div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User Roles List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>

          {/* No props needed - Automatically checks all permissions */}
          <PermissionWrapper>
            <div className="flex gap-2">
              <UsersSecondaryButtons />
            </div>
          </PermissionWrapper>
        </div>

        <UsersRoleTable />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}

export default UsersRole