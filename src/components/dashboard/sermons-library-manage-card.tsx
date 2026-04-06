'use client';

import Link from 'next/link';
import {
  Clapperboard,
  Image as ImageIcon,
  Library,
  Mic,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { sermonsData } from '@/lib/data';

export function SermonsLibraryManageCard() {
  const count = sermonsData.length;

  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Library className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg">Sermones y biblioteca multimedia</CardTitle>
              <CardDescription className="mt-1">
                Administre sermones y recursos en vídeo, audio e imagen desde la
                librería de la iglesia.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sermons/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo sermón
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/sermons">
                <Library className="mr-2 h-4 w-4" />
                Librería
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/sermons/videos">
                <Clapperboard className="mr-2 h-4 w-4" />
                Vídeos
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/sermons/audio">
                <Mic className="mr-2 h-4 w-4" />
                Audio
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/sermons/images">
                <ImageIcon className="mr-2 h-4 w-4" />
                Imágenes
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-4 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">{count}</span>
          {count === 1
            ? ' sermón en el catálogo'
            : ' sermones en el catálogo'}
          . Datos de ejemplo.
        </p>
      </CardContent>
    </Card>
  );
}
