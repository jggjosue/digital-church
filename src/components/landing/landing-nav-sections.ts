/**
 * Orden en el DOM (arriba → abajo) para el scroll-spy.
 * Debe coincidir con los `id` de las secciones en `landing-page.tsx`.
 */
export const LANDING_SCROLL_SECTION_IDS = [
  'servicios',
  'ofrendas',
  'recursos',
  'comunidad',
  'eventos',
] as const;

export type LandingScrollSectionId = (typeof LANDING_SCROLL_SECTION_IDS)[number];

/** Enlaces del menú (orden visual en la barra). */
export const LANDING_NAV_LINKS: ReadonlyArray<{ id: LandingScrollSectionId; label: string }> = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'ofrendas', label: 'Ofrendas' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'comunidad', label: 'Comunidad' },
  { id: 'eventos', label: 'Eventos' },
];
