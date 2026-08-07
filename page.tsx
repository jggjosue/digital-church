import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { promises as fs } from 'fs';
import path from 'path';

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), 'docs', 'terminos.md');
  const markdown = await fs.readFile(filePath, 'utf-8');

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <LandingHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="prose prose-slate max-w-none lg:prose-lg">
          <div dangerouslySetInnerHTML={{ __html: markdown }} />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}