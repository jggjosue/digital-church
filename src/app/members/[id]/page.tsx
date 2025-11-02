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
    fullName: 'John Michael Doe',
    preferredName: 'John',
    gender: 'Male',
    maritalStatus: 'Married',
    baptismDate: 'April 12, 2010',
    status: 'Active Member',
    avatarUrl: 'https://picsum.photos/seed/1/100/100',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    address: '123 Main St, Anytown, USA 12345',
    dob: 'October 25, 1985',
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
    ],
    attendance: {
        overall: '85%',
        last3Months: '92%',
        absencesYTD: 4,
        lastAttended: 'Oct 29, 2023',
    },
    giving: {
        ytd: 2400.00,
        lastYear: 3250.00,
        lastGiftAmount: 100.00,
        lastGiftDate: 'Oct 22, 2023',
    },
    notes: [
        { id: 1, author: 'Jane Smith', date: 'Apr 12, 2023', content: 'John expresó interés en unirse al equipo de bienvenida. Hice un seguimiento con él y está emocionado de comenzar a servir el próximo mes.' },
        { id: 2, author: 'Pastor John', date: 'Feb 28, 2023', content: 'Me reuní con John para tomar un café y discutir sus metas espirituales. Parece estar en un buen lugar y buscando crecer en su fe.' },
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
          <Button variant="outline" asChild><Link href={`/members/${params.id}/edit`}><Edit className="mr-2 h-4 w-4" /> Editar Perfil</Link></Button>
          <Button><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                        <p className='text-muted-foreground'>Nombre Completo</p>
                        <p className='font-medium'>{member.fullName}</p>
                    </div>
                    <div>
                        <p className='text-muted-foreground'>Nombre Preferido</p>
                        <p className='font-medium'>{member.preferredName}</p>
                    </div>
                    <div>
                        <p className='text-muted-foreground'>Fecha de Nacimiento</p>
                        <p className='font-medium'>{member.dob}</p>
                    </div>
                    <div>
                        <p className='text-muted-foreground'>Género</p>
                        <p className='font-medium'>{member.gender}</p>
                    </div>
                     <div>
                        <p className='text-muted-foreground'>Estado Civil</p>
                        <p className='font-medium'>{member.maritalStatus}</p>
                    </div>
                     <div>
                        <p className='text-muted-foreground'>Fecha de Bautismo</p>
                        <p className='font-medium'>{member.baptismDate}</p>
                    </div>
                    <div className='col-span-2'>
                        <p className='text-muted-foreground'>Correo Electrónico</p>
                        <p className='font-medium'>{member.email}</p>
                    </div>
                    <div className='col-span-2'>
                        <p className='text-muted-foreground'>Teléfono</p>
                        <p className='font-medium'>{member.phone}</p>
                    </div>
                    <div className='col-span-2'>
                        <p className='text-muted-foreground'>Dirección</p>
                        <p className='font-medium'>{member.address}</p>
                    </div>
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

        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Resumen de Asistencia</CardTitle>
                    <Button variant="link" className='p-0 h-auto' asChild>
                        <Link href={`/members/${params.id}/attendance`}>Ver Historial Completo</Link>
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className='bg-muted/50 p-4 rounded-lg text-center'>
                        <p className='text-3xl font-bold'>{member.attendance.overall}</p>
                        <p className='text-sm text-muted-foreground'>Total</p>
                    </div>
                    <div className='bg-muted/50 p-4 rounded-lg text-center'>
                        <p className='text-3xl font-bold'>{member.attendance.last3Months}</p>
                        <p className='text-sm text-muted-foreground'>Últimos 3 Meses</p>
                    </div>
                    <div className='bg-muted/50 p-4 rounded-lg text-center'>
                        <p className='text-3xl font-bold'>{member.attendance.absencesYTD}</p>
                        <p className='text-sm text-muted-foreground'>Ausencias (YTD)</p>
                    </div>
                    <div className='bg-muted/50 p-4 rounded-lg text-center'>
                        <p className='text-lg font-bold'>{member.attendance.lastAttended}</p>
                        <p className='text-sm text-muted-foreground'>Última Asistencia</p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Resumen de Donaciones</CardTitle>
                     <Button variant="link" className='p-0 h-auto' asChild>
                        <Link href={`/members/${params.id}/donations`}>Ver Historial Completo</Link>
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className='bg-muted/50 p-4 rounded-lg'>
                        <p className='text-sm text-muted-foreground'>Donaciones YTD</p>
                        <p className='text-2xl font-bold'>${member.giving.ytd.toFixed(2)}</p>
                    </div>
                    <div className='bg-muted/50 p-4 rounded-lg'>
                        <p className='text-sm text-muted-foreground'>Donaciones del Año Pasado</p>
                        <p className='text-2xl font-bold'>${member.giving.lastYear.toFixed(2)}</p>
                    </div>
                    <div className='bg-muted/50 p-4 rounded-lg'>
                        <p className='text-sm text-muted-foreground'>Última Donación</p>
                        <p className='text-lg font-bold'>${member.giving.lastGiftAmount.toFixed(2)} el {member.giving.lastGiftDate}</p>
                    </div>
                </CardContent>
            </Card>


          <Card>
            <CardContent className="p-4">
                <Tabs defaultValue="activity">
                    <TabsList>
                        <TabsTrigger value="activity">Actividad</TabsTrigger>
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
                     <TabsContent value="notes" className="mt-4">
                        <div className="space-y-4">
                            {member.notes.map(note => (
                                <div key={note.id} className="p-4 rounded-lg border bg-muted/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold text-sm">{note.author}</p>
                                        <p className="text-xs text-muted-foreground">{note.date}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{note.content}</p>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
