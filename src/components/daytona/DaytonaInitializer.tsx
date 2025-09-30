'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ensureDaytonaInitialized } from '@/lib/daytona/auto-init';

export function DaytonaInitializer() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Initialize Daytona when user is authenticated
    if (!loading && user) {
      console.log('🔧 Initializing Daytona globally for authenticated user...');
      ensureDaytonaInitialized().then(success => {
        if (success) {
          console.log('✅ Daytona ready globally');
        } else {
          console.error('❌ Failed to initialize Daytona globally');
        }
      });
    }
  }, [user, loading]);

  // This component doesn't render anything
  return null;
}
