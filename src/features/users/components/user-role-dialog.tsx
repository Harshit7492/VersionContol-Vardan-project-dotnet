'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { userService } from '@/lib/api/userService'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'Add' | 'Edit'
  initialData?: any
  onSuccess?: () => Promise<void> | void
}

export function UsersRoleDialog({ open, onOpenChange, type, initialData, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const isEditMode = type === 'Edit'

  const [formData, setFormData] = useState({
    RoleName: '',
    RoleStatus: 1,
    Permission: {
      Addpermission: 0,
      Editpermission: 0,
      Viewpermission: 0,
    },
  })

  useEffect(() => {
    if (open && isEditMode && initialData) {
      setFormData({
        RoleName: initialData.RoleName || '',
        RoleStatus: initialData.RoleStatus ?? 1,
        Permission: {
          Addpermission: initialData.Permission?.Addpermission ?? 0,
          Editpermission: initialData.Permission?.Editpermission ?? 0,
          Viewpermission: initialData.Permission?.Viewpermission ?? 0,
        },
      })
    } else if (!open) {
      resetForm()
    }
  }, [open, initialData, isEditMode])

  const resetForm = () => {
    setFormData({
      RoleName: '',
      RoleStatus: 1,
      Permission: {
        Addpermission: 0,
        Editpermission: 0,
        Viewpermission: 0,
      },
    })
  }

  const handlePermissionChange = (
    key: keyof typeof formData.Permission,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      Permission: {
        ...prev.Permission,
        [key]: value ? 1 : 0,
      },
    }))
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!formData.RoleName.trim()) {
      toast.error('Role name is required')
      return
    }

    const payload = {
      Id: isEditMode ? initialData.Id : 0,
      RoleName: formData.RoleName,
      RoleStatus: formData.RoleStatus,
      Permission: {
        PermissionId: isEditMode ? (initialData.Permission?.PermissionId ?? 0) : 0,
        RoleId: isEditMode ? initialData.Id : 0,
        Addpermission: formData.Permission.Addpermission,
        Editpermission: formData.Permission.Editpermission,
        Viewpermission: formData.Permission.Viewpermission,
      },
      CreatedByUserId: parseInt(localStorage.getItem('current_user_id') || '2'),
    }

    try {
      setLoading(true)

      if (isEditMode) {
        await userService.updateUserRole(payload)
        toast.success('Role updated successfully')
      } else {
        await userService.addUserRole(payload)
        toast.success('Role created successfully')
      }

      onOpenChange(false)
      resetForm()
      
      if (onSuccess) {
        await onSuccess()
      }
      
    } catch (error: any) {
      console.error('❌ API Error:', error)
      toast.error(
        error?.response?.data?.message || error?.message || 'Failed to save role'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) resetForm()
        onOpenChange(value)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Role' : 'Add Role'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modify the current configuration options and permissions' 
              : 'Create a new role with custom access permissions'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Role Name</Label>
            <Input
              value={formData.RoleName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  RoleName: e.target.value,
                }))
              }
              placeholder="Admin, Manager..."
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label>Role Active Status</Label>
              <p className="text-xs text-muted-foreground">Toggle to enable or disable this role entirely</p>
            </div>
            <Switch
              checked={formData.RoleStatus === 1}
              onCheckedChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  RoleStatus: val ? 1 : 0,
                }))
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Permissions Management</Label>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm">Add Permission</span>
              <Switch
                checked={formData.Permission.Addpermission === 1}
                onCheckedChange={(v) => handlePermissionChange('Addpermission', v)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm">Edit Permission</span>
              <Switch
                checked={formData.Permission.Editpermission === 1}
                onCheckedChange={(v) => handlePermissionChange('Editpermission', v)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between pb-1">
              <span className="text-sm">View Permission</span>
              <Switch
                checked={formData.Permission.Viewpermission === 1}
                onCheckedChange={(v) => handlePermissionChange('Viewpermission', v)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Configuration...
              </>
            ) : isEditMode ? (
              'Save Changes'
            ) : (
              'Create Role'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}