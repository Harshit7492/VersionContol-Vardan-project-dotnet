import { createFileRoute } from '@tanstack/react-router'
import EditProjectPage from '@/features/project-management/components/edit-project'

export const Route = createFileRoute('/_authenticated/tasks/edit/$projectId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()

  return <EditProjectPage projectId={projectId} />
}
