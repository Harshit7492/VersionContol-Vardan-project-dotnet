'use client'

import { useEffect, useState, ReactNode } from 'react';
import { userService } from '@/lib/api/userService';

type Props = {
  children: ReactNode;
};

export function ProfileProvider({ children }: Props) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncUserSession = async () => {
      try {
        // 1. Fetch current logged-in user identification state
        // For testing, we read a basic id. Replace this with your actual JWT/auth token payload parsing!
        const targetUserId = localStorage.getItem('current_user_id');

        if (!targetUserId) {
          // If no user tracking session exists, boot them or stop loading
          setIsReady(true);
          return;
        }

        // 2. Query your freshly created .NET Controller API
        const apiData = await userService.getUserProfile(Number(targetUserId));

        if (apiData && apiData.issuccess && apiData.response) {
          const userProfileData = apiData.response; // This maps directly to your C# Users model
          const roleData = userProfileData.userRole;
          const permissionData = roleData?.permission;

          // 3. Flatten the session configuration data for effortless frontend reading
          const currentSessionSnapshot = {
            userId: userProfileData.userID,
            email: userProfileData.strEmail,
            fullName: `${userProfileData.firstName} ${userProfileData.lastName}`,
            roleName: roleData?.roleName ?? 'Guest',
            permissions: {
              add: permissionData?.addpermission === 1,
              edit: permissionData?.editpermission === 1,
              view: permissionData?.viewpermission === 1
            }
          };

          // 4. Update the cached session storage string
          sessionStorage.setItem('active_user_session', JSON.stringify(currentSessionSnapshot));
        }
      } catch (error) {
        console.error("Critical: Database security handshake verification failed:", error);
        // Wipe local session data if authentication is completely broken/revoked
        sessionStorage.removeItem('active_user_session');
      } finally {
        // 5. Release layout access gate
        setIsReady(true);
      }
    };

    syncUserSession();
  }, []);

  // Block the UI from rendering layout elements for a split second on reload 
  // until the API responds with permissions. This prevents flickering.
  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}