import UserDashboardPage from './components/user-dashboard'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
const UserDashboard= () => {
  return (
    <div>
 <Header fixed>
        {/* <Search className='me-auto' /> */}

       < div className='me-auto'>
       Dashboard
       </div>
        {/* <ThemeSwitch /> */}
        {/* <ConfigDrawer /> */}
        <ProfileDropdown />
      </Header>
            <UserDashboardPage/>
    </div>
  )
}

export default UserDashboard