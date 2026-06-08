// import { Link } from '@tanstack/react-router'
// import useDialogState from '@/hooks/use-dialog-state'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Button } from '@/components/ui/button'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuShortcut,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { SignOutDialog } from '@/components/sign-out-dialog'

// export function ProfileDropdown() {
//   const [open, setOpen] = useDialogState()

//   return (
//     <>
//       <DropdownMenu modal={false}>
//         <DropdownMenuTrigger asChild>
//           <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
//             <Avatar className='h-8 w-8'>
//               <AvatarImage src='/avatars/01.png' alt='@shadcn' />
//               <AvatarFallback>SN</AvatarFallback>
//             </Avatar>
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent className='w-56' align='end' forceMount>
//           <DropdownMenuLabel className='font-normal'>
//             <div className='flex flex-col gap-1.5'>
//               <p className='text-sm leading-none font-medium'>satnaing</p>
//               <p className='text-xs leading-none text-muted-foreground'>
//                 satnaingdev@gmail.com
//               </p>
//             </div>
//           </DropdownMenuLabel>
//           <DropdownMenuSeparator />
//           <DropdownMenuGroup>
//             <DropdownMenuItem asChild>
//               <Link to='/settings'>
//                 Profile
//                 <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
//               </Link>
//             </DropdownMenuItem>
//             <DropdownMenuItem asChild>
//               <Link to='/settings'>
//                 Billing
//                 <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
//               </Link>
//             </DropdownMenuItem>
//             <DropdownMenuItem asChild>
//               <Link to='/settings'>
//                 Settings
//                 <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
//               </Link>
//             </DropdownMenuItem>
//             <DropdownMenuItem>New Team</DropdownMenuItem>
//           </DropdownMenuGroup>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
//             Sign out
//             <DropdownMenuShortcut className='text-current'>
//               ⇧⌘Q
//             </DropdownMenuShortcut>
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>

//       <SignOutDialog open={!!open} onOpenChange={setOpen} />
//     </>
//   )
// }


import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { useUserProfile } from '@/lib/api/userProfile'   // ← Import the hook

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()

  // Use the same cached data from TanStack Query
const { data: userProfile, isLoading, error } = useUserProfile()
console.log('ProfileDropdown userProfile:', userProfile)
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage 
                src={userProfile?.avatar || '/avatars/01.png'} 
                alt={userProfile?.firstName || '@user'} 
              />
              <AvatarFallback>
                {userProfile?.FirstName?.slice(0, 2)?.toUpperCase() || 'SN'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1.5'>
              <p className='text-sm leading-none font-medium'>
                {userProfile?.firstName || 'User'}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {userProfile?.email || ''}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to='/settings'>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to='/settings'>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            variant='destructive' 
            onClick={() => setOpen(true)}
          >
            Sign out
            <DropdownMenuShortcut className='text-current'>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}