import Link from 'next/link';
import { LANDING_NAV_LINKS } from '@/components/landing/landing-nav-sections';

const LEGAL_ENTITY_ADDRESS =
  'Magzin LLC, 800 Third Avenue Associates, New York, NY, 10022, United States';
const CLERK_PRIVACY_URL = 'https://clerk.com/legal/privacy';
const CLERK_TERMS_URL = 'https://clerk.com/legal/terms';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <nav aria-label="Secciones del pie de página" className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-5 text-sm font-medium text-slate-600 sm:gap-x-10 sm:px-6 sm:py-6 sm:text-base lg:justify-between">
          {LANDING_NAV_LINKS.map(({ id, label }) => (
            <Link key={id} href={`/#${id}`} className="transition-colors hover:text-blue-600">
              {label}
            </Link>
          ))}
          <Link href="/documentacion" className="transition-colors hover:text-blue-600">
            Documentación
          </Link>
        </div>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-14 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-slate-900">ICIAR</p>
          <p className="mt-3 text-sm text-slate-600">
            Plataforma de gestión eclesiástica con integridad estructural.
          </p>
          <address className="mt-6 not-italic">
            <p className="text-xs leading-relaxed text-slate-500">{LEGAL_ENTITY_ADDRESS}</p>
          </address>
          <p className="mt-3 text-xs text-slate-400">
            © {new Date().getFullYear()} ICIAR. Todos los derechos reservados.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Legal</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li><a href={CLERK_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Política de privacidad</a></li>
            <li><a href={CLERK_TERMS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">Términos del servicio</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Contacto</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li><a href="#" className="hover:text-blue-600">Contáctenos</a></li>
            <li><a href="#" className="hover:text-blue-600">Soporte</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Comunidad</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li><Link href="/documentacion" className="hover:text-blue-600">Documentación</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
