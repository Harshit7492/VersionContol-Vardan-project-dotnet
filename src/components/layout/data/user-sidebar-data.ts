// components/user-sidebar/data/user-sidebar-data.ts
import {
  LayoutDashboard,
  Command,
  FolderKanban,
  ClipboardList,
  Plus,
  List,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const userSidebarData: SidebarData = {
  user: {
    name: 'harshit',
    email: 'harshit@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'User Workspace',
      logo: Command,
      plan: 'Standard',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/user-side',
          icon: LayoutDashboard,
        },
        {
          title: 'Project Management',
          url: '/user-side/project',
          icon: FolderKanban,
        },
        {
          title: 'Activity Management',
          url: '/user-side/activity',
          icon: ClipboardList,
        },
      ],
    },
    {
      title: 'Activity Management',
      items: [
        {
          title: 'All Activities',
          url: '/user-side/activity',
          icon: List,
        },
        {
          title: 'Create Activity',
          url: '/user-side/activity/user/create',
          icon: Plus,
        },
        // {
        //   title: 'Grid View',
        //   url: '/user-side/activity?view=grid',
        //   icon: Grid,
        // },
      ],
    },
    // {
    //   title: 'Other',
    //   items: [
    //     {
    //       title: 'Help & Support',
    //       url: '/user-side/help',
    //       icon: HelpCircle,
    //     },
    //     {
    //       title: 'Downloads',
    //       url: '/user-side/downloads',
    //       icon: Download,
    //     },
    //   ],
    // },
  ],
}