import { Metadata } from 'next';
import { getLegalDoc } from '@/lib/legal-docs';
import { LegalDocViewer } from '@/components/legal/legal-doc-viewer';

export const metadata: Metadata = {
  title: 'Términos del Servicio | Gestión Ministerial',
  description: 'Términos y condiciones que regulan el uso de la plataforma Gestión Ministerial.',
};

export default async function TermsPage() {
  const doc = await getLegalDoc('terminos');
  return <LegalDocViewer doc={doc} />;
}
