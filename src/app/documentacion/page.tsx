import { TutorialImage } from '@/components/tutorial-image';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';

const DOCUMENTATION_IMAGES = [
  {
    title: 'Panel principal',
    image: '/documentacion/screenshots/dashboard-page.png',
  },
  {
    title: 'Área de indicadores del panel',
    image: '/documentacion/screenshots/dashboard-panel-area.png',
  },
  {
    title: 'Registro de templo',
    image: '/tutorial/nuevo-templo.png',
  },
  {
    title: 'Registro de miembros',
    image: '/documentacion/screenshots/members-new-page.png',
  },
  {
    title: 'Directorio de miembros',
    image: '/documentacion/screenshots/members-directory-area.png',
  },
  {
    title: 'Registro de ministerio',
    image: '/tutorial/nuevo-ministerio.png',
  },
  {
    title: 'Registro de asistencia',
    image: '/tutorial/registro-asistencia.png',
  },
  {
    title: 'Registro de ofrendas',
    image: '/tutorial/registro-ofrendas.png',
  },
  {
    title: 'Registro de inventario',
    image: '/tutorial/nuevo-inventario.png',
  },
  {
    title: 'Roles y permisos',
    image: '/tutorial/roles-permisos.png',
  },
] as const;

export default function DocumentacionPage() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <LandingHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-7">
          <h1 className="text-2xl font-bold sm:text-3xl">Guía visual de la plataforma</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Selecciona cualquier imagen para verla completa y con mayor detalle.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {DOCUMENTATION_IMAGES.map((item) => (
            <article key={item.image} className="overflow-hidden rounded-2xl border bg-white p-3 shadow-sm sm:p-4">
              <h2 className="mb-3 text-base font-semibold sm:text-lg">{item.title}</h2>
              <TutorialImage src={item.image} alt={`Vista de ${item.title}`} />
            </article>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
