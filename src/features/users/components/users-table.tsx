'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { userService } from '@/lib/api/userService'
import { useUsers } from './users-provider'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Switch } from '@/components/ui/switch'

interface User {
  UserID: number
  FirstName: string | null
  LastName: string | null
  strEmail: string | null
  Role: string | null
  IsActive: number
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null)

  const { open, refreshKey, setOpen, setCurrentRow } = useUsers()

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers()

      setUsers(
        (response.response || []).map((user: any) => ({
          ...user,
          IsActive: user.IsActive ?? 0,
        }))
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch users')
    }
  }

  useEffect(() => {
    if (open === null) {
      fetchUsers()
    }
  }, [open, refreshKey])

  const handleEdit = async (user: User) => {
    try {
      const response = await userService.getUsersById(user.UserID)

      const userData = response.response[0]

      setCurrentRow({
        id: userData.UserID.toString(),
        firstName: userData.FirstName || '',
        lastName: userData.LastName || '',
        email: userData.strEmail || '',
        phoneNumber: '',
        role:
          (userData.Role?.toLowerCase() || 'user') as
            | 'superadmin'
            | 'admin'
            | 'user',
        status: userData.IsActive ? 'active' : 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      setOpen('edit')
    } catch (error) {
      console.error(error)
      toast.error('Failed to load user details')
    }
  }

  const handleToggle = async (user: User, checked: boolean) => {
    try {
      setLoadingUserId(user.UserID)

      const payload = {
        UserID: user.UserID,
        FirstName: user.FirstName,
        LastName: user.LastName,
        strEmail: user.strEmail,
        Role: user.Role,
        IsActive: checked ? 1 : 0,
        loginid: 0,
        AllowEdit: 1,
      }

      await userService.update(payload)

      setUsers((prev) =>
        prev.map((u) =>
          u.UserID === user.UserID
            ? {
                ...u,
                IsActive: checked ? 1 : 0,
              }
            : u
        )
      )

      toast.success(
        `User ${checked ? 'activated' : 'deactivated'} successfully`
      )
    } catch (error) {
      console.error(error)
      toast.error('Failed to update user status')
    } finally {
      setLoadingUserId(null)
    }
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            {/* <TableHead>Role</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.UserID}>
                <TableCell>{user.UserID}</TableCell>

                <TableCell>
                  {user.FirstName} {user.LastName}
                </TableCell>

                <TableCell>{user.strEmail ?? '-'}</TableCell>

                {/* <TableCell>{user.Role ?? '-'}</TableCell> */}

                <TableCell>
                  {user.IsActive === 1 ? 'Active' : 'Inactive'}
                </TableCell>

                <TableCell>
                  <div className='flex items-center gap-3'>
                    <button
                      className='rounded border px-3 py-1 text-sm hover:bg-muted'
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>

                    <Switch
                      checked={user.IsActive === 1}
                      onCheckedChange={(checked) =>
                        handleToggle(user, checked)
                      }
                      disabled={loadingUserId === user.UserID}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className='h-24 text-center'
              >
                No Users Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}