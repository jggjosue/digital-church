'use client';

import {
  BarChart,
  Building,
  Calendar,
  Heart,
  LayoutDashboard,
  Settings,
  Users,
  HelpCircle,
  FileText,
  Video,
  ChevronDown,
  UserCog,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/members', icon: Users, label: 'People' },
  { href: '/groups', icon: Users, label: 'Groups' },
  { href: '/volunteers', icon: Users, label: 'Volunteers' },
  { href: '/attendance', icon: BarChart, label: 'Attendance' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/donations', icon: Heart, label: 'Donations' },
  { href: '/sermons', icon: Video, label: 'Sermons & Media' },
  { href: '/facilities', icon: Building, label: 'Facilities' },
  { href: '/reports', icon: FileText, label: 'Reports' },
];

const bottomNavItems = [
    { href: '/help', icon: HelpCircle, label: 'Help' },
]

export function AppSidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(pathname.startsWith('/settings'));


  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-3 px-6">
        <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/logo/32/32" alt="Grace Church"/>
            <AvatarFallback>GC</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-semibold text-foreground">Grace Church</p>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
              pathname.startsWith(item.href) && item.href !== '/' &&
                'bg-accent text-accent-foreground font-medium',
              pathname === '/' && item.href === '/dashboard' && 'bg-accent text-accent-foreground font-medium'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 p-4">
        <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    isSettingsOpen && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isSettingsOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/settings"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/settings' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <UserCog className="h-4 w-4" />
                    <span>Roles &amp; Permisos</span>
                </Link>
                <Link
                    href="/settings/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/settings/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>New Role</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
              pathname.startsWith(item.href) &&
                'bg-accent text-accent-foreground font-medium'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
