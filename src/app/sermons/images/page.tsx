
'use client';

import * as React from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Upload,
  ImageIcon,
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

const imagesData = [
    {
        id: 1,
        title: 'Sunday Service Highlight',
        uploaded: 'Nov 12, 2023',
        tags: ['Sermon', 'Worship'],
        tagColors: ['bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800'],
    },
    {
        id: 2,
        title: 'Faith In Action Group',
        uploaded: 'Nov 04, 2023',
        tags: ['Sermon Graphic', 'James'],
        tagColors: ['bg-indigo-100 text-indigo-800', 'bg-gray-100 text-gray-800'],
    },
    {
        id: 3,
        title: 'Community Picnic',
        uploaded: 'Oct 30, 2023',
        tags: ['Event', 'Fellowship'],
        tagColors: ['bg-green-100 text-green-800', 'bg-teal-100 text-teal-800'],
    },
    {
        id: 4,
        title: 'Youth Group Bonfire',
        uploaded: 'Oct 28, 2023',
        tags: ['Event', 'Youth'],
        tagColors: ['bg-green-100 text-green-800', 'bg-pink-100 text-pink-800'],
    },
    {
        id: 5,
        title: 'The Power of Forgiveness',
        uploaded: 'Oct 27, 2023',
        tags: ['Sermon Graphic', 'Gospel of John'],
        tagColors: ['bg-indigo-100 text-indigo-800', 'bg-gray-100 text-gray-800'],
    },
];

export default function ImageLibraryPage() {

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
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by title, tag, or sermon..." className="pl-9" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 w-full lg:w-auto">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
                    {imagesData.map((image, index) => (
                        <Card key={index} className='overflow-hidden'>
                            <CardContent className='p-0'>
                                <div className='w-full aspect-square bg-muted flex items-center justify-center'>
                                    <ImageIcon className='h-12 w-12 text-muted-foreground' />
                                </div>
                                <div className='p-4'>
                                    <h3 className='font-semibold truncate'>{image.title}</h3>
                                    <p className='text-xs text-muted-foreground'>Uploaded: {image.uploaded}</p>
                                    <div className='flex flex-wrap gap-1 mt-2'>
                                        {image.tags.map((tag, i) => (
                                            <Badge key={i} variant="outline" className={`font-normal ${image.tagColors[i]}`}>{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
