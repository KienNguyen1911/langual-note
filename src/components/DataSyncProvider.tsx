'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { syncLocalDataWithUser } from '@/lib/localStorage';

export default function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    // Only sync when user logs in and hasn't synced yet
    if (status === 'authenticated' && session?.user?.id && !hasSynced) {
      const syncData = async () => {
        try {
          // Add null check to satisfy TypeScript
          if (session?.user?.id) {
            await syncLocalDataWithUser(session.user.id);
            setHasSynced(true);
            console.log('Successfully synced local data with user account');
          }
        } catch (error) {
          console.error('Error syncing data:', error);
        }
      };

      syncData();
    }
  }, [status, session, hasSynced]);

  // Reset sync status when user logs out
  useEffect(() => {
    if (status === 'unauthenticated') {
      setHasSynced(false);
    }
  }, [status]);

  return <>{children}</>;
}
