import CreateProjectPage from '@/features/project-management/components/create-project'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tasks/create/')({
  component:  CreateProjectPage,
})
