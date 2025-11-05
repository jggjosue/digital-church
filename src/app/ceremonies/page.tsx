
'use client';

import * as React from 'react';
import {
  Search,
  Heart,
  Droplet,
  Smile,
  Plus,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';

const ceremonyData = [
  {
    type: 'Baptism',
    icon: Droplet,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-500',
    date: 'October 22, 2023',
    title: 'Baptism of Emily White',
    details: 'Officiated by: Pastor David Chen',
  },
  {
    type: 'Marriage',
    icon: Heart,
    iconBgColor: 'bg-pink-100',
    iconColor: 'text-pink-500',
    date: 'September 15, 2023',
    title: 'Marriage of Michael Johnson & Jessica Lee',
    details: 'Witnesses: Sarah Brown, Chris Wilson',
  },
  {
    type: 'Child Dedication',
    icon: Smile,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-500',
    date: 'August 05, 2023',
    title: 'Child Dedication for Olivia Rodriguez',
    details: 'Parents: Liam & Maria Rodriguez',
  },
];

export default function CeremoniesPage() {
  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Historical Records"
        description="Search and view the church's event archive."
      >
        <div className="flex gap-2">
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" /> Export Data</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Record</Button>
        </div>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card>
        <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    <div>
                        <label htmlFor="event-type" className="text-sm font-medium text-muted-foreground">Event Type</label>
                         <Select>
                            <SelectTrigger id="event-type" className="w-full mt-1">
                            <SelectValue placeholder="All Events" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="baptism">Baptism</SelectItem>
                            <SelectItem value="marriage">Marriage</SelectItem>
                            <SelectItem value="dedication">Child Dedication</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label htmlFor="date-range" className="text-sm font-medium text-muted-foreground">Date Range</label>
                        <Input id="date-range" placeholder="Jan 1, 2023 - Dec 31, 2023" className="mt-1" />
                    </div>
                     <div>
                        <label htmlFor="search-person" className="text-sm font-medium text-muted-foreground">Search by Person</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="search-person" placeholder="e.g., John Smith" className="pl-9" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {ceremonyData.map((ceremony, index) => (
                    <div key={index} className="flex items-start gap-4 sm:gap-6">
                        <div className="flex flex-col items-center">
                            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${ceremony.iconBgColor}`}>
                                <ceremony.icon className={`h-5 w-5 ${ceremony.iconColor}`} />
                            </div>
                            {index < ceremonyData.length - 1 && (
                                <div className="w-px h-full bg-border mt-2 flex-1"></div>
                            )}
                        </div>
                        <div className="flex-1 pb-8">
                            <Card>
                                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{ceremony.date}</p>
                                        <h3 className="text-lg font-bold mt-1">{ceremony.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">{ceremony.details}</p>
                                    </div>
                                    <Button variant="link" className="p-0 h-auto self-start sm:self-center">View Details</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ))}
            </div>

        </CardContent>
      </Card>
    </main>
    </div>
  );
}
