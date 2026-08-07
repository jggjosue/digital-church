import { Metadata } from 'next';
import { getLegalDoc } from '@/lib/legal-docs';
import { LegalDocViewer } from '@/components/legal/legal-doc-viewer';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Gestión Ministerial',
  description: 'Conoce cómo recopilamos, utilizamos y protegemos la información personal y de tu organización en ICIAR.',
};

export default async function PrivacidadPage() {
  const doc = await getLegalDoc('privacidad');
  return <LegalDocViewer doc={doc} />;
}
