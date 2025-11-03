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
  PanelLeft,
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
import { useMediaQuery } from '@/hooks/use-media-query';


const navItems = [
  { href: '/sermons', icon: Video, label: 'Biblioteca' },
  { href: '/facilities', icon: Building, label: 'Instalaciones' },
  { href: '/temples', icon: Landmark, label: 'Templos' },
  { href: '/documentation', icon: FileText, label: 'Documentación' },
];

const bottomNavItems = [
    { href: '/help', icon: HelpCircle, label: 'Ayuda' },
]

export function AppSidebar() {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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

  if (!isDesktop) {
    return null;
  }

  return (
    <aside className={cn("flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out", isCollapsed ? "w-16" : "w-64")}>
      <div className={cn("flex h-16 items-center gap-3 px-6", isCollapsed && "px-3 justify-center")}>
        <Avatar className="h-8 w-8">
            <AvatarImage src="https://picsum.photos/seed/logo/32/32" alt="Grace Church"/>
            <AvatarFallback>GC</AvatarFallback>
        </Avatar>
        <div className={cn("flex flex-col", isCollapsed && "hidden")}>
            <p className="font-semibold text-foreground">Grace Church</p>
            <p className="text-sm text-muted-foreground">Portal de Administración</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                    href="/dashboard"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                        (pathname === '/dashboard' || pathname === '/') &&
                        'bg-accent text-accent-foreground font-medium',
                        isCollapsed && "justify-center"
                    )}
                    >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className={cn(isCollapsed && "hidden")}>Panel</span>
                    </Link>
                </TooltipTrigger>
                 {isCollapsed && <TooltipContent side="right">Panel</TooltipContent>}
            </Tooltip>
        </TooltipProvider>
        <Collapsible open={isMembersOpen} onOpenChange={setIsMembersOpen}>
            <CollapsibleTrigger className="w-full" asChild>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                            className={cn(
                                'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                                pathname.startsWith('/members') && 'bg-accent text-accent-foreground font-medium',
                                isCollapsed && "justify-center"
                            )}
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4" />
                                    <span className={cn(isCollapsed && "hidden")}>Directorio</span>
                                </div>
                                <ChevronDown className={cn('h-4 w-4 transition-transform', isMembersOpen && 'rotate-180', isCollapsed && "hidden")} />
                            </div>
                        </TooltipTrigger>
                         {isCollapsed && <TooltipContent side="right">Directorio</TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </CollapsibleTrigger>
            <CollapsibleContent className={cn("space-y-1 pt-1", isCollapsed && "hidden")}>
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
        {/* Other menu items */}
        {Object.entries({
            Groups: { hook: isGroupsOpen, setter: setIsGroupsOpen, icon: Users, path: '/groups', sub: [ {path: '/groups', label: 'Directorio de Grupos', icon: Users}, {path: '/groups/new', label: 'Nuevo Grupo', icon: Plus}, {path: '/groups/add-members', label: 'Agregar Miembros', icon: UserPlus} ] },
            Ministries: { hook: isMinistriesOpen, setter: setIsMinistriesOpen, icon: Church, path: '/ministries', label: 'Ministerios', sub: [ {path: '/ministries', label: 'Gestionar', icon: ClipboardList}, {path: '/ministries/new', label: 'Nuevo Ministerio', icon: Plus}, {path: '/ministries/assign-members', label: 'Asignar Miembros', icon: UserPlus} ] },
            Volunteers: { hook: isVolunteersOpen, setter: setIsVolunteersOpen, icon: HandHeart, path: '/volunteers', label: 'Voluntarios', sub: [ {path: '/volunteers', label: 'Gestión', icon: ClipboardList}, {path: '/volunteers/new', label: 'Agregar Voluntario', icon: Plus}, {path: '/volunteers/tasks', label: 'Tareas', icon: ClipboardList}, {path: '/volunteers/planning', label: 'Planeación', icon: Calendar} ] },
            Events: { hook: isEventsOpen, setter: setIsEventsOpen, icon: Calendar, path: '/events', label: 'Eventos', sub: [ {path: '/events', label: 'Gestionar', icon: ClipboardList}, {path: '/events/new', label: 'Nuevo Evento', icon: Plus}, {path: '/events/activities', label: 'Actividades', icon: ClipboardList} ] },
            Donations: { hook: isDonationsOpen, setter: setIsDonationsOpen, icon: Heart, path: '/donations', label: 'Ofrendas', sub: [ {path: '/donations', label: 'Donaciones y ofrendas', icon: Heart}, {path: '/donations/pledges', label: 'Gestión de Promesas', icon: ClipboardList}, {path: '/donations/giving-statement', label: 'Declaración de Donación', icon: FileText}, {path: '/donations/fundraising', label: 'Recaudación de Fondos', icon: PiggyBank}, {path: '/donations/new', label: 'Nueva Donación', icon: Plus} ] },
            Prayer: { hook: isPrayerOpen, setter: setIsPrayerOpen, icon: HandHeart, path: '/prayer', label: 'Peticiones', sub: [ {path: '/prayer', label: 'Peticiones', icon: ClipboardList}, {path: '/prayer/new', label: 'Nueva Oración', icon: Plus} ] },
            Financial: { hook: isFinancialOpen, setter: setIsFinancialOpen, icon: DollarSign, path: '/financial', label: 'Finanzas', sub: [ {path: '/financial', label: 'Reportes Financieros', icon: LayoutDashboard}, {path: '/financial/income-expense', label: 'Ingresos y Gastos', icon: FileText}, {path: '/financial/budget', label: 'Reporte de Presupuesto', icon: PiggyBank}, {path: '/financial/funds', label: 'Saldos de Fondos', icon: Banknote}, {path: '/financial/donations', label: 'Reportes de Donaciones', icon: ClipboardList}, {path: '/financial/new-transaction', label: 'Nueva Transacción', icon: Plus} ] },
            Attendance: { hook: isAttendanceOpen, setter: setIsAttendanceOpen, icon: BarChart, path: '/attendance', label: 'Asistencia', sub: [ {path: '/attendance', label: 'Gestión', icon: ClipboardList} ] },
            Reports: { hook: isReportsOpen, setter: setIsReportsOpen, icon: FileText, path: '/reports', label: 'Reportes', sub: [ {path: '/reports', label: 'Generador de Reportes', icon: FileText}, {path: '/reports/volunteers', label: 'Voluntarios', icon: Users} ] },
        }).map(([key, item]) => (
            <Collapsible key={key} open={item.hook} onOpenChange={item.setter}>
                <CollapsibleTrigger className="w-full" asChild>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn('flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground', pathname.startsWith(item.path) && 'bg-accent text-accent-foreground font-medium', isCollapsed && "justify-center")}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4" />
                                        <span className={cn(isCollapsed && "hidden")}>{item.label || key}</span>
                                    </div>
                                    <ChevronDown className={cn('h-4 w-4 transition-transform', item.hook && 'rotate-180', isCollapsed && "hidden")} />
                                </div>
                            </TooltipTrigger>
                            {isCollapsed && <TooltipContent side="right">{item.label || key}</TooltipContent>}
                        </Tooltip>
                    </TooltipProvider>
                </CollapsibleTrigger>
                <CollapsibleContent className={cn("space-y-1 pt-1", isCollapsed && "hidden")}>
                    {item.sub.map(subItem => (
                        <Link key={subItem.path} href={subItem.path} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10', pathname === subItem.path && 'bg-accent text-accent-foreground font-medium')}>
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.label}</span>
                        </Link>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        ))}

        {navItems.map((item) => (
            (item.href !== '/dashboard' && item.href !== '/donations' && item.href !== '/members' && item.href !== '/groups' && item.href !== '/ministries') &&
            <TooltipProvider key={item.href}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href={item.href}
                            className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                            pathname.startsWith(item.href) && item.href !== '/' && 'bg-accent text-accent-foreground font-medium',
                            isCollapsed && "justify-center"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span className={cn(isCollapsed && "hidden")}>{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                     {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
            </TooltipProvider>
        ))}
      </nav>
      <div className="mt-auto space-y-1 p-4">
        <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <CollapsibleTrigger className="w-full" asChild>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn('flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground', isSettingsOpen && 'bg-accent text-accent-foreground font-medium', isCollapsed && "justify-center")}>
                                <div className="flex items-center gap-3">
                                    <Settings className="h-4 w-4" />
                                    <span className={cn(isCollapsed && "hidden")}>Configuración</span>
                                </div>
                                <ChevronDown className={cn('h-4 w-4 transition-transform', isSettingsOpen && 'rotate-180', isCollapsed && "hidden")} />
                            </div>
                        </TooltipTrigger>
                        {isCollapsed && <TooltipContent side="right">Configuración</TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </CollapsibleTrigger>
            <CollapsibleContent className={cn("space-y-1 pt-1", isCollapsed && "hidden")}>
                <Link href="/settings" className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10', pathname === '/settings' && 'bg-accent text-accent-foreground font-medium')}>
                    <UserCog className="h-4 w-4" />
                    <span>Roles y Permisos</span>
                </Link>
                <Link href="/settings/new" className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10', pathname === '/settings/new' && 'bg-accent text-accent-foreground font-medium')}>
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Rol</span>
                </Link>
                <Link href="/settings/users" className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground pl-10', pathname === '/settings/users' && 'bg-accent text-accent-foreground font-medium')}>
                    <Users className="h-4 w-4" />
                    <span>Usuarios</span>
                </Link>
            </CollapsibleContent>
        </Collapsible>
        {bottomNavItems.map((item) => (
            <TooltipProvider key={item.href}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href={item.href}
                            className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                            pathname.startsWith(item.href) && 'bg-accent text-accent-foreground font-medium',
                            isCollapsed && "justify-center"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            <span className={cn(isCollapsed && "hidden")}>{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
            </TooltipProvider>
        ))}
         <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg px-3 py-2" onClick={() => setIsCollapsed(!isCollapsed)}>
            <PanelLeft className="h-4 w-4" />
            <span className={cn(isCollapsed && "hidden")}>Colapsar</span>
        </Button>
      </div>
    </aside>
  );
}
