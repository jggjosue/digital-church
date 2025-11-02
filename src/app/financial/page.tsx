'use client';

import * as React from 'react';
import {
  Download,
  Search,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { incomeExpenseData, budgetSpendingData, recentTransactions } from '@/lib/data';


const chartConfig = {
  net: {
    label: 'Neto',
    color: 'hsl(var(--primary))',
  },
  spent: {
    label: 'Gastado',
    color: 'hsl(var(--primary))',
  },
  budget: {
    label: 'Presupuesto',
    color: 'hsl(var(--muted))',
  },
};

export default function FinancialPage() {
  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <main className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Reportes Financieros
          </h1>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>

        <Tabs defaultValue="year-to-date">
          <TabsList>
            <TabsTrigger value="last-month">Mes Pasado</TabsTrigger>
            <TabsTrigger value="this-quarter">Este Trimestre</TabsTrigger>
            <TabsTrigger value="year-to-date">Año Actual</TabsTrigger>
            <TabsTrigger value="custom-range">Rango Personalizado</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Diezmos y Ofrendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$45,280.50</div>
              <p className="text-xs text-green-600">+5.2% del año pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Gastos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$21,745.00</div>
              <p className="text-xs text-red-600">+8.1% del año pasado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Posición Neta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$23,535.50</div>
              <p className="text-xs text-green-600">+2.3% del año pasado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos vs. Gastos a lo Largo del Tiempo</CardTitle>
              <p className="text-2xl font-bold text-muted-foreground">$23,535.50 <span className='text-lg'>Neto</span></p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <LineChart
                  accessibilityLayer
                  data={incomeExpenseData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Line
                    dataKey="net"
                    type="natural"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Presupuesto vs. Gasto Real</CardTitle>
               <p className="text-2xl font-bold text-muted-foreground">$15,800 <span className='text-lg'>Gastado este mes</span></p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <BarChart accessibilityLayer data={budgetSpendingData}>
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                   <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar
                    dataKey="spent"
                    stackId="a"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                   <Bar
                    dataKey="budget"
                    stackId="a"
                    fill="hsl(var(--muted))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transacciones Recientes</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar transacciones..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fondo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.fund}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.amount > 0 ? '' : '-'}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
