
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
import { sermonsData } from '@/lib/data';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';

type Sermon = (typeof sermonsData)[0];

const sermons = sermonsData.slice(0, 4);

export default function SermonsListPage() {
  const [selected, setSelected] = React.useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(sermons.map((s) => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((i) => i !== id));
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Sermons"
        description="View and manage all sermons for your church."
      >
        <Button asChild>
          <Link href="/sermons/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Sermon
          </Link>
        </Button>
      </AppHeader>
      <main className="flex-1 bg-muted/20 p-4 sm:p-8">
        <Card>
          <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
                  <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search by title, speaker, or topic..." className="pl-9" />
                  </div>
                  <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full lg:w-auto">
                      <Button variant="outline">Speaker <ChevronDown className="ml-2 h-4 w-4" /></Button>
                      <Button variant="outline">Series <ChevronDown className="ml-2 h-4 w-4" /></Button>
                      <Button variant="outline">Topic <ChevronDown className="ml-2 h-4 w-4" /></Button>
                      <Button variant="outline">Date Range <ChevronDown className="ml-2 h-4 w-4" /></Button>
                  </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selected.length > 0 &&
                            selected.length === sermons.length
                          }
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                      </TableHead>
                      <TableHead>TITLE</TableHead>
                      <TableHead>SPEAKER</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>MEDIA</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sermons.map((sermon) => (
                      <TableRow key={sermon.id}>
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(sermon.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(sermon.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{sermon.title}</div>
                          <div className="text-sm text-muted-foreground">Series: {sermon.series}</div>
                        </TableCell>
                        <TableCell>{sermon.speaker}</TableCell>
                        <TableCell>{sermon.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {sermon.id !== 3 && <Video className="h-4 w-4 text-muted-foreground" />}
                            {(sermon.id === 1 || sermon.id === 3 || sermon.id === 4) && <Mic className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
