
'use client';

import * as React from 'react';
import {
  Search,
  Lock,
  Globe,
  Plus,
  Users,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { prayerRequestsData } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';

type PrayerRequest = typeof prayerRequestsData[0];

const statusColors: { [key: string]: string } = {
  Activo: 'bg-blue-100 text-blue-800 border-blue-200',
  Respondido: 'bg-green-100 text-green-800 border-green-200',
};

const privacyIcons: { [key: string]: React.ReactNode } = {
    Público: <Globe className="h-4 w-4 text-muted-foreground" />,
    'Solo Personal': <Lock className="h-4 w-4 text-muted-foreground" />,
  };

export default function PrayerRequestsPage() {
  const [activeFilters, setActiveFilters] = React.useState({
    status: [] as string[],
    privacy: [] as string[],
    group: 'all',
  });
  const [filteredData, setFilteredData] = React.useState<PrayerRequest[]>(prayerRequestsData);
  const [selectedTab, setSelectedTab] = React.useState('all-requests');
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleFilterChange = <K extends keyof typeof activeFilters>(key: K, value: string) => {
    setActiveFilters(prev => {
        if (key === 'status' || key === 'privacy') {
            const list = (prev[key] as string[]).includes(value)
                ? (prev[key] as string[]).filter(item => item !== value)
                : [...prev[key], value];
            return { ...prev, [key]: list };
        }
        return { ...prev, [key]: value };
    });
  };

  const applyFilters = React.useCallback(() => {
    let data = prayerRequestsData;

    if (selectedTab === 'my-requests') {
        data = data.filter(req => req.submittedBy === 'John Doe');
    } else if (selectedTab === 'answered') {
        data = data.filter(req => req.status === 'Respondido');
    }

    if (activeFilters.status.length > 0) {
        data = data.filter(req => activeFilters.status.includes(req.status));
    }
    if (activeFilters.privacy.length > 0) {
        data = data.filter(req => activeFilters.privacy.includes(req.privacy));
    }

    setFilteredData(data);
  }, [activeFilters, selectedTab]);

  const clearFilters = () => {
    setActiveFilters({
        status: [],
        privacy: [],
        group: 'all',
    });
  };

  React.useEffect(() => {
    applyFilters();
  }, [activeFilters, applyFilters]);


  const renderTableBody = (data: PrayerRequest[]) => (
    <TableBody>
      {data.map((request) => (
        <TableRow key={request.id}>
          <TableCell><Checkbox /></TableCell>
          <TableCell>
            <div className="font-medium">{request.title}</div>
            <div className="text-sm text-muted-foreground">{request.description}</div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
                <Avatar className='h-8 w-8'>
                    <AvatarImage src={request.submittedByAvatar} alt={request.submittedBy} />
                    <AvatarFallback>{request.submittedBy.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{request.submittedBy}</span>
            </div>
          </TableCell>
          <TableCell>{request.date}</TableCell>
          <TableCell>
            <Badge variant="outline" className={statusColors[request.status as keyof typeof statusColors]}>
              {request.status}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
                {privacyIcons[request.privacy as keyof typeof privacyIcons]}
                <span>{request.privacy}</span>
            </div>
          </TableCell>
          <TableCell className="text-right">
            <Button variant="link" className="text-primary">Detalles</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const FiltersComponent = () => (
    <>
        <h2 className="text-xl font-bold">Filtros</h2>
        <div className="mt-6 space-y-6">
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id="active-filter" onCheckedChange={() => handleFilterChange('status', 'Activo')} checked={activeFilters.status.includes('Activo')} />
                        <Label htmlFor="active-filter" className="text-sm font-normal">Activo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="answered-filter" onCheckedChange={() => handleFilterChange('status', 'Respondido')} checked={activeFilters.status.includes('Respondido')} />
                        <Label htmlFor="answered-filter" className="text-sm font-normal">Respondido</Label>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground">Privacidad</h3>
                <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id="public-filter" onCheckedChange={() => handleFilterChange('privacy', 'Público')} checked={activeFilters.privacy.includes('Público')} />
                        <Label htmlFor="public-filter" className="text-sm font-normal">Público</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="staff-only-filter" onCheckedChange={() => handleFilterChange('privacy', 'Solo Personal')} checked={activeFilters.privacy.includes('Solo Personal')} />
                        <Label htmlFor="staff-only-filter" className="text-sm font-normal">Solo Personal</Label>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="text-sm font-medium text-muted-foreground">Grupo de Oración</h3>
                <Select value={activeFilters.group} onValueChange={(value) => handleFilterChange('group', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Todos los Grupos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Grupos</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 pt-4">
                <Button className="w-full" onClick={applyFilters}>Aplicar Filtros</Button>
                <Button variant="ghost" className="w-full" onClick={clearFilters}>Limpiar Todo</Button>
            </div>
        </div>
    </>
  );


  return (
    <div className="flex flex-col flex-1">
        <AppHeader
            title="Peticiones de Oración"
            description="Gestione las peticiones de oración y los informes de alabanza."
        >
            <div className="flex gap-2">
                <Button variant="outline"><Users className="mr-2 h-4 w-4" /> Gestionar Grupos</Button>
                <Button asChild><Link href="/prayer/new"><Plus className="mr-2 h-4 w-4" /> Nueva Petición de Oración</Link></Button>
            </div>
        </AppHeader>
        <main className="flex flex-1 bg-muted/20">
      <aside className="w-80 border-r bg-background p-6 hidden md:block">
        <FiltersComponent />
      </aside>

      <div className="flex-1 p-4 sm:p-8">
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="all-requests" onValueChange={setSelectedTab}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                     <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar peticiones o nombres..." className="pl-9" />
                    </div>
                    <div className="flex w-full sm:w-auto items-center justify-between gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="md:hidden flex-1">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Filtros
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-6">
                                <FiltersComponent />
                            </SheetContent>
                        </Sheet>
                        <TabsList className="grid grid-cols-3 flex-1 sm:inline-flex">
                            <TabsTrigger value="all-requests">Todas</TabsTrigger>
                            <TabsTrigger value="my-requests">Mis Peticiones</TabsTrigger>
                            <TabsTrigger value="answered">Respondidas</TabsTrigger>
                        </TabsList>
                    </div>
                </div>
              <TabsContent value="all-requests">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"><Checkbox /></TableHead>
                        <TableHead>PETICIÓN</TableHead>
                        <TableHead>ENVIADO POR</TableHead>
                        <TableHead>FECHA</TableHead>
                        <TableHead>ESTADO</TableHead>
                        <TableHead>PRIVACIDAD</TableHead>
                        <TableHead className="text-right">ACCIONES</TableHead>
                      </TableRow>
                    </TableHeader>
                    {renderTableBody(filteredData)}
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="my-requests">
                 <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"><Checkbox /></TableHead>
                        <TableHead>PETICIÓN</TableHead>
                        <TableHead>ENVIADO POR</TableHead>
                        <TableHead>FECHA</TableHead>
                        <TableHead>ESTADO</TableHead>
                        <TableHead>PRIVACIDAD</TableHead>
                        <TableHead className="text-right">ACCIONES</TableHead>
                      </TableRow>
                    </TableHeader>
                    {renderTableBody(filteredData)}
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="answered">
                 <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"><Checkbox /></TableHead>
                        <TableHead>PETICIÓN</TableHead>
                        <TableHead>ENVIADO POR</TableHead>
                        <TableHead>FECHA</TableHead>
                        <TableHead>ESTADO</TableHead>
                        <TableHead>PRIVACIDAD</TableHead>
                        <TableHead className="text-right">ACCIONES</TableHead>
                      </TableRow>
                    </TableHeader>
                    {renderTableBody(filteredData)}
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
    </div>
  );
}
