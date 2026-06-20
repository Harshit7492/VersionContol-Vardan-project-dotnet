import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: any | null
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>
  refreshKey: number
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<any | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <UsersContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshKey,
        setRefreshKey,
      }}
    >
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
