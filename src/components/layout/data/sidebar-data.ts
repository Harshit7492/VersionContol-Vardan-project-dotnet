import {
  LayoutDashboard,
  // Monitor,
  ListTodo,
  HelpCircle,
  // Bell,
  // Palette,
  Settings,
  // Wrench,
  UserCog,
  Users,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'harshit',
    email: 'harshit@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'WebApp Admin',
      logo: Command,
      plan: 'Developer',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Projects Management',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'User Management',
          icon: Settings,
          items: [
            {
              title: 'All Users',
              url: '/users',
              icon: Users,
            },
            {
              title: 'User Roles',
              url: '/users/roles',
              icon: UserCog,
            },
            // {
            //   title: 'User Details List',
            //   url: '/users/details',
            //   icon: FileText,
            // },
          ],
        },
        {
          title: 'Activity Management',
          icon: Settings,
          items: [
            {
              title: 'All Activity',
              url: '/activity',
              icon: Users,
            },
            {
              title: 'Activity Details',
              url: '/activity/activity-details',
              icon: UserCog,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        // {
        //   title: 'Settings',
        //   icon: Settings,
        //   items: [
        //     {
        //       title: 'Profile',
        //       url: '/settings',
        //       icon: UserCog,
        //     },
        //     {
        //       title: 'Account',
        //       url: '/settings/account',
        //       icon: Wrench,
        //     },
        //     {
        //       title: 'Appearance',
        //       url: '/settings/appearance',
        //       icon: Palette,
        //     },
        //     {
        //       title: 'Notifications',
        //       url: '/settings/notifications',
        //       icon: Bell,
        //     },
        //     {
        //       title: 'Display',
        //       url: '/settings/display',
        //       icon: Monitor,
        //     },
        //   ],
        // },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
