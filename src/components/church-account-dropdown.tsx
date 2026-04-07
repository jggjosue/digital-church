'use client';

import * as React from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { LogOut, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const CHURCH_LOGO_URL = 'https://picsum.photos/seed/logo/64/64';
export const CHURCH_NAME = 'Usuario';
export const CHURCH_TAGLINE = 'Sin rol asignado';

type ChurchAccountDropdownProps = {
  children: React.ReactNode;
  /** Alineación del menú desplegable (sidebar inferior vs cabecera móvil). */
  contentAlign?: 'start' | 'end' | 'center';
  contentSide?: 'top' | 'right' | 'bottom' | 'left';
};

type MeNavIdentityResponse = {
  staffRole?: string | null;
};

function buildUserDisplayName(user: ReturnType<typeof useUser>['user']): string {
  const full = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  if (full) return full;
  if (user?.fullName?.trim()) return user.fullName.trim();
  if (user?.username?.trim()) return user.username.trim();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (email) return email.split('@')[0] || CHURCH_NAME;
  return CHURCH_NAME;
}

export function useChurchIdentity() {
  const { user, isLoaded } = useUser();
  const [staffRole, setStaffRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/members/me-nav', {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json().catch(() => ({}))) as MeNavIdentityResponse;
        if (cancelled) return;
        const role = typeof data.staffRole === 'string' ? data.staffRole.trim() : '';
        setStaffRole(role || null);
      } catch {
        if (!cancelled) setStaffRole(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    name: isLoaded ? buildUserDisplayName(user) : CHURCH_NAME,
    subtitle: staffRole ?? CHURCH_TAGLINE,
  };
}

export function ChurchAccountDropdown({
  children,
  contentAlign = 'start',
  contentSide = 'right',
}: ChurchAccountDropdownProps) {
  const { openUserProfile, signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align={contentAlign}
        side={contentSide}
        sideOffset={8}
      >
        {isLoaded && email ? (
          <div className="truncate px-2 py-1.5 text-xs text-muted-foreground">{email}</div>
        ) : null}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            openUserProfile();
          }}
        >
          <UserCircle className="mr-2 h-4 w-4" />
          Gestionar cuenta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            void signOut({ redirectUrl: '/' });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Botón disparador (ref para Radix `asChild`) con marca iglesia + email o leyenda. */
export const ChurchAccountSidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function ChurchAccountSidebarTrigger({ className, ...props }, ref) {
  const { name, subtitle } = useChurchIdentity();
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex w-full min-w-0 items-center gap-3 rounded-lg border border-transparent p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={CHURCH_LOGO_URL} alt={name} />
        <AvatarFallback>{initials || 'US'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </button>
  );
});
ChurchAccountSidebarTrigger.displayName = 'ChurchAccountSidebarTrigger';
