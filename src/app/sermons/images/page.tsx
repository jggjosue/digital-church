'use client';

import * as React from 'react';
import {
  Search,
  ChevronDown,
  Upload,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';

type SermonMedia = {
    id: string;
    sermonId: string;
    type: string;
    url: string;
    title?: string;
    mimeType?: string;
    size?: number;
};

export default function ImageLibraryPage() {
  const [images, setImages] = React.useState<SermonMedia[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
      fetch('/api/data/sermon-media')
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                setImages(data.items.filter((m: SermonMedia) => m.type === 'image'));
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Image Library"
        description="Manage all photos, sermon graphics, and event images."
      >
        <div className='flex gap-2'>
            <Button variant="outline">New Album</Button>
            <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="images">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by title, tag, or sermon..." className="pl-9" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="w-full">Category <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Album <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Date Uploaded <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </div>
            </div>
            <TabsList className="grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="all-media" asChild><Link href="/sermons">All Media</Link></TabsTrigger>
              <TabsTrigger value="sermons" asChild><Link href="/sermons/list">Sermons</Link></TabsTrigger>
              <TabsTrigger value="videos" asChild><Link href="/sermons/videos">Videos</Link></TabsTrigger>
              <TabsTrigger value="audio" asChild><Link href="/sermons/audio">Audio</Link></TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
            <TabsContent value="images">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6">
                    {images.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No hay imágenes registradas.
                        </div>
                    )}
                    {images.map((image) => (
                        <Card key={image.id} className='overflow-hidden'>
                            <CardContent className='p-0'>
                                <div className='w-full aspect-square bg-muted flex items-center justify-center overflow-hidden bg-center bg-cover' style={{ backgroundImage: `url(${image.url})`}}>
                                    {!image.url && <ImageIcon className='h-12 w-12 text-muted-foreground opacity-50' />}
                                </div>
                                <div className='p-4'>
                                    <h3 className='font-semibold truncate'>{image.title || 'Imagen'}</h3>
                                    <p className='text-xs text-muted-foreground truncate'>Sermón: {image.sermonId}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
