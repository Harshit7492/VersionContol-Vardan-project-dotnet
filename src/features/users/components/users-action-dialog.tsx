// 'use client'

// import { useState, useEffect } from 'react'
// import { toast } from 'sonner'
// import { Loader2 } from 'lucide-react'

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { PasswordInput } from '@/components/password-input'
// import { Label } from '@/components/ui/label'
// import { userService } from '@/lib/api/userService'
// import { useUsers } from './users-provider'
// import { type User } from '../data/schema'

// type UsersActionDialogProps = {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   currentRow?: User | null
// }

// export function UsersActionDialog({
//   open,
//   onOpenChange,
//   currentRow,
// }: UsersActionDialogProps) {
//   const isEdit = !!currentRow
//   const [loading, setLoading] = useState(false)
//   const [fetchingData, setFetchingData] = useState(false)
//   const [roles, setRoles] = useState<string[]>([])
//   const { setRefreshKey } = useUsers()

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     strEmail: '',
//     role: '',
//     password: '',
//   })

//  useEffect(() => {
//   const fetchRoles = async () => {
//     try {
//       const userRoles = await userService.getUserRoles();
//       setRoles(userRoles.response || []); // Assuming the API returns { response: string[] }
//       console.log("Fetched roles:", roles);
//     } catch (error) {
//       console.error("Failed to fetch roles", error);
//     }
//   };
  
//   fetchRoles();
// }, []);

  

//   useEffect(() => {
     

     

//     if (isEdit && currentRow) {
//       setFormData({
//         firstName: currentRow.firstName || '',
//         lastName: currentRow.lastName || '',
//         strEmail: currentRow.email || '',
//         role: currentRow.role || '',
//         password: '',
//       })
//     } else {
//       setFormData({
//         firstName: '',
//         lastName: '',
//         strEmail : '',
//         role: '',
//         password: '',
//       })
//     }
//   }, [isEdit, currentRow, open])

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }))
//   }

//   const handleSubmit = async () => {
//     if (
//       !formData.firstName ||
//       !formData.lastName ||
//       !formData.strEmail ||
//       !formData.role
//     ) {
//       toast.error('All fields are required')
//       return
//     }

//     if (!isEdit && !formData.password) {
//       toast.error('Password is required for new users')
//       return
//     }

//     try {
//       setLoading(true)

//       const payload = {
//         UserID: isEdit ? parseInt(currentRow?.id || '0') : 0,
//         FirstName: formData.firstName,
//         LastName: formData.lastName,
//         strEmail: formData.strEmail,
//         ...(formData.password && { Password: formData.password }),
//         Role: formData.role,
//       }

//       if (isEdit) {
//         await userService.update(payload).then(async () => {
//           await userService.getUsers()
//         })
//         toast.success('User updated successfully')
//       } else {
//         await userService.add(payload).then(async () => {
//           await userService.getUsers()
//         })
//         toast.success('User created successfully')
//       }

//       setRefreshKey((prev) => prev + 1)

//       setFormData({
//         firstName: '',
//         lastName: '',
//         strEmail: '',
//         role: '',
//         password: '',
//       })

//       onOpenChange(false)
//     } catch (error: any) {
//       console.error('Error saving user:', error)
//       toast.error(error?.response?.data?.message || 'Error saving user')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className='sm:max-w-md'>
//         <DialogHeader>
//           <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
//           <DialogDescription>
//             {isEdit ? 'Update user details.' : 'Create a new user account.'}
//           </DialogDescription>
//         </DialogHeader>

//         <div className='space-y-4'>
//           <div>
//             <Label>First Name</Label>
//             <Input
//               name='firstName'
//               value={formData.firstName}
//               onChange={handleChange}
//               placeholder='John'
//               disabled={fetchingData}
//             />
//           </div>

//           <div>
//             <Label>Last Name</Label>
//             <Input
//               name='lastName'
//               value={formData.lastName}
//               onChange={handleChange}
//               placeholder='Doe'
//               disabled={fetchingData}
//             />
//           </div>

//           <div>
//             <Label>Email</Label>
//             <Input
//               type='email'
//               name='strEmail'
//               value={formData.strEmail}
//               onChange={handleChange}
//               placeholder='john@example.com'
//               disabled={fetchingData}
//             />
//           </div>

//           <div>
//             <Label>Role</Label>
//             <select
//               name='role'
//               value={formData.role}
//               onChange={handleChange}
//               className='w-full border rounded-md h-10 px-3'
//               disabled={fetchingData}
//             >
//               <option value=''>Select Role</option>
//               <option value='Admin'>Admin</option>
//               <option value='User'>User</option>
//               <option value='Manager'>Manager</option>
//             </select>
//           </div>

//           <div>
//             <Label>
//               Password {isEdit && '(Leave blank to keep existing)'}
//             </Label>
//             <PasswordInput
//               name='password'
//               value={formData.password}
//               onChange={handleChange}
//               placeholder={isEdit ? 'Leave blank to keep existing' : 'Enter Password'}
//               disabled={fetchingData}
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             onClick={handleSubmit}
//             disabled={loading || fetchingData}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className='mr-2 h-4 w-4 animate-spin' />
//                 Saving...
//               </>
//             ) : (
//               `${isEdit ? 'Update' : 'Save'} User`
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }



'use client'

import { useState, useEffect } from 'react'
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
import { PasswordInput } from '@/components/password-input'
import { Label } from '@/components/ui/label'
import { userService } from '@/lib/api/userService'
import { useUsers } from './users-provider'
import { type User } from '../data/schema'

// Define the interface matching your API response structure
interface RoleItem {
  Id: number
  RoleName: string
  RoleStatus: number
  Permission: Record<string, any>
}

type UsersActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User | null
}

export function UsersActionDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersActionDialogProps) {
  const isEdit = !!currentRow
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  // 1. Updated state to accept an array of Role objects
  const [roles, setRoles] = useState<RoleItem[]>([])
  const { setRefreshKey } = useUsers()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    strEmail: '',
    role: '', // Stores the string version of RoleId (e.g. "3")
    password: '',
  })

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setFetchingData(true)
        const responseData = await userService.getUserRoles()
        // 2. Extracted the actual response array safely
        setRoles(responseData?.response || [])
      } catch (error) {
        console.error("Failed to fetch roles", error)
        toast.error("Failed to load user roles")
      } finally {
        setFetchingData(false)
      }
    }
    
    if (open) {
      fetchRoles()
    }
  }, [open])

  useEffect(() => {
    if (isEdit && currentRow) {
      setFormData({
        firstName: currentRow.firstName || '',
        lastName: currentRow.lastName || '',
        strEmail: currentRow.email || '',
        role: currentRow.role ? String(currentRow.role) : '', // Cast to string for element binding
        password: '',
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        strEmail : '',
        role: '',
        password: '',
      })
    }
  }, [isEdit, currentRow, open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.strEmail ||
      !formData.role
    ) {
      toast.error('All fields are required')
      return
    }

    if (!isEdit && !formData.password) {
      toast.error('Password is required for new users')
      return
    }

    try {
      setLoading(true)

      // 3. Formatted payload converts formData.role back into an integer ID
      const payload = {
        UserID: isEdit ? parseInt(currentRow?.id || '0') : 0,
        FirstName: formData.firstName,
        LastName: formData.lastName,
        strEmail: formData.strEmail,
        RoleId: parseInt(formData.role), // Sends numerical ID (e.g. 3)
        ...(formData.password && { Password: formData.password }),
      }

      if (isEdit) {
        await userService.update(payload)
        toast.success('User updated successfully')
      } else {
        await userService.add(payload)
        toast.success('User created successfully')
      }

      // Refresh list to make updates visible
      await userService.getUsers()
      setRefreshKey((prev) => prev + 1)

      setFormData({
        firstName: '',
        lastName: '',
        strEmail: '',
        role: '',
        password: '',
      })

      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error?.response?.data?.message || 'Error saving user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user details.' : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <Label>First Name</Label>
            <Input
              name='firstName'
              value={formData.firstName}
              onChange={handleChange}
              placeholder='John'
              disabled={fetchingData}
            />
          </div>

          <div>
            <Label>Last Name</Label>
            <Input
              name='lastName'
              value={formData.lastName}
              onChange={handleChange}
              placeholder='Doe'
              disabled={fetchingData}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type='email'
              name='strEmail'
              value={formData.strEmail}
              onChange={handleChange}
              placeholder='john@example.com'
              disabled={fetchingData}
            />
          </div>

          <div>
            <Label>Role</Label>
            {/* 4. Select dropdown maps dynamic values using ID as the bound key */}
            <select
              name='role'
              value={formData.role}
              onChange={handleChange}
              className='w-full border rounded-md h-10 px-3'
              disabled={fetchingData}
            >
              <option value=''>Select Role</option>
              {roles.map((role) => (
                <option key={role.Id} value={role.Id}>
                  {role.RoleName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>
              Password {isEdit && '(Leave blank to keep existing)'}
            </Label>
            <PasswordInput
              name='password'
              value={formData.password}
              onChange={handleChange}
              placeholder={isEdit ? 'Leave blank to keep existing' : 'Enter Password'}
              disabled={fetchingData}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || fetchingData}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              `${isEdit ? 'Update' : 'Save'} User`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
