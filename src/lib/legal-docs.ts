import fs from 'fs/promises';
import path from 'path';

export type LegalDocType = 'privacidad' | 'terminos' | 'cookies';

export interface LegalDocData {
  slug: LegalDocType;
  title: string;
  updatedAt: string;
  content: string;
}

const DOC_CONFIGS: Record<LegalDocType, { title: string; filename: string }> = {
  privacidad: {
    title: 'Política de Privacidad',
    filename: 'privacidad.md',
  },
  terminos: {
    title: 'Términos del Servicio',
    filename: 'terminos.md',
  },
  cookies: {
    title: 'Política de Cookies',
    filename: 'cookies.md',
  },
};

export async function getLegalDoc(type: LegalDocType): Promise<LegalDocData> {
  const config = DOC_CONFIGS[type];
  const filePath = path.join(process.cwd(), 'docs', config.filename);

  let content = '';
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    content = `# ${config.title}\n\nNo se pudo cargar el contenido legal.`;
  }

  const match = content.match(/\*\*Última actualización:\*\*\s*([^\n]+)/);
  const updatedAt = match ? match[1].trim() : 'Agosto de 2026';

  return {
    slug: type,
    title: config.title,
    updatedAt,
    content,
  };
}
