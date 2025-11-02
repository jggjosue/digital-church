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
  Plus,
  Church,
  DollarSign,
  PiggyBank,
  Banknote,
  ClipboardList,
  HandHeart,
  UserPlus,
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
  { href: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/ministries', icon: Church, label: 'Ministerios' },
  { href: '/volunteers', icon: Users, label: 'Voluntarios' },
  { href: '/attendance', icon: BarChart, label: 'Asistencia' },
  { href: '/events', icon: Calendar, label: 'Eventos' },
  { href: '/donations', icon: Heart, label: 'Donaciones' },
  { href: '/sermons', icon: Video, label: 'Sermones y Medios' },
  { href: '/reports', icon: FileText, label: 'Reportes' },
];

const bottomNavItems = [
    { href: '/help', icon: HelpCircle, label: 'Ayuda' },
]

export function AppSidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(pathname.startsWith('/settings'));
  const [isFinancialOpen, setIsFinancialOpen] = React.useState(pathname.startsWith('/financial'));
  const [isPrayerOpen, setIsPrayerOpen] = React.useState(pathname.startsWith('/prayer'));
  const [isMembersOpen, setIsMembersOpen] = React.useState(pathname.startsWith('/members'));


  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-3 px-6">
        <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/logo/32/32" alt="Grace Church"/>
            <AvatarFallback>GC</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-semibold text-foreground">Grace Church</p>
            <p className="text-sm text-muted-foreground">Portal de Administración</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
            (pathname === '/dashboard' || pathname === '/') &&
              'bg-accent text-accent-foreground font-medium'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Panel</span>
        </Link>
        <Collapsible open={isMembersOpen} onOpenChange={setIsMembersOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    isMembersOpen && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        <span>Miembros</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isMembersOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/members"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/members' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Users className="h-4 w-4" />
                    <span>Directorio</span>
                </Link>
                <Link
                    href="/members/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/members/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Nuevo</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        {navItems.map((item) => (
          (item.href !== '/dashboard' && item.href !== '/members') && <Link
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
         <Collapsible open={isPrayerOpen} onOpenChange={setIsPrayerOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    isPrayerOpen && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <HandHeart className="h-4 w-4" />
                        <span>Peticiones de Oración</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isPrayerOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/prayer"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/prayer' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Peticiones</span>
                </Link>
                <Link
                    href="/prayer/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/prayer/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Oración</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
         <Collapsible open={isFinancialOpen} onOpenChange={setIsFinancialOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    isFinancialOpen && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4" />
                        <span>Finanzas</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isFinancialOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/financial"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/financial' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Reportes Financieros</span>
                </Link>
                <Link
                    href="/financial/income-expense"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/financial/income-expense' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <FileText className="h-4 w-4" />
                    <span>Ingresos y Gastos</span>
                </Link>
                <Link
                    href="/financial/budget"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/financial/budget' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <PiggyBank className="h-4 w-4" />
                    <span>Reporte de Presupuesto</span>
                </Link>
                <Link
                    href="/financial/funds"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/financial/funds' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Banknote className="h-4 w-4" />
                    <span>Saldos de Fondos</span>
                </Link>
                <Link
                    href="/financial/donations"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/financial/donations' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Reportes de Donaciones</span>
                </Link>
                <Link
                    href="/financial/new-transaction"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/financial/new-transaction' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Transacción
                </Link>
            </CollapsibleContent>
        </Collapsible>
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
                        <span>Configuración</span>
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
                    <span>Roles y Permisos</span>
                </Link>
                <Link
                    href="/settings/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/settings/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Rol</span>
                </Link>
                <Link
                    href="/settings/users"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/settings/users' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Users className="h-4 w-4" />
                    <span>Usuarios</span>
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
