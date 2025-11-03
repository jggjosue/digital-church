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

const collapsibleNavItems = {
    Directorio: { icon: Users, path: '/members', sub: [ {path: '/members', label: 'Miembros', icon: Users}, {path: '/members/new', label: 'Nuevo', icon: UserPlus}, {path: '/members/pastoral', label: 'Pastoral', icon: Heart} ] },
    Groups: { icon: Users, path: '/groups', label: 'Grupos', sub: [ {path: '/groups', label: 'Directorio de Grupos', icon: Users}, {path: '/groups/new', label: 'Nuevo Grupo', icon: Plus}, {path: '/groups/add-members', label: 'Agregar Miembros', icon: UserPlus} ] },
    Ministries: { icon: Church, path: '/ministries', label: 'Ministerios', sub: [ {path: '/ministries', label: 'Gestionar', icon: ClipboardList}, {path: '/ministries/new', label: 'Nuevo Ministerio', icon: Plus}, {path: '/ministries/assign-members', label: 'Asignar Miembros', icon: UserPlus} ] },
    Volunteers: { icon: HandHeart, path: '/volunteers', label: 'Voluntarios', sub: [ {path: '/volunteers', label: 'Gestión', icon: ClipboardList}, {path: '/volunteers/new', label: 'Agregar Voluntario', icon: Plus}, {path: '/volunteers/tasks', label: 'Tareas', icon: ClipboardList}, {path: '/volunteers/planning', label: 'Planeación', icon: Calendar} ] },
    Events: { icon: Calendar, path: '/events', label: 'Eventos', sub: [ {path: '/events', label: 'Gestionar', icon: ClipboardList}, {path: '/events/new', label: 'Nuevo Evento', icon: Plus}, {path: '/events/activities', label: 'Actividades', icon: ClipboardList} ] },
    Donations: { icon: Heart, path: '/donations', label: 'Ofrendas', sub: [ {path: '/donations', label: 'Donaciones y ofrendas', icon: Heart}, {path: '/donations/pledges', label: 'Gestión de Promesas', icon: ClipboardList}, {path: '/donations/giving-statement', label: 'Declaración de Donación', icon: FileText}, {path: '/donations/fundraising', label: 'Recaudación de Fondos', icon: PiggyBank}, {path: '/donations/new', label: 'Nueva Donación', icon: Plus} ] },
    Prayer: { icon: HandHeart, path: '/prayer', label: 'Peticiones', sub: [ {path: '/prayer', label: 'Peticiones', icon: ClipboardList}, {path: '/prayer/new', label: 'Nueva Oración', icon: Plus} ] },
    Financial: { icon: DollarSign, path: '/financial', label: 'Finanzas', sub: [ {path: '/financial', label: 'Reportes Financieros', icon: LayoutDashboard}, {path: '/financial/income-expense', label: 'Ingresos y Gastos', icon: FileText}, {path: '/financial/budget', label: 'Reporte de Presupuesto', icon: PiggyBank}, {path: '/financial/funds', label: 'Saldos de Fondos', icon: Banknote}, {path: '/financial/donations', label: 'Reportes de Donaciones', icon: ClipboardList}, {path: '/financial/new-transaction', label: 'Nueva Transacción', icon: Plus} ] },
    Attendance: { icon: BarChart, path: '/attendance', label: 'Asistencia', sub: [ {path: '/attendance', label: 'Gestión', icon: ClipboardList} ] },
    Reports: { icon: FileText, path: '/reports', label: 'Reportes', sub: [ {path: '/reports', label: 'Generador de Reportes', icon: FileText}, {path: '/reports/volunteers', label: 'Voluntarios', icon: Users} ] },
    Settings: { icon: Settings, path: '/settings', label: 'Configuración', sub: [ {path: '/settings', label: 'Roles y Permisos', icon: UserCog}, {path: '/settings/new', label: 'Nuevo Rol', icon: Plus}, {path: '/settings/users', label: 'Usuarios', icon: Users} ] },
};


export function AppSidebar() {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const [openCollapsibles, setOpenCollapsibles] = React.useState(() => {
    const initialState: { [key: string]: boolean } = {};
    for (const key in collapsibleNavItems) {
        // @ts-ignore
        initialState[key] = pathname.startsWith(collapsibleNavItems[key].path);
    }
    return initialState;
  });

  const handleOpenChange = (key: string, open: boolean) => {
    setOpenCollapsibles(prev => ({ ...prev, [key]: open }));
  };

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
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
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

        {Object.entries(collapsibleNavItems).map(([key, item]) => (
            <Collapsible key={key} open={openCollapsibles[key]} onOpenChange={(open) => handleOpenChange(key, open)}>
                <CollapsibleTrigger className="w-full" asChild>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn('flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground', pathname.startsWith(item.path) && 'bg-accent text-accent-foreground font-medium', isCollapsed && "justify-center")}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-4 w-4" />
                                        <span className={cn(isCollapsed && "hidden")}>{item.label || key}</span>
                                    </div>
                                    <ChevronDown className={cn('h-4 w-4 transition-transform', openCollapsibles[key] && 'rotate-180', isCollapsed && "hidden")} />
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
