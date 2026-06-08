import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

type TasksContextType = {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: any | null
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>
  projects: any[]
  setProjects: React.Dispatch<React.SetStateAction<any[]>>
}

const TasksContext = React.createContext<TasksContextType | null>(null)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<any | null>(null)
  const [projects, setProjects] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('projects')
      if (raw) {
        return JSON.parse(raw)
      }

      return [
        {
          name: 'IPIS',
          description: 'IPIS project with versions and release files.',
          versions: [
            {
              name: 'v1',
              files: [
                { fileName: 'ipis-setup.exe', isExe: true },
                { fileName: 'README.md', isExe: false },
              ],
            },
            {
              name: 'v2',
              files: [
                { fileName: 'ipis-update.zip', isExe: false },
              ],
            },
          ],
        },
        {
          name: 'IPS',
          description: 'IPS project showing version control and file metadata.',
          versions: [
            {
              name: 'v1',
              files: [
                { fileName: 'ips-installer.exe', isExe: true },
              ],
            },
          ],
        },
      ]
    } catch (e) {
      return []
    }
  })

  return (
    <TasksContext value={{ open, setOpen, currentRow, setCurrentRow, projects, setProjects }}>
      {children}
    </TasksContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)

  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return tasksContext
}
