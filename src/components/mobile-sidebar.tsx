
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
  Landmark,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const navItems = [
  { href: '/sermons', icon: Video, label: 'Biblioteca' },
  { href: '/facilities', icon: Building, label: 'Instalaciones' },
  { href: '/temples', icon: Landmark, label: 'Templos' },
  { href: '/documentation', icon: FileText, label: 'Documentación' },
];

const bottomNavItems = [
    { href: '/help', icon: HelpCircle, label: 'Ayuda' },
]

export function MobileSidebar() {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(pathname.startsWith('/settings'));
  const [isFinancialOpen, setIsFinancialOpen] = React.useState(pathname.startsWith('/financial'));
  const [isPrayerOpen, setIsPrayerOpen] = React.useState(pathname.startsWith('/prayer'));
  const [isMembersOpen, setIsMembersOpen] = React.useState(pathname.startsWith('/members'));
  const [isReportsOpen, setIsReportsOpen] = React.useState(pathname.startsWith('/reports'));
  const [isAttendanceOpen, setIsAttendanceOpen] = React.useState(pathname.startsWith('/attendance'));
  const [isGroupsOpen, setIsGroupsOpen] = React.useState(pathname.startsWith('/groups'));
  const [isMinistriesOpen, setIsMinistriesOpen] = React.useState(pathname.startsWith('/ministries'));
  const [isVolunteersOpen, setIsVolunteersOpen] = React.useState(pathname.startsWith('/volunteers'));
  const [isEventsOpen, setIsEventsOpen] = React.useState(pathname.startsWith('/events'));
  const [isDonationsOpen, setIsDonationsOpen] = React.useState(pathname.startsWith('/donations'));


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
                    pathname.startsWith('/members') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        <span>Directorio</span>
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
                    <span>Miembros</span>
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
                <Link
                    href="/members/pastoral"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/members/pastoral' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Heart className="h-4 w-4" />
                    <span>Pastoral</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isGroupsOpen} onOpenChange={setIsGroupsOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith('/groups') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4" />
                        <span>Grupos</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isGroupsOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/groups"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/groups' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Users className="h-4 w-4" />
                    <span>Directorio de Grupos</span>
                </Link>
                <Link
                    href="/groups/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/groups/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Grupo</span>
                </Link>
                 <Link
                    href="/groups/add-members"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/groups/add-members' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Agregar Miembros</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isMinistriesOpen} onOpenChange={setIsMinistriesOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith('/ministries') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <Church className="h-4 w-4" />
                        <span>Ministerios</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isMinistriesOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/ministries"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/ministries' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Gestionar</span>
                </Link>
                <Link
                    href="/ministries/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/ministries/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Ministerio</span>
                </Link>
                <Link
                    href="/ministries/assign-members"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/ministries/assign-members' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Asignar Miembros</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isVolunteersOpen} onOpenChange={setIsVolunteersOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith('/volunteers') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <HandHeart className="h-4 w-4" />
                        <span>Voluntarios</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isVolunteersOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/volunteers"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/volunteers' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Gestión</span>
                </Link>
                <Link
                    href="/volunteers/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/volunteers/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Voluntario</span>
                </Link>
                 <Link
                    href="/volunteers/tasks"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/volunteers/tasks' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Tareas</span>
                </Link>
                 <Link
                    href="/volunteers/planning"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/volunteers/planning' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Calendar className="h-4 w-4" />
                    <span>Planeación</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isEventsOpen} onOpenChange={setIsEventsOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith('/events') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4" />
                        <span>Eventos</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isEventsOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/events"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/events' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Gestionar</span>
                </Link>
                <Link
                    href="/events/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/events/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Evento</span>
                </Link>
                 <Link
                    href="/events/activities"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/events/activities' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Actividades</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isDonationsOpen} onOpenChange={setIsDonationsOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith('/donations') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4" />
                        <span>Ofrendas</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isDonationsOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/donations"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/donations' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Heart className="h-4 w-4" />
                    <span>Donaciones y ofrendas</span>
                </Link>
                <Link
                    href="/donations/pledges"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/donations/pledges' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Gestión de Promesas</span>
                </Link>
                 <Link
                    href="/donations/giving-statement"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/donations/giving-statement' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <FileText className="h-4 w-4" />
                    <span>Declaración de Donación</span>
                </Link>
                 <Link
                    href="/donations/fundraising"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/donations/fundraising' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <PiggyBank className="h-4 w-4" />
                    <span>Recaudación de Fondos</span>
                </Link>
                 <Link
                    href="/donations/new"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/donations/new' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Donación</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        {navItems.map((item) => (
          (item.href !== '/dashboard' && item.href !== '/donations' && item.href !== '/members' && item.href !== '/groups' && item.href !== '/ministries') && <Link
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
                    pathname.startsWith('/prayer') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <HandHeart className="h-4 w-4" />
                        <span>Peticiones</span>
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
                    pathname.startsWith('/financial') && 'bg-accent text-accent-foreground font-medium'
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
        <Collapsible open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith('/attendance') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <BarChart className="h-4 w-4" />
                        <span>Asistencia</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isAttendanceOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/attendance"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/attendance' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <ClipboardList className="h-4 w-4" />
                    <span>Gestión</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible open={isReportsOpen} onOpenChange={setIsReportsOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                    pathname.startsWith('/reports') && 'bg-accent text-accent-foreground font-medium'
                )}
                >
                    <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <span>Reportes</span>
                    </div>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isReportsOpen && 'rotate-180')} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-1">
                <Link
                    href="/reports"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/reports' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <FileText className="h-4 w-4" />
                    <span>Generador de Reportes</span>
                </Link>
                 <Link
                    href="/reports/volunteers"
                    className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10',
                    pathname === '/reports/volunteers' && 'bg-accent text-accent-foreground font-medium'
                    )}
                >
                    <Users className="h-4 w-4" />
                    <span>Voluntarios</span>
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
                    pathname.startsWith('/settings') && 'bg-accent text-accent-foreground font-medium'
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
    </div>
  );
}
