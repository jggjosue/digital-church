import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  BookHeart,
  Calendar,
  CalendarDays,
  Church,
  Clapperboard,
  ClipboardList,
  DollarSign,
  FileText,
  Gift,
  HandHelping,
  Heart,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  Library,
  List,
  Megaphone,
  Mic,
  Package,
  PiggyBank,
  Plus,
  Search,
  Settings,
  UserCog,
  UserPlus,
  Users,
  Wifi,
} from 'lucide-react';

export type PortalNavSubItem = { href: string; label: string; icon: LucideIcon };

export type PortalNavEntry =
  | {
    kind: 'link';
    module: string;
    href: string;
    label: string;
    icon: LucideIcon;
  }
  | {
    kind: 'group';
    module: string;
    label: string;
    icon: LucideIcon;
    subItems: PortalNavSubItem[];
  };

/** Árbol del menú lateral y matriz de permisos (etiquetas deben coincidir con la UI de roles). */
export const PORTAL_NAV_ENTRIES: PortalNavEntry[] = [
  { kind: 'link', module: 'Panel', href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  {
    kind: 'group',
    module: 'Directorio',
    label: 'Directorio',
    icon: Users,
    subItems: [
      { href: '/members/new', icon: UserPlus, label: 'Mis Datos' },
      { href: '/members/add', icon: Plus, label: 'Añadir' },
      { href: '/members', icon: Users, label: 'Miembros' },
      { href: '/members/staff', icon: UserCog, label: 'Pastoral' },
    ],
  },
  {
    kind: 'group',
    module: 'Iglesias',
    label: 'Iglesias',
    icon: Church,
    subItems: [
      { href: '/churches/new', icon: Plus, label: 'Añadir Ubicación' },
      { href: '/churches', icon: Search, label: 'Buscar' },
    ],
  },
  {
    kind: 'group',
    module: 'Ministerios',
    label: 'Ministerios',
    icon: HandHelping,
    subItems: [
      { href: '/ministries/new', icon: Plus, label: 'Nuevo Ministerio' },
      { href: '/ministries', icon: List, label: 'Gestionar' },
      { href: '/ministries/assign-members', icon: UserPlus, label: 'Asignar Miembros' },
    ],
  },
  {
    kind: 'group',
    module: 'Asistencia',
    label: 'Asistencia',
    icon: BarChart,
    subItems: [
      { href: '/attendance', icon: Search, label: 'Servicio' },
      { href: '/attendance/registro', icon: ClipboardList, label: 'Registro' },
      { href: '/attendance/report', icon: FileText, label: 'Reporte' },
    ],
  },
  {
    kind: 'group',
    module: 'Online',
    label: 'Online',
    icon: Wifi,
    subItems: [
      { href: '/online/servicio', icon: Search, label: 'Servicio' },
      { href: '/online/registro', icon: ClipboardList, label: 'Registro' },
      { href: '/online/reporte', icon: FileText, label: 'Reporte' },
    ],
  },
  {
    kind: 'group',
    module: 'Ofrendas',
    label: 'Ofrendas',
    icon: Heart,
    subItems: [
      { href: '/donations/registro', icon: ClipboardList, label: 'Registro de Ofrendas' },
    ],
  },
  {
    kind: 'group',
    module: 'Donaciones',
    label: 'Donaciones',
    icon: Gift,
    subItems: [
      { href: '/donations/new', icon: Plus, label: 'Añadir Donación' },
      { href: '/donations/fundraising/new', icon: Megaphone, label: 'Crear Campaña' },
      { href: '/donations', icon: Heart, label: 'Donaciones y ofrendas' },
      { href: '/donations/pledges', icon: List, label: 'Gestión de Promesas' },
      { href: '/donations/giving-statement', icon: FileText, label: 'Declaración de Donación' },
      { href: '/donations/fundraising', icon: PiggyBank, label: 'Recaudación de Fondos' },
    ],
  },
  ...(process.env.NEXT_PUBLIC_ENABLE_FINANCIAL === 'true' ? [{
    kind: 'group' as const,
    module: 'Finanzas',
    label: 'Finanzas',
    icon: DollarSign,
    subItems: [
      { href: '/financial', icon: LayoutGrid, label: 'Reportes Financieros' },
      { href: '/financial/income-expense', icon: FileText, label: 'Ingresos y Gastos' },
      { href: '/financial/budget', icon: PiggyBank, label: 'Reporte de Presupuesto' },
      { href: '/financial/funds', icon: Landmark, label: 'Saldos de Fondos' },
      { href: '/financial/donations', icon: FileText, label: 'Reportes de Donaciones' },
      { href: '/financial/new-transaction', icon: Plus, label: 'Nueva Transacción' },
    ],
  }] : []),
  {
    kind: 'group',
    module: 'Inventario',
    label: 'Inventario',
    icon: Package,
    subItems: [
      { href: '/inventario', icon: List, label: 'Gestión de inventario' },
      { href: '/inventario/nuevo', icon: Plus, label: 'Nueva Artículo' },
    ],
  },
  ...(process.env.NEXT_PUBLIC_ENABLE_PRAYER === 'true' ? [{
    kind: 'group' as const,
    module: 'Oración',
    label: 'Oración',
    icon: BookHeart,
    subItems: [
      { href: '/prayer', icon: List, label: 'Peticiones' },
      { href: '/prayer/new', icon: Plus, label: 'Nueva petición' },
    ],
  }] : []),
  /**{
    kind: 'group',
    module: 'Grupos',
    label: 'Grupos',
    icon: Users,
    subItems: [
      { href: '/groups', icon: Users, label: 'Directorio de grupos' },
      { href: '/groups/new', icon: Plus, label: 'Nuevo grupo' },
      { href: '/groups/add-members', icon: UserPlus, label: 'Agregar miembros' },
    ],
  },
  {
    kind: 'group',
    module: 'Voluntarios',
    label: 'Voluntarios',
    icon: HandHeart,
    subItems: [
      { href: '/volunteers', icon: List, label: 'Gestión' },
      { href: '/volunteers/new', icon: Plus, label: 'Nuevo voluntario' },
      { href: '/volunteers/tasks', icon: List, label: 'Tareas' },
      { href: '/volunteers/planning', icon: Calendar, label: 'Planeación' },
    ],
  },**/
  ...(process.env.NEXT_PUBLIC_ENABLE_EVENTS === 'true' ? [{
    kind: 'group' as const,
    module: 'Eventos',
    label: 'Eventos',
    icon: Calendar,
    subItems: [
      { href: '/events', icon: CalendarDays, label: 'Calendario y gestión' },
      { href: '/events/new', icon: Plus, label: 'Nuevo evento' },
      { href: '/events/activities', icon: List, label: 'Actividades' },
    ],
  }] : []),
  ...(process.env.NEXT_PUBLIC_ENABLE_LIBRARY === 'true' ? [{
    kind: 'group' as const,
    module: 'Biblioteca',
    label: 'Biblioteca',
    icon: Library,
    subItems: [
      { href: '/sermons', icon: Library, label: 'Librería' },
      { href: '/sermons/list', icon: List, label: 'Lista de sermones' },
      { href: '/sermons/videos', icon: Clapperboard, label: 'Vídeos' },
      { href: '/sermons/audio', icon: Mic, label: 'Audio' },
      { href: '/sermons/images', icon: ImageIcon, label: 'Imágenes' },
      { href: '/sermons/new', icon: Plus, label: 'Nuevo sermón' },
    ],
  }] : []),
  ...(process.env.NEXT_PUBLIC_ENABLE_CEREMONIES === 'true' ? [{
    kind: 'group' as const,
    module: 'Ceremonias',
    label: 'Ceremonias',
    icon: BookHeart,
    subItems: [
      { href: '/ceremonies', icon: List, label: 'Registros' },
      { href: '/ceremonies/new', icon: Plus, label: 'Nueva ceremonia' },
      { href: '/ceremonies/export', icon: FileText, label: 'Exportar datos' },
    ],
  }] : []),
  /**{
    kind: 'group',
    module: 'Instalaciones',
    label: 'Instalaciones',
    icon: Building,
    subItems: [
      { href: '/facilities', icon: List, label: 'Gestión de salones' },
      { href: '/facilities/new', icon: Plus, label: 'Registrar salón' },
    ],
  },
  {
    kind: 'group',
    module: 'Reportes',
    label: 'Reportes',
    icon: FileText,
    subItems: [
      { href: '/reports', icon: FileText, label: 'Generador de reportes' },
      { href: '/reports/volunteers', icon: Users, label: 'Voluntarios' },
    ],
  },**/
  {
    kind: 'group',
    module: 'Configuración',
    label: 'Configuración',
    icon: Settings,
    subItems: [
      { href: '/settings/new', icon: Plus, label: 'Roles y Permisos' },
      { href: '/settings/roles', icon: List, label: 'Lista de Roles' },
      { href: '/settings/users', icon: Users, label: 'Usuarios' },
    ],
  },
];

export const PORTAL_PERMISSIONS_BY_MODULE: Record<string, string[]> = PORTAL_NAV_ENTRIES.reduce(
  (acc, e) => {
    if (e.kind === 'link') acc[e.module] = [e.label];
    else acc[e.module] = e.subItems.map((s) => s.label);
    return acc;
  },
  {} as Record<string, string[]>
);

/** Acciones sensibles que no equivalen a mostrar una entrada del menú. */
PORTAL_PERMISSIONS_BY_MODULE.Ofrendas.push(
  'Ver ofrendas',
  'Registrar ofrendas',
  'Editar registros históricos',
  'Importar Excel',
  'Descargar reportes',
  'Eliminar categorías',
);

/** Para reutilizar en formularios (orden estable). */
export const PORTAL_MODULE_KEYS = PORTAL_NAV_ENTRIES.map((e) => e.module);

export type SidebarNavItem =
  | { href: string; label: string; icon: LucideIcon; subItems?: undefined }
  | { label: string; icon: LucideIcon; subItems: PortalNavSubItem[] };

export function portalEntriesToSidebarItems(): SidebarNavItem[] {
  return PORTAL_NAV_ENTRIES.map((e) => {
    if (e.kind === 'link') {
      return { href: e.href, label: e.label, icon: e.icon };
    }
    return { label: e.label, icon: e.icon, subItems: e.subItems };
  });
}

export function filterSidebarNavByModules(
  items: SidebarNavItem[],
  modules: Record<string, string[]> | null
): SidebarNavItem[] {
  if (modules == null) return items;

  const normalize = (v: string) => v.trim().toLowerCase();
  const getAllowedForModule = (moduleName: string): string[] | undefined => {
    const target = normalize(moduleName);
    let key = Object.keys(modules).find((k) => normalize(k) === target);

    // Backwards compatibility for users whose roles still use 'Ofrendas' for both modules
    if (!key && target === 'donaciones') {
      key = Object.keys(modules).find((k) => normalize(k) === 'ofrendas');
    }

    return key ? modules[key] : undefined;
  };

  const out: SidebarNavItem[] = [];
  for (const item of items) {
    if ('href' in item && item.href && !('subItems' in item && item.subItems)) {
      const allowed = getAllowedForModule('Panel');
      const allowedSet = new Set((allowed ?? []).map(normalize));
      if (
        allowedSet.has('*') ||
        allowedSet.has('panel') ||
        allowedSet.has(normalize(item.label)) ||
        allowedSet.has(normalize(item.href))
      ) {
        out.push(item);
      }
      continue;
    }
    if ('subItems' in item && item.subItems) {
      const allowedValues = getAllowedForModule(item.label);
      if (!allowedValues?.length) continue;
      const allowedSet = new Set(allowedValues.map(normalize));
      const sub = item.subItems.filter(
        (s) =>
          allowedSet.has('*') ||
          allowedSet.has(normalize(s.label)) ||
          allowedSet.has(normalize(s.href))
      );
      if (!sub.length) continue;
      out.push({ ...item, subItems: sub });
    }
  }
  return out;
}
