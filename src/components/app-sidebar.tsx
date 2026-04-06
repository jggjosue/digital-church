
'use client';

import {
  BarChart,
  Building,
  Heart,
  LayoutDashboard,
  Menu,
  Users,
  FileText,
  BookHeart,
  ChevronDown,
  UserPlus,
  Plus,
  List,
  PiggyBank,
  Landmark,
  DollarSign,
  LayoutGrid,
  ClipboardList,
  UserCog,
  Search,
  Calendar,
  CalendarDays,
  HandHeart,
  Library,
  Clapperboard,
  Mic,
  Image as ImageLucide,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { UserButton } from '@clerk/nextjs';
import { CHURCH_NAME, CHURCH_TAGLINE } from '@/components/church-account-dropdown';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Panel' },
  { 
    label: 'Directorio', 
    icon: Users, 
    subItems: [
      { href: '/members', icon: Users, label: 'Miembros' },
      { href: '/members/new', icon: UserPlus, label: 'Nuevo' },
      { href: '/members/staff', icon: UserCog, label: 'Pastoral' },
    ]
  },
  { 
    label: 'Iglesias', 
    icon: Building, 
    subItems: [
        { href: '/churches', icon: Search, label: 'Buscar' },
        { href: '/churches/new', icon: Plus, label: 'Añadir Ubicación' },
    ]
  },
  { 
    label: 'Ministerios', 
    icon: Building, 
    subItems: [
      { href: '/ministries/new', icon: Plus, label: 'Nuevo Ministerio' },
      { href: '/ministries', icon: List, label: 'Gestionar' },
      { href: '/ministries/assign-members', icon: UserPlus, label: 'Asignar Miembros' },
    ]
  },
  {
    label: 'Asistencia',
    icon: BarChart,
    subItems: [
      { href: '/attendance', icon: Search, label: 'Templos' },
      { href: '/attendance/report', icon: FileText, label: 'Reporte' },
      { href: '/attendance/registro', icon: ClipboardList, label: 'Registro' },
    ],
  },
  { 
    label: 'Ofrendas', 
    icon: Heart, 
    subItems: [
      { href: '/donations/new', icon: Plus, label: 'Nueva Donación' },
      { href: '/donations/pledges', icon: List, label: 'Gestión de Promesas' },
      { href: '/donations', icon: Heart, label: 'Donaciones y ofrendas' },
      { href: '/donations/giving-statement', icon: FileText, label: 'Declaración de Donación' },
      { href: '/donations/fundraising', icon: PiggyBank, label: 'Recaudación de Fondos' },
    ]
  },
  /*{ 
    label: 'Finanzas', 
    icon: DollarSign, 
    subItems: [
      { href: '/financial', icon: LayoutGrid, label: 'Reportes Financieros' },
      { href: '/financial/income-expense', icon: FileText, label: 'Ingresos y Gastos' },
      { href: '/financial/budget', icon: PiggyBank, label: 'Reporte de Presupuesto' },
      { href: '/financial/funds', icon: Landmark, label: 'Saldos de Fondos' },
      { href: '/financial/donations', icon: FileText, label: 'Reportes de Donaciones' },
      { href: '/financial/new-transaction', icon: Plus, label: 'Nueva Transacción' },
    ]
  },
  {
    label: 'Oración',
    icon: BookHeart,
    subItems: [
      { href: '/prayer', icon: List, label: 'Peticiones' },
      { href: '/prayer/new', icon: Plus, label: 'Nueva petición' },
    ],
  },
  {
    label: 'Grupos',
    icon: Users,
    subItems: [
      { href: '/groups', icon: Users, label: 'Directorio de grupos' },
      { href: '/groups/new', icon: Plus, label: 'Nuevo grupo' },
      { href: '/groups/add-members', icon: UserPlus, label: 'Agregar miembros' },
    ],
  },
  {
    label: 'Voluntarios',
    icon: HandHeart,
    subItems: [
      { href: '/volunteers', icon: List, label: 'Gestión' },
      { href: '/volunteers/new', icon: Plus, label: 'Nuevo voluntario' },
      { href: '/volunteers/tasks', icon: List, label: 'Tareas' },
      { href: '/volunteers/planning', icon: Calendar, label: 'Planeación' },
    ],
  },
  {
    label: 'Eventos',
    icon: Calendar,
    subItems: [
      { href: '/events', icon: CalendarDays, label: 'Calendario y gestión' },
      { href: '/events/new', icon: Plus, label: 'Nuevo evento' },
      { href: '/events/activities', icon: List, label: 'Actividades' },
    ],
  },
  {
    label: 'Biblioteca',
    icon: Library,
    subItems: [
      { href: '/sermons', icon: Library, label: 'Librería' },
      { href: '/sermons/list', icon: List, label: 'Lista de sermones' },
      { href: '/sermons/videos', icon: Clapperboard, label: 'Vídeos' },
      { href: '/sermons/audio', icon: Mic, label: 'Audio' },
      { href: '/sermons/images', icon: ImageLucide, label: 'Imágenes' },
      { href: '/sermons/new', icon: Plus, label: 'Nuevo sermón' },
    ],
  },
  {
    label: 'Ceremonias',
    icon: BookHeart,
    subItems: [
      { href: '/ceremonies', icon: List, label: 'Registros' },
      { href: '/ceremonies/new', icon: Plus, label: 'Nueva ceremonia' },
      { href: '/ceremonies/export', icon: FileText, label: 'Exportar datos' },
    ],
  },
  {
    label: 'Instalaciones',
    icon: Building,
    subItems: [
      { href: '/facilities', icon: List, label: 'Gestión de salones' },
      { href: '/facilities/new', icon: Plus, label: 'Registrar salón' },
    ],
  },
  {
    label: 'Reportes',
    icon: FileText,
    subItems: [
      { href: '/reports', icon: FileText, label: 'Generador de reportes' },
      { href: '/reports/volunteers', icon: Users, label: 'Voluntarios' },
    ],
  },
  {
    label: 'Configuración',
    icon: Settings,
    subItems: [
      { href: '/settings', icon: UserCog, label: 'Roles y permisos' },
      { href: '/settings/new', icon: Plus, label: 'Nuevo rol' },
      { href: '/settings/users', icon: Users, label: 'Usuarios' },
    ],
  },*/
];

//const bottomNavItems = [
  // { href: '/help', icon: HelpCircle, label: 'Ayuda' },
//];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [openCollapsibles, setOpenCollapsibles] = React.useState<string[]>([]);

  const isSubItemActive = (subItems: any[]) => {
    return subItems.some(subItem => pathname.startsWith(subItem.href));
  };

  const toggleCollapsible = (label: string) => {
    setOpenCollapsibles(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [label]
    );
  };

  React.useEffect(() => {
    const activeItem = navItems.find(item => item.subItems && isSubItemActive(item.subItems));
    if (activeItem) {
      // Keep existing open menus, and add the new active one if not already open
      setOpenCollapsibles(prev => {
        if (prev.includes(activeItem.label)) {
          return prev;
        }
        return [...prev, activeItem.label]
      });
    }
  }, [pathname]);

  return (
    <aside
      className={cn(
        'hidden min-h-screen shrink-0 flex-col overflow-hidden border-r bg-background transition-[width] duration-200 ease-in-out md:flex',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      <TooltipProvider>
      <div
        className={cn(
          'flex gap-3 border-b border-border/40 px-3 py-3',
          collapsed
            ? 'h-auto flex-col items-center justify-center'
            : 'h-16 flex-row items-center px-6'
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        >
          <Menu className="h-5 w-5" />
        </Button>
        {!collapsed ? (
          <>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8 shrink-0',
                  userButtonPopoverCard: 'rounded-lg',
                },
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{CHURCH_NAME}</p>
              <p className="truncate text-sm text-muted-foreground">{CHURCH_TAGLINE}</p>
            </div>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex shrink-0">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                      userButtonPopoverCard: 'rounded-lg',
                    },
                  }}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{CHURCH_NAME}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <nav className={cn('flex-1 space-y-1 overflow-y-auto px-4 py-2', collapsed && 'hidden')}>
        {navItems.map((item) => (
          item.subItems ? (
            <Collapsible key={item.label} open={openCollapsibles.includes(item.label)} onOpenChange={() => toggleCollapsible(item.label)}>
              <CollapsibleTrigger asChild>
                <div
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer',
                    isSubItemActive(item.subItems) && 'bg-accent text-accent-foreground font-medium'
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsibles.includes(item.label) && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pt-1">
                {item.subItems.map(subItem => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg py-2 pl-9 pr-3 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                      pathname === subItem.href && 'bg-accent/50 text-accent-foreground'
                    )}
                  >
                    <subItem.icon className="h-4 w-4" />
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href!}
                        className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                        pathname === item.href! && 'bg-accent text-accent-foreground font-medium'
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                <p>{item.label}</p>
                </TooltipContent>
            </Tooltip>
          )
        ))}
      </nav>
      </TooltipProvider>
    </aside>
  );
}
