'use client';

import Image from 'next/image';
import { Expand } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function TutorialImage({ src, alt }: { src: string; alt: string }) {
  return <Dialog>
    <DialogTrigger asChild>
      <button type="button" className="group relative block w-full overflow-hidden bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={`Ampliar imagen: ${alt}`}>
        <div className="relative aspect-[16/10] w-full"><Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-contain transition-transform duration-300 group-hover:scale-[1.015]" /></div>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur"><Expand className="h-4 w-4" />Ampliar</span>
      </button>
    </DialogTrigger>
    <DialogContent className="flex h-[min(92dvh,900px)] w-[min(96vw,1500px)] max-w-none flex-col overflow-hidden border-slate-700 bg-slate-950 p-3 text-white sm:p-5">
      <DialogTitle className="pr-10 text-base sm:text-lg">{alt}</DialogTitle>
      <DialogDescription className="sr-only">Vista ampliada de la pantalla del tutorial.</DialogDescription>
      <div className="relative min-h-0 flex-1"><Image src={src} alt={alt} fill sizes="96vw" className="object-contain" priority /></div>
    </DialogContent>
  </Dialog>;
}
