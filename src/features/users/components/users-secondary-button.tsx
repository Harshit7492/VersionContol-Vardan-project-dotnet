'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { UsersRoleDialog } from './user-role-dialog'

export function UsersSecondaryButtons() {
  const [openAddDialog, setOpenAddDialog] = useState(false)

  return (
    <>
      <div className='flex gap-2'>
        <Button
          type="button"
          className='space-x-1 bg-secondary text-secondary-foreground hover:bg-secondary/80'
          onClick={() => setOpenAddDialog(true)}
        >
          <span>Add Role</span>
          <UserPlus size={18} />
        </Button>
      </div>                        

      {openAddDialog && (
        <UsersRoleDialog
          open={openAddDialog}
          onOpenChange={setOpenAddDialog}
          type="Add"
          initialData={null}
        />
      )}
    </>
  )
}