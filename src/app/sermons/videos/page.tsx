
'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  Eye,
  Edit,
  Video,
  Mic,
  Upload,
  Calendar,
  Globe,
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
import Image from 'next/image';

const videoData = {
    id: 1,
    title: 'The Power of Forgiveness',
    series: 'Gospel of John',
    date: 'Oct 29, 2023',
    duration: '45:12',
    thumbnail: 'https://picsum.photos/seed/sermon1/600/400',
};

export default function VideoLibraryPage() {

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
            <div className="grid grid-cols-3 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                <Button variant="outline">Category <ChevronDown className="ml-2 h-4 w-4" /></Button>
                <Button variant="outline">Date Range <ChevronDown className="ml-2 h-4 w-4" /></Button>
                <Button variant="outline">Privacy <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </div>
        </div>

        <Card>
            <CardContent className='p-4'>
                <div className='relative'>
                    <Image
                        src={videoData.thumbnail}
                        alt={videoData.title}
                        width={600}
                        height={400}
                        className='w-full rounded-t-lg'
                        data-ai-hint="abstract texture"
                    />
                    <Badge className='absolute bottom-2 right-2' variant="secondary">{videoData.duration}</Badge>
                </div>
                <div className='pt-4'>
                    <h3 className='text-lg font-bold'>{videoData.title}</h3>
                    <p className='text-sm text-muted-foreground'>Sermon: {videoData.series}</p>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground mt-2'>
                        <div className='flex items-center gap-1.5'>
                            <Calendar className='h-4 w-4' />
                            <span>{videoData.date}</span>
                        </div>
                    </div>
                     <div className='flex items-center gap-4 mt-2'>
                        <Badge variant="outline" className='bg-green-100 text-green-800 border-green-200'>Published</Badge>
                        <Badge variant="outline" className='flex items-center gap-1.5'><Globe className='h-3 w-3'/>Public</Badge>
                    </div>
                </div>
            </CardContent>
            <CardFooter className='p-4 bg-muted/50 border-t flex justify-between'>
                <Button variant="ghost"><Edit className='mr-2 h-4 w-4'/>Edit</Button>
                <Button variant="ghost" size="icon"><MoreHorizontal className='h-4 w-4'/></Button>
            </CardFooter>
        </Card>
      </main>
    </div>
  );
}
