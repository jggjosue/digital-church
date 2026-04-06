'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';

const AUTH_ROUTE = /^\/(sign-in|sign-up)(\/|$)/;

export function AuthenticatedChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname ? AUTH_ROUTE.test(pathname) : false;
  const isLandingHome = pathname === '/' || pathname === '';

  if (isAuthPage || isLandingHome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh w-full">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
