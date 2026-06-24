import ActivityForm from './components/ActivityForm'
import { Header } from '@/components/layout/header'

function ActivityFormHome() {
  return (
    <div className="min-h-screen bg-background">
      <Header fixed>
        <div>
          <h1 className="text-base font-semibold text-foreground">Activity Form</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Create or edit an activity</p>
        </div>
      </Header>
      <ActivityForm />
    </div>
  )
}

export default ActivityFormHome
