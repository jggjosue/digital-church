
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

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
  { href: '/members', icon: Users, label: 'Directorio' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/ministries', icon: Users, label: 'Ministerios' },
  { href: '/volunteers', icon: Heart, label: 'Voluntarios' },
  { href: '/events', icon: Calendar, label: 'Eventos' },
  { href: '/donations', icon: Heart, label: 'Ofrendas' },
  { href: '/sermons', icon: Video, label: 'Biblioteca' },
  { href: '/prayer', icon: Heart, label: 'Peticiones' },
  { href: '/financial', icon: BarChart, label: 'Finanzas' },
  { href: '/attendance', icon: BarChart, label: 'Asistencia' },
  { href: '/reports', icon: FileText, label: 'Reportes' },
  { href: '/facilities', icon: Building, label: 'Instalaciones' },
  { href: '/temples', icon: Building, label: 'Templos' },
  { href: '/documentation', icon: FileText, label: 'Documentación' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
];

const bottomNavItems = [
    { href: '/help', icon: HelpCircle, label: 'Ayuda' },
]

export function MobileSidebar() {
  const pathname = usePathname();
  return (
    <div className="flex h-full w-full flex-col bg-background">
      <div className="flex h-16 items-center gap-3 px-6 border-b">
        <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/logo/32/32" alt="Grace Church"/>
            <AvatarFallback>GC</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-semibold text-foreground">Grace Church</p>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2 overflow-y-auto">
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
    </div>
  );
}
