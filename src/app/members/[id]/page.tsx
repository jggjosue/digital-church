'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Home,
  Cake,
  UserPlus,
  Users,
  MessageSquare,
  FileText,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const member = {
    id: 1,
    name: 'John Doe',
    status: 'Active Member',
    avatarUrl: 'https://picsum.photos/seed/1/100/100',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    address: '123 Main St, Anytown, USA 12345',
    dob: 'January 1, 1980',
    family: [
        { id: 1, name: 'Jane Doe', relation: 'Spouse', avatarUrl: 'https://picsum.photos/seed/2/40/40' },
        { id: 2, name: 'Jimmy Doe', relation: 'Child', avatarUrl: 'https://picsum.photos/seed/3/40/40' },
    ],
    groups: ['Volunteers', 'Choir', "Men's Bible Study"],
    activity: [
        { id: 1, type: 'Profile created', by: 'Admin User', date: 'Jan 23, 2023', icon: UserPlus },
        { id: 2, type: 'Added to group Volunteers', by: '', date: 'Feb 10, 2023', icon: Users },
        { id: 3, type: 'Sent email: "Welcome to the Choir!"', by: '', date: 'Mar 05, 2023', icon: MessageSquare },
        { id: 4, type: 'Note added by Jane Smith', by: '', date: 'Apr 12, 2023', icon: FileText },
    ]
};

const groupColors: { [key: string]: string } = {
    Volunteers: 'bg-blue-100 text-blue-800 border-blue-200',
    Choir: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    "Men's Bible Study": 'bg-purple-100 text-purple-800 border-purple-200',
  };

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the member data based on params.id
  
  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{member.name}</h1>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 font-medium">
              <span className="h-2 w-2 rounded-full mr-2 bg-green-500"></span>
              {member.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Editar Perfil</Button>
          <Button><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{member.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{member.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Cake className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{member.dob}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Familia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {member.family.map(familyMember => (
                    <div key={familyMember.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={familyMember.avatarUrl} />
                            <AvatarFallback>{familyMember.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{familyMember.name}</p>
                            <p className="text-sm text-muted-foreground">{familyMember.relation}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grupos y Ministerios</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {member.groups.map(group => (
                    <Badge key={group} variant="outline" className={groupColors[group] || 'bg-gray-100 text-gray-800'}>{group}</Badge>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
                <Tabs defaultValue="activity">
                    <TabsList>
                        <TabsTrigger value="activity">Actividad</TabsTrigger>
                        <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                        <TabsTrigger value="giving">Donaciones</TabsTrigger>
                        <TabsTrigger value="notes">Notas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="activity" className="mt-4">
                        <ul className="space-y-6">
                            {member.activity.map(item => (
                                <li key={item.id} className="flex items-start gap-4 relative">
                                    <div className="absolute left-5 top-5 -bottom-5 w-px bg-border -z-10"></div>
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-grow flex items-center justify-between pt-2">
                                        <p className="text-sm">{item.type} <span className="font-medium">{item.by}</span></p>
                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </TabsContent>
                    <TabsContent value="attendance" className="mt-4 p-4 text-center text-muted-foreground">
                        El historial de asistencia estará disponible próximamente.
                    </TabsContent>
                    <TabsContent value="giving" className="mt-4 p-4 text-center text-muted-foreground">
                        El historial de donaciones estará disponible próximamente.
                    </TabsContent>
                     <TabsContent value="notes" className="mt-4 p-4 text-center text-muted-foreground">
                        La sección de notas estará disponible próximamente.
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
