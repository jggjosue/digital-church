'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  Upload,
  Calendar,
  Globe,
  Loader2,
  VideoIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export default function VideoLibraryPage() {
  const [videos, setVideos] = React.useState<SermonMedia[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
      fetch('/api/data/sermon-media')
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                setVideos(data.items.filter((m: SermonMedia) => m.type === 'video'));
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Video Library"
        description="Manage all video content for your church."
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload Video
        </Button>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title, event, or sermon..." className="pl-9" />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-3 lg:flex items-center gap-2 w-full lg:w-auto">
                <Button variant="outline" className="w-full">Category <ChevronDown className="ml-2 h-4 w-4" /></Button>
                <Button variant="outline" className="w-full">Date Range <ChevronDown className="ml-2 h-4 w-4" /></Button>
                <Button variant="outline" className="w-full">Privacy <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No hay videos registrados.
                    </div>
                )}
                {videos.map(video => (
                    <Card key={video.id}>
                        <CardContent className='p-4'>
                            <div className='relative flex items-center justify-center bg-black/10 rounded-t-lg h-48'>
                                <VideoIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                                <Badge className='absolute bottom-2 right-2' variant="secondary">Video</Badge>
                            </div>
                            <div className='pt-4'>
                                <h3 className='text-lg font-bold truncate'>{video.title || 'Video sin título'}</h3>
                                <p className='text-sm text-muted-foreground truncate'>ID Sermón: {video.sermonId}</p>
                                <div className='flex items-center gap-4 text-sm text-muted-foreground mt-2'>
                                    <div className='flex items-center gap-1.5'>
                                        <Calendar className='h-4 w-4' />
                                        <span>No Date</span>
                                    </div>
                                </div>
                                <div className='flex items-center gap-4 mt-2'>
                                    <Badge variant="outline" className='bg-green-100 text-green-800 border-green-200'>Published</Badge>
                                    <Badge variant="outline" className='flex items-center gap-1.5'><Globe className='h-3 w-3'/>Public</Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='p-4 bg-muted/50 border-t flex flex-col sm:flex-row justify-between gap-2'>
                            <Button variant="ghost" className="w-full sm:w-auto" asChild><Link href={video.url} target="_blank">Watch</Link></Button>
                            <Button variant="ghost" size="icon" className="self-end sm:self-center"><MoreHorizontal className='h-4 w-4'/></Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}
