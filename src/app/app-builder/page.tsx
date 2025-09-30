'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function AppBuilderPage() {
  // Redirect to universal-builder since this is now the only option
  useEffect(() => {
    redirect('/universal-builder');
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
