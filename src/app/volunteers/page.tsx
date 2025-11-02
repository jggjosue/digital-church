'use client';

import * as React from 'react';
import {
  Search,
  Edit,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { volunteersData } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

type Volunteer = (typeof volunteersData)[0];

export default function VolunteersPage() {
  const [selectedVolunteer, setSelectedVolunteer] = React.useState<Volunteer>(
    volunteersData[0]
  );

  return (
    <main className="flex h-screen bg-muted/20">
      <aside className="w-[380px] border-r bg-background flex flex-col">
        <div className="p-6">
          <h1 className="text-3xl font-bold">Volunteer Management</h1>
          <p className="text-muted-foreground mt-1">
            View, manage, and schedule all church volunteers.
          </p>
        </div>
        <div className="px-6 pb-4 flex gap-2">
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add New Volunteer
            </Button>
        </div>
        <div className="px-6 pb-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by volunteer name..." className="pl-9" />
            </div>
            <div className="flex gap-2 mt-2">
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="Role: All" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="leader">Youth Group Leader</SelectItem>
                    <SelectItem value="tech">AV Tech</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="Skill: All" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="childcare">Childcare</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="Availability: All" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Any Availability</SelectItem>
                    <SelectItem value="sunday-morning">Sunday Mornings</SelectItem>
                    <SelectItem value="wed-evening">Wednesday Evenings</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 space-y-2 pb-6">
          {volunteersData.map((volunteer) => (
            <div
              key={volunteer.id}
              className={`p-3 rounded-lg cursor-pointer flex items-center gap-4 transition-colors ${
                selectedVolunteer.id === volunteer.id
                  ? 'bg-primary/10 text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedVolunteer(volunteer)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={volunteer.avatarUrl} alt={volunteer.name} />
                <AvatarFallback>
                  {volunteer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{volunteer.name}</p>
                <p className="text-sm text-muted-foreground">{volunteer.role}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 p-8 overflow-y-auto">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={selectedVolunteer.avatarUrl} alt={selectedVolunteer.name} />
                        <AvatarFallback>{selectedVolunteer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{selectedVolunteer.name}</h2>
                        <p className="text-muted-foreground">{selectedVolunteer.email} | {selectedVolunteer.phone}</p>
                        <div className="flex gap-8 mt-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Hours Served</p>
                                <p className="text-lg font-semibold">{selectedVolunteer.hoursServed}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Next Serving</p>
                                <p className="text-lg font-semibold">{selectedVolunteer.nextServing}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Background Check</p>
                                <Badge variant={selectedVolunteer.backgroundCheck === 'Passed' ? 'default' : 'destructive'} className={selectedVolunteer.backgroundCheck === 'Passed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                    {selectedVolunteer.backgroundCheck}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="grid grid-cols-1 gap-6 mt-4">
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <h3 className="font-semibold text-lg">Skills & Interests</h3>
                        <Button variant="link" className="p-0 h-auto">Add Skill</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {selectedVolunteer.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">{skill}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <h3 className="font-semibold text-lg">General Availability</h3>
                        <Button variant="link" className="p-0 h-auto">Edit Availability</Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                        {Object.entries(selectedVolunteer.availability).map(([day, times]) => (
                            <Card key={day} className="p-4 bg-muted/50">
                                <p className="font-semibold">{day}</p>
                                <div className="mt-2 space-y-2">
                                    {times.map(time => (
                                        <div key={time.time} className="flex items-center gap-2">
                                            {time.available ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                            <span className="text-sm">{time.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <h3 className="font-semibold text-lg">Admin Notes</h3>
                        <Button variant="link" className="p-0 h-auto">Add Note</Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {selectedVolunteer.adminNotes || 'No admin notes for this volunteer.'}
                        </p>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <div className="p-6 text-center text-muted-foreground">
                Volunteer schedule management coming soon.
            </div>
          </TabsContent>
          <TabsContent value="assignments">
            <div className="p-6 text-center text-muted-foreground">
                Volunteer assignment tracking coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
