'use client';

import * as React from 'react';
import {
  Search,
  Download,
  FileText,
  Landmark,
  ListFilter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { donationReportsData, givingData } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


const chartConfig = {
  donations: {
    label: "Donaciones",
    color: "hsl(var(--primary))",
  },
};


export default function DonationReportsPage() {
  const { totalDonations, averageDonation, newDonors, givingTrends, recentDonations } = donationReportsData;
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState<string>(currentYear.toString());
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(recentDonations.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginatedData = recentDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredGivingData = givingData.filter(d => d.year.toString() === selectedYear);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <main className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Donaciones</h1>
          <p className="text-muted-foreground">
            Genere y vea la actividad de donaciones
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por donante..." className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={currentYear.toString()}>Este Año</SelectItem>
                        <SelectItem value={(currentYear - 1).toString()}>Año Pasado</SelectItem>
                        <SelectItem value={(currentYear - 2).toString()}>Hace 2 Años</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Todos los Fondos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los Fondos</SelectItem>
                        <SelectItem value="general">Fondo General</SelectItem>
                        <SelectItem value="building">Fondo de Construcción</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Todas las Campañas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las Campañas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Estados de Cuenta
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Donaciones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalDonations.amount)}</div>
            <p className="text-xs text-muted-foreground">{totalDonations.period}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Donación Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(averageDonation.amount)}</div>
            <p className="text-xs text-muted-foreground">{averageDonation.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Donantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(newDonors.amount)}</div>
            <p className="text-xs text-muted-foreground">{newDonors.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencias de Donaciones</CardTitle>
            <CardDescription>Donaciones mensuales para el año {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <LineChart
                data={filteredGivingData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) =>
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(value as number)
                      }
                    />
                  }
                />
                <Line
                  dataKey="total"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{
                    fill: "hsl(var(--primary))",
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donante</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Fondo</TableHead>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="font-medium">{donation.donorName}</div>
                        <div className="text-sm text-muted-foreground">{donation.donorEmail}</div>
                      </TableCell>
                      <TableCell>{donation.date}</TableCell>
                      <TableCell>{donation.fund}</TableCell>
                      <TableCell>{donation.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             <div className="flex flex-col sm:flex-row items-center justify-between pt-4 px-4 gap-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, recentDonations.length)} de {recentDonations.length} resultados
                </div>
                <Pagination>
                    <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                        <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}>
                            {i + 1}
                        </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}/>
                    </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
