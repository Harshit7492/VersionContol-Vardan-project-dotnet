'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { userService } from '@/lib/api/userService'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { UsersRoleDialog } from '../components/user-role-dialog'

interface Permission {
  PermissionId: number
  RoleId: number
  Addpermission: number
  Editpermission: number
  Viewpermission: number
}

interface RoleItem {
  Id: number
  RoleName: string
  RoleStatus: number
  Permission: Permission | null
}

export function UsersRoleTable() {
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [loadingRoleId, setLoadingRoleId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await userService.getUserRoles({statusFilter: 0})
      const rolesData = response.response || response.data || response || []
      
      setRoles(
        rolesData.map((role: any) => ({
          Id: role.Id || role.id,
          RoleName: role.RoleName || role.roleName,
          RoleStatus: role.RoleStatus ?? role.roleStatus ?? 0,
          Permission: role.Permission || role.permission || null
        }))
      )
    } catch (error) {
      console.error('Fetch roles error:', error)
      toast.error('Failed to fetch roles')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleAdd = () => {
    setOpenAddDialog(true)
  }

  const handleEdit = (role: RoleItem) => {
    setSelectedRole(role)
    setOpenEditDialog(true)
  }

  const handleToggle = async (role: RoleItem, checked: boolean) => {
    try {
      setLoadingRoleId(role.Id)

      const payload = {
        Id: role.Id,
        RoleName: role.RoleName,
        RoleStatus: checked ? 1 : 0,
        Permission: role.Permission ? {
          PermissionId: role.Permission.PermissionId,
          RoleId: role.Permission.RoleId,
          Addpermission: role.Permission.Addpermission,
          Editpermission: role.Permission.Editpermission,
          Viewpermission: role.Permission.Viewpermission,
        } : null
      }

      await userService.updateUserRole(payload)

      setRoles((prev) =>
        prev.map((r) =>
          r.Id === role.Id ? { ...r, RoleStatus: checked ? 1 : 0 } : r
        )
      )

      toast.success(`Role ${checked ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Toggle role error:', error)
      toast.error('Failed to update role status')
      await fetchRoles()
    } finally {
      setLoadingRoleId(null)
    }
  }

  const formatPermissions = (permission: Permission | null) => {
    if (!permission) return 'None'
    const permList = []
    if (permission.Viewpermission === 1) permList.push('View')
    if (permission.Addpermission === 1) permList.push('Add')
    if (permission.Editpermission === 1) permList.push('Edit')
    return permList.length > 0 ? permList.join(', ') : 'No Access'
  }

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">User Roles</h2>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role ID</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Permissions Granted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <TableRow key={role.Id}>
                    <TableCell className='font-medium'>{role.Id}</TableCell>
                    <TableCell>{role.RoleName}</TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatPermissions(role.Permission)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          role.RoleStatus === 1
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {role.RoleStatus === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>

                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-3'>
                        <button
                          className='rounded border px-3 py-1 text-sm hover:bg-muted transition-colors'
                          onClick={() => handleEdit(role)}
                        >
                          Edit
                        </button>

                        <Switch
                          checked={role.RoleStatus === 1}
                          onCheckedChange={(checked) => handleToggle(role, checked)}
                          disabled={loadingRoleId === role.Id}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    No Roles Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Dialog */}
      <UsersRoleDialog
        open={openAddDialog}
        onOpenChange={(val) => {
          setOpenAddDialog(val)
          if (!val) setSelectedRole(null)
        }}
        type="Add"
        onSuccess={fetchRoles}
      />

      {/* Edit Dialog */}
      <UsersRoleDialog
        open={openEditDialog}
        onOpenChange={(val) => {
          setOpenEditDialog(val)
          if (!val) setSelectedRole(null)
        }}
        type="Edit"
        initialData={selectedRole}
        onSuccess={fetchRoles}
      />
    </>
  )
}