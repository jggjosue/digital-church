import { TutorialImage } from '@/components/tutorial-image';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { Scroll3DScene } from '@/components/scroll-3d-scene';

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
    <Scroll3DScene className="documentation-3d min-h-dvh bg-slate-50 text-slate-900">
      <LandingHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-10 text-center sm:mb-12" data-3d-reveal>
          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
            Centro de aprendizaje
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Guía visual de la plataforma</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Selecciona cualquier imagen para verla completa y con mayor detalle.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {DOCUMENTATION_IMAGES.map((item) => (
            <article key={item.image} className="documentation-3d-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4">
              <h2 className="mb-3 text-base font-semibold sm:text-lg">{item.title}</h2>
              <TutorialImage src={item.image} alt={`Vista de ${item.title}`} />
            </article>
          ))}
        </div>
      </main>
      <LandingFooter />
    </Scroll3DScene>
  );
}
