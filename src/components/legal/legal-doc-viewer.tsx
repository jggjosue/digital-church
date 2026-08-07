'use client';

import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { LegalDocData, LegalDocType } from '@/lib/legal-docs';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Cookie,
  FileText,
  Printer,
  Search,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface LegalDocViewerProps {
  doc: LegalDocData;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

const LEGAL_TABS: { slug: LegalDocType; label: string; icon: React.ElementType; href: string }[] = [
  { slug: 'privacidad', label: 'Política de Privacidad', icon: ShieldCheck, href: '/privacidad' },
  { slug: 'terminos', label: 'Términos del Servicio', icon: FileText, href: '/terminos' },
  { slug: 'cookies', label: 'Política de Cookies', icon: Cookie, href: '/cookies' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function renderInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const regex = /(\*\*(.*?)\*\*)|(\[(.*?)\]\((.*?)\))/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900 dark:text-slate-100">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      const linkText = match[4];
      const linkUrl = match[5];
      const isExternal = linkUrl.startsWith('http');
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-500"
        >
          {linkText}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function LegalDocViewer({ doc }: LegalDocViewerProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>('');

  // Process document and build TOC
  const { blocks, toc } = React.useMemo(() => {
    const lines = doc.content.split(/\r?\n/);
    const tocList: TocItem[] = [];
    const blockList: { type: string; content: string; id?: string; level?: number }[] = [];
    const idCounts: Record<string, number> = {};

    let currentList: string[] = [];

function generateUniqueId(baseId: string, idCounts: Record<string, number>): string {
  if (idCounts[baseId] === undefined) {
    idCounts[baseId] = 0;
  }
  idCounts[baseId]++;
  return idCounts[baseId] === 1 ? baseId : `${baseId}-${idCounts[baseId]}`;
}

    const flushList = () => {
      if (currentList.length > 0) {
        blockList.push({ type: 'list', content: currentList.join('\n') });
        currentList = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      if (line === '---') {
        flushList();
        blockList.push({ type: 'hr', content: '' });
        continue;
      }

      if (line.startsWith('# ')) {
        flushList();
        const title = line.replace(/^#\s+/, '');
        const id = generateUniqueId(slugify(title), idCounts);
        tocList.push({ id, title, level: 1 });
        blockList.push({ type: 'h1', content: title, id, level: 1 });
        continue;
      }

      if (line.startsWith('## ')) {
        flushList();
        const title = line.replace(/^##\s+/, '');
        const id = generateUniqueId(slugify(title), idCounts);
        tocList.push({ id, title, level: 2 });
        blockList.push({ type: 'h2', content: title, id, level: 2 });
        continue;
      }

      if (line.startsWith('### ')) {
        flushList();
        const title = line.replace(/^###\s+/, '');
        const id = generateUniqueId(slugify(title), idCounts);
        blockList.push({ type: 'h3', content: title, id, level: 3 });
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        currentList.push(line.replace(/^[-*]\s+/, ''));
        continue;
      }

      flushList();
      blockList.push({ type: 'p', content: line });
    }

    flushList();

    return { blocks: blockList, toc: tocList };
  }, [doc.content]);

  // Track active section on scroll
  React.useEffect(() => {
    if (toc.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      let current = toc[0]?.id || '';

      for (const item of toc) {
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            current = item.id;
          }
        }
      }

      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Calculate estimated reading time
  const readingTimeMinutes = React.useMemo(() => {
    const wordCount = doc.content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [doc.content]);

  const filterMatch = React.useCallback(
    (text: string) => {
      if (!searchQuery.trim()) return true;
      return text.toLowerCase().includes(searchQuery.toLowerCase());
    },
    [searchQuery]
  );

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 print:bg-white print:text-black">
      <div className="print:hidden">
        <LandingHeader />
      </div>

      {/* Top Banner & Navigation Header */}
      <div className="border-b border-slate-200/80 bg-white shadow-xs print:hidden">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <BookOpen className="h-4 w-4" />
                <span>Documentación Legal</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {doc.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 sm:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Última actualización: {doc.updatedAt}
                </span>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  ⚡ ~{readingTimeMinutes} min de lectura
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-blue-600 sm:text-sm"
                title="Copiar enlace"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-blue-600 sm:text-sm"
                title="Imprimir o guardar PDF"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Legal Navigation Tabs */}
          <div className="mt-8 flex overflow-x-auto border-b border-slate-200 no-scrollbar">
            <div className="flex gap-2 pb-px">
              {LEGAL_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = doc.slug === tab.slug;
                return (
                  <Link
                    key={tab.slug}
                    href={tab.href}
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Document Content Area */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:col-span-4 lg:block print:hidden">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Índice de Contenido
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {toc.length} secciones
                </span>
              </div>

              {/* Quick Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en el documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <nav className="max-h-[calc(100vh-280px)] space-y-1 overflow-y-auto pr-1 text-xs no-scrollbar">
                {toc.map((item) => {
                  const isActive = activeSection === item.id;
                  const isMatch = filterMatch(item.title);
                  if (!isMatch) return null;

                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={cn(
                        'block rounded-lg px-3 py-2 font-medium transition-all',
                        item.level === 2 && 'ml-3 text-[11px]',
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      {item.title}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Document Content View */}
          <article className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-10">
              <div className="prose prose-slate max-w-none space-y-5 text-slate-700 leading-relaxed sm:text-base">
                {blocks.map((block, idx) => {
                  if (block.type === 'h1') {
                    if (idx === 0) return null; // Skip main title as it's in header
                    return (
                      <div key={idx} id={block.id} className="pt-6 border-t border-slate-100 first:border-none">
                        <h2 className="group flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                          <a href={`#${block.id}`} className="transition-colors hover:text-blue-600">
                            {block.content}
                          </a>
                        </h2>
                      </div>
                    );
                  }

                  if (block.type === 'h2') {
                    return (
                      <h3 key={idx} id={block.id} className="pt-4 text-lg font-semibold text-slate-900 sm:text-xl">
                        <a href={`#${block.id}`} className="transition-colors hover:text-blue-600">
                          {block.content}
                        </a>
                      </h3>
                    );
                  }

                  if (block.type === 'h3') {
                    return (
                      <h4 key={idx} id={block.id} className="pt-2 text-base font-semibold text-slate-800">
                        {block.content}
                      </h4>
                    );
                  }

                  if (block.type === 'hr') {
                    return <hr key={idx} className="my-6 border-slate-200/70" />;
                  }

                  if (block.type === 'list') {
                    const items = block.content.split('\n');
                    return (
                      <ul key={idx} className="my-4 space-y-2.5 pl-5 list-disc marker:text-blue-500">
                        {items.map((item, i) => (
                          <li key={i} className="text-slate-700 leading-relaxed">
                            {renderInlineMarkdown(item)}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === 'p') {
                    // Check if it's metadata line like Last updated
                    if (block.content.startsWith('**Última actualización:**')) {
                      return null;
                    }
                    return (
                      <p key={idx} className="text-slate-700 leading-relaxed">
                        {renderInlineMarkdown(block.content)}
                      </p>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Bottom Navigation Switcher */}
              <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Inicio
                </Link>

                <div className="flex items-center gap-3">
                  {LEGAL_TABS.filter((t) => t.slug !== doc.slug).map((tab) => (
                    <Link
                      key={tab.slug}
                      href={tab.href}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <span>Ver {tab.label}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <div className="print:hidden">
        <LandingFooter />
      </div>
    </div>
  );
}
