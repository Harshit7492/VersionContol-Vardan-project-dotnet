import { ProfileDropdown } from '@/components/profile-dropdown'
import ActivityDetailsManagement from './components/ActivityDetailsManagement'
import { Header } from '@/components/layout/header'

function Activity() {
  return (
    <div className="min-h-screen bg-background">
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">
            Activities
          </h1>

          <ProfileDropdown />
        </div>
      </Header>
      <ActivityDetailsManagement />
    </div>
  )
}

export default Activity
