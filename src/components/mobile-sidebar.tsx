
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
  UserPlus,
  Plus,
  List,
  PiggyBank,
  Landmark,
  DollarSign,
  LayoutGrid,
  ClipboardList,
  UserCog,
  BookHeart,
  Library,
  Clapperboard,
  Mic,
  ImageIcon,
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';

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
    label: 'Oración', 
    icon: Heart, 
    subItems: [
      { href: '/prayer', icon: List, label: 'Peticiones' },
      { href: '/prayer/new', icon: Plus, label: 'Nueva Oración' },
    ]
  },
  { 
    label: 'Grupos', 
    icon: Users, 
    subItems: [
      { href: '/groups', icon: Users, label: 'Directorio de Grupos' },
      { href: '/groups/new', icon: Plus, label: 'Nuevo Grupo' },
      { href: '/groups/add-members', icon: UserPlus, label: 'Agregar Miembros' },
    ]
  },
  { 
    label: 'Ministerios', 
    icon: Building, 
    subItems: [
      { href: '/ministries', icon: List, label: 'Gestionar' },
      { href: '/ministries/new', icon: Plus, label: 'Nuevo Ministerio' },
      { href: '/ministries/assign-members', icon: UserPlus, label: 'Asignar Miembros' },
    ]
  },
  { 
    label: 'Voluntarios', 
    icon: Heart, 
    subItems: [
      { href: '/volunteers', icon: List, label: 'Gestión' },
      { href: '/volunteers/new', icon: Plus, label: 'Agregar Voluntario' },
      { href: '/volunteers/tasks', icon: List, label: 'Tareas' },
      { href: '/volunteers/planning', icon: Calendar, label: 'Planeación' },
    ]
  },
  { 
    label: 'Eventos', 
    icon: Calendar, 
    subItems: [
      { href: '/events', icon: List, label: 'Gestionar' },
      { href: '/events/new', icon: Plus, label: 'Nuevo Evento' },
      { href: '/events/activities', icon: List, label: 'Actividades' },
    ]
  },
  { 
    label: 'Ofrendas', 
    icon: Heart, 
    subItems: [
      { href: '/donations', icon: Heart, label: 'Donaciones y ofrendas' },
      { href: '/donations/pledges', icon: List, label: 'Gestión de Promesas' },
      { href: '/donations/giving-statement', icon: FileText, label: 'Declaración de Donación' },
      { href: '/donations/fundraising', icon: PiggyBank, label: 'Recaudación de Fondos' },
      { href: '/donations/new', icon: Plus, label: 'Nueva Donación' },
    ]
  },
  { 
    label: 'Biblioteca', 
    icon: Library, 
    subItems: [
      { href: '/sermons', icon: Library, label: 'Librería' },
      { href: '/sermons/list', icon: Video, label: 'Sermón' },
      { href: '/sermons/videos', icon: Clapperboard, label: 'Vídeos' },
      { href: '/sermons/audio', icon: Mic, label: 'Audio' },
      { href: '/sermons/images', icon: ImageIcon, label: 'Imagen' },
      { href: '/sermons/new', icon: Plus, label: 'Nuevo sermón' },
    ]
  },
  { 
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
    label: 'Asistencia', 
    icon: BarChart, 
    subItems: [
      { href: '/attendance', icon: ClipboardList, label: 'Gestión' },
    ]
  },
  { href: '/ceremonies', icon: BookHeart, label: 'Ceremonias' },
  { href: '/churches', icon: Building, label: 'Iglesias' },
  { href: '/facilities', icon: Building, label: 'Instalaciones' },
  { 
    label: 'Reportes', 
    icon: FileText, 
    subItems: [
      { href: '/reports', icon: FileText, label: 'Generador de Reportes' },
      { href: '/reports/volunteers', icon: Users, label: 'Voluntarios' },
    ]
  },
  { 
    label: 'Configuración', 
    icon: Settings, 
    subItems: [
      { href: '/settings', icon: UserCog, label: 'Roles y Permisos' },
      { href: '/settings/new', icon: Plus, label: 'Nuevo Rol' },
      { href: '/settings/users', icon: Users, label: 'Usuarios' },
    ]
  },
];

const bottomNavItems = [
    { href: '/help', icon: HelpCircle, label: 'Ayuda' },
]

export function MobileSidebar() {
  const pathname = usePathname();
  const [openCollapsibles, setOpenCollapsibles] = React.useState<string[]>([]);

  const isSubItemActive = (subItems: any[]) => {
    return subItems.some(subItem => pathname.startsWith(subItem.href));
  };

  const toggleCollapsible = (label: string) => {
    setOpenCollapsibles(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  React.useEffect(() => {
    const activeItem = navItems.find(item => item.subItems && isSubItemActive(item.subItems));
    if (activeItem) {
      setOpenCollapsibles(prev => {
        if (prev.includes(activeItem.label)) {
          return prev;
        }
        return [activeItem.label]
      });
    } else {
        setOpenCollapsibles([]);
    }
  }, [pathname]);

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
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                pathname.startsWith(item.href!) && item.href !== '/' &&
                  'bg-accent text-accent-foreground font-medium',
                pathname === '/' && item.href === '/dashboard' && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
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
