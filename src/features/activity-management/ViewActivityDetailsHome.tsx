import ViewActivityDetails from './components/ViewActivityDetails'
import { Header } from '@/components/layout/header'

function ViewActivityDetailsHome() {
  return (
    <div className="min-h-screen bg-background">
      <Header fixed>
        <div>
          <h1 className="text-base font-semibold text-foreground">View Activity Details</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">Detailed activity information</p>
        </div>
      </Header>
      <ViewActivityDetails />
    </div>
  )
}

export default ViewActivityDetailsHome
