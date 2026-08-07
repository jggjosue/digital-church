import { Metadata } from 'next';
import { getLegalDoc } from '@/lib/legal-docs';
import { LegalDocViewer } from '@/components/legal/legal-doc-viewer';

export const metadata: Metadata = {
  title: 'Política de Cookies | Gestión Ministerial',
  description: 'Información sobre el uso de cookies y tecnologías similares en la plataforma ICIAR.',
};

export default async function CookiesPage() {
  const doc = await getLegalDoc('cookies');
  return <LegalDocViewer doc={doc} />;
}
