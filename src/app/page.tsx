import type { Metadata } from 'next';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata: Metadata = {
  title: 'ICIAR — Portal ministerial',
  description:
    'Gestión ministerial con claridad arquitectónica. Miembros, finanzas, templos y recursos para su congregación.',
};

export default function Home() {
  return <LandingPage />;
}
