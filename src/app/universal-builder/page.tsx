'use client';

import { ChatLayout } from '@/components/chat/ChatLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ensureDaytonaInitialized } from '@/lib/daytona/auto-init';

export default function UniversalBuilderPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const promptFromUrl = searchParams.get('prompt');

  console.log('[UNIVERSAL BUILDER] Render - user:', user ? `${user.email}` : 'null', 'loading:', loading);

  useEffect(() => {
    console.log('[UNIVERSAL BUILDER] Auth state changed - user:', !!user, 'loading:', loading);
    if (!loading && !user) {
      console.log('[UNIVERSAL BUILDER] No user and not loading, redirecting to auth');
      redirect('/auth');
    }
  }, [user, loading]);

  // Initialize Daytona when component mounts
  useEffect(() => {
    if (user) {
      console.log('🔧 Initializing Daytona for Universal Builder...');
      ensureDaytonaInitialized().then(success => {
        if (success) {
          console.log('✅ Daytona ready for Universal Builder');
        } else {
          console.error('❌ Failed to initialize Daytona');
        }
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground mt-2">If this takes too long, try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen">
      <ChatLayout initialPrompt={promptFromUrl || "Build me a beautiful and modern web application"} />
    </div>
  );
}
