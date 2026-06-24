// src/router.tsx

import { createBrowserRouter } from 'react-router-dom'

// ── Layouts ──────────────────────────────────────────────
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import UserSideLayout from './components/layout/userside-layout'

// ── Auth ─────────────────────────────────────────────────
import { SignIn } from '@/features/auth/sign-in'

// ── Error Pages ───────────────────────────────────────────
import { ForbiddenError } from '@/features/errors/forbidden'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { UnauthorisedError } from '@/features/errors/unauthorized-error'

// ── Admin Features ────────────────────────────────────────
import { Apps } from '@/features/apps'
import { Chats } from '@/features/chats'
import { Dashboard } from '@/features/dashboard'
import { Tasks } from '@/features/project-management'
import { CreateProjectPage } from '@/features/project-management/components/create-project'
import EditProjectPage from '@/features/project-management/components/edit-project'
import { Settings } from '@/features/settings'
import { SettingsAccount } from '@/features/settings/account'
import { SettingsAppearance } from '@/features/settings/appearance'
import { SettingsDisplay } from '@/features/settings/display'
import { SettingsNotifications } from '@/features/settings/notifications'
import { Users } from '@/features/users'
import UserRoles from '@/features/users/user-roles'

// ── Admin Activity Management ─────────────────────────────
import ActivityDetailsHome from './features/activity-management/ActivityDetailsHome'
import ActivityHome from './features/activity-management/ActivityHome'
import ActivityFormHome from './features/activity-management/ActivityFormHome'
import ViewActivityDetailsHome from './features/activity-management/ViewActivityDetailsHome'
import ViewDetailedActivityByAdmin from './features/activity-management/components/ViewDetailedActivityByAdmin'

// ── User Side Features ────────────────────────────────────
import UserDashboard from './features/user-side-dashboard/components/UserDashboard'
import UserSideProjectManagement from './features/user-side-dashboard'
import ActivitiesManagement from './features/user-side-dashboard/components/Activities/ActivitiesManagement'
import CreateActivity from './features/user-side-dashboard/components/Activities/CreateActivity'
import EditActivity from './features/user-side-dashboard/components/Activities/EditActivity'
import ViewActivity from './features/user-side-dashboard/components/Activities/ViewActivity'
import RouteGuard from './features/auth/route-gaurd'
export const router = createBrowserRouter([
  // ── Public routes (no guard) ────────────────────────────
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/login',
    element: <SignIn />,
  },

  // ── Admin Protected routes ──────────────────────────────
  {
    path: '/',
    element: (
      <RouteGuard>
        <AuthenticatedLayout />
      </RouteGuard>
    ),
    errorElement: <GeneralError />,
    children: [

      // ── Dashboard ───────────────────────────────────────
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      // ── Tasks / Projects ────────────────────────────────
      {
        path: 'tasks',
        children: [
          {
            index: true,
            element: <Tasks />,
          },
          {
            path: 'create',
            element: <CreateProjectPage />,
          },
          {
            path: 'edit/:projectId',
            element: <EditProjectPage />,
          },
        ],
      },

      // ── Users ───────────────────────────────────────────
      {
        path: 'users',
        children: [
          {
            index: true,
            element: <Users />,
          },
          {
            path: 'roles',
            element: <UserRoles />,
          },
        ],
      },

      // ── Admin Activity Management ────────────────────────
      {
        path: 'activity',
        children: [
          {
            index: true,
            element: <ActivityHome />,
          },
          {
            path: 'create',
            element: <ActivityFormHome />,
          },
          {
            path: 'edit/:id',
            element: <ActivityFormHome />,
          },
          {
            path: 'activity-details',
            element: <ActivityDetailsHome />,
          },
          {
            path: 'view-activity-details/:id',
            element: <ViewActivityDetailsHome />,
          },
          {
            path: 'view-detailed-activity-by-admin/:id',
            element: <ViewDetailedActivityByAdmin />,
          },
        ],
      },

      // ── Settings ────────────────────────────────────────
      {
        path: 'settings',
        element: <Settings />,
        children: [
          {
            index: true,
            element: <SettingsAccount />,
          },
          {
            path: 'account',
            element: <SettingsAccount />,
          },
          {
            path: 'appearance',
            element: <SettingsAppearance />,
          },
          {
            path: 'display',
            element: <SettingsDisplay />,
          },
          {
            path: 'notifications',
            element: <SettingsNotifications />,
          },
        ],
      },

      // ── Misc Admin ──────────────────────────────────────
      {
        path: 'chats',
        element: <Chats />,
      },
      {
        path: 'apps',
        element: <Apps />,
      },
    ],
  },

  // ── User Side Protected routes (own layout + own SidebarProvider) ──
  {
    path: '/user-side',
    element: (
      <RouteGuard>
        <UserSideLayout />
      </RouteGuard>
    ),
    errorElement: <GeneralError />,
    children: [
      {
        index: true,
        element: <UserDashboard />,
      },
      {
        path: 'project',
        element: <UserSideProjectManagement />,
      },
      {
        path: 'activity',
        children: [
          {
            index: true,
            element: <ActivitiesManagement />,
          },
          {
            path: 'user/create',
            element: <CreateActivity />,
          },
          {
            path: 'user/edit/:id',
            element: <EditActivity />,
          },
          {
            path: 'user/view/:id',
            element: <ViewActivity />,
          },
        ],
      },
    ],
  },

  // ── Error pages (public, no guard) ──────────────────────
  {
    path: '/401',
    element: <UnauthorisedError />,
  },
  {
    path: '/403',
    element: <ForbiddenError />,
  },
  {
    path: '/404',
    element: <NotFoundError />,
  },
  {
    path: '/500',
    element: <GeneralError />,
  },
  {
    path: '/503',
    element: <GeneralError />,
  },
  {
    path: '*',
    element: <NotFoundError />,
  },
])