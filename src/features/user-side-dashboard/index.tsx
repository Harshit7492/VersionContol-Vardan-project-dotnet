import { Header } from '@/components/layout/header'
import UserDashboardPage from './components/user-dashboard'
import { ProfileDropdown } from '@/components/profile-dropdown'

const UserSideProjectManagement= () => {
  return(
<div className="">
     <Header fixed>
  <div className="flex items-center justify-between w-full">
    <h1 className="text-base font-semibold text-foreground">
     Project Management
    </h1>

    <ProfileDropdown />
  </div>
</Header>
  <UserDashboardPage/>
</div>
  ) 
}

export default UserSideProjectManagement