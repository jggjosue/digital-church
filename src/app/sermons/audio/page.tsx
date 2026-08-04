'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  Upload,
  Loader2,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function AudioLibraryPage() {
  const [audios, setAudios] = React.useState<SermonMedia[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
      fetch('/api/data/sermon-media')
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                setAudios(data.items.filter((m: SermonMedia) => m.type === 'audio'));
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(audios.map((s) => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((i) => i !== id));
    }
  };

  const handleDelete = async (id: string) => {
      try {
          await fetch(`/api/data/sermon-media/${id}`, { method: 'DELETE' });
          setAudios(prev => prev.filter(a => a.id !== id));
      } catch (err) {
          console.error(err);
      }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Audio Library"
        description="Manage sermon audio, podcasts, and other audio content."
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload Audio
        </Button>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="audio">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search by title, speaker, or event..." className="pl-9" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                    <Button variant="outline" className="w-full">Filter by Status <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Filter by Category <ChevronDown className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="w-full">Date Range <ChevronDown className="ml-2 h-4 w-4" /></Button>
                </div>
            </div>
            <TabsList className="grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="all-media" asChild><Link href="/sermons">All Media</Link></TabsTrigger>
              <TabsTrigger value="sermons" asChild><Link href="/sermons/list">Sermons</Link></TabsTrigger>
              <TabsTrigger value="videos" asChild><Link href="/sermons/videos">Videos</Link></TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="images" asChild><Link href="/sermons/images">Images</Link></TabsTrigger>
            </TabsList>
            <TabsContent value="audio">
                <div className="overflow-x-auto min-h-[300px]">
              {loading ? (
                  <div className="flex justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selected.length > 0 &&
                          selected.length === audios.length
                        }
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead>TITLE</TableHead>
                    <TableHead>SERMON ID</TableHead>
                    <TableHead>FORMAT</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audios.map((audio) => (
                    <TableRow key={audio.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(audio.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(audio.id, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{audio.title || 'Audio sin título'}</TableCell>
                      <TableCell>{audio.sermonId}</TableCell>
                      <TableCell>{audio.mimeType || 'audio/mp3'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild><Link href={audio.url} target="_blank">View URL</Link></DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(audio.id)}>
                                Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {audios.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No hay audios registrados
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
              )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
