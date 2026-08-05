
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
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AppHeader } from '@/components/app-header';


const chartConfig = {
  net: {
    label: 'Ingresos',
    color: 'hsl(var(--primary))',
  },
  spent: {
    label: 'Gastos',
    color: 'hsl(var(--destructive))',
  },
  budget: {
    label: 'Presupuesto',
    color: 'hsl(var(--muted))',
  },
};

type SummaryData = {
  totalDonations: number;
  averageDonation: number;
  monthlyData: { month: string; total: number }[];
  income: { label: string; amount: number }[];
  expenses: { label: string; amount: number }[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
};

export default function FinancialPage() {
  const [data, setData] = React.useState<SummaryData | null>(null);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(new Date().getFullYear().toString());

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([
        fetch(`/api/financial/summary?year=${year}`).then(res => res.json()),
        fetch(`/api/data/financial-transactions?page=1&limit=5&year=${year}`).then(res => res.json())
    ]).then(([summaryData, txData]) => {
        if (mounted) {
            if (!summaryData.error) setData(summaryData);
            if (txData.items) setTransactions(txData.items);
        }
    })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [year]);

  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });

  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.monthlyData.map((m) => {
       return {
         month: m.month,
         net: m.total,
       };
    });
  }, [data]);

  return (
    <div className="flex flex-col flex-1">
    <AppHeader
        title="Reportes Financieros"
        description="Resumen del rendimiento financiero y las transacciones."
    >
        <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
        </Button>
    </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8">
    <Tabs defaultValue="year-to-date">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-4">
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
            Total Ingresos
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{data ? formatter.format(data.totalIncome) : '$0.00'}</div>
            <p className="text-xs text-muted-foreground">Año {year}</p>
        </CardContent>
        </Card>
        <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
            Gastos Totales
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{data ? formatter.format(data.totalExpenses) : '$0.00'}</div>
            <p className="text-xs text-muted-foreground">Año {year}</p>
        </CardContent>
        </Card>
        <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posición Neta</CardTitle>
        </CardHeader>
        <CardContent>
            <div className={cn("text-3xl font-bold", data && data.netIncome < 0 ? "text-destructive" : "text-green-600")}>{data ? formatter.format(data.netIncome) : '$0.00'}</div>
            <p className="text-xs text-muted-foreground">Año {year}</p>
        </CardContent>
        </Card>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
        <CardHeader>
            <CardTitle>Ingresos a lo largo del Tiempo</CardTitle>
            <p className="text-2xl font-bold text-muted-foreground">{data ? formatter.format(data.totalIncome) : '$0.00'} <span className='text-lg'>Ingresos</span></p>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <LineChart
                accessibilityLayer
                data={chartData}
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
    </div>

    <Card>
        <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Transacciones Recientes</CardTitle>
            <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar transacciones..." className="pl-9" />
            </div>
        </div>
        </CardHeader>
        <CardContent>
        <div className="overflow-x-auto">
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
            {transactions.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay transacciones registradas.
                    </TableCell>
                </TableRow>
            ) : (
                transactions.map((transaction) => {
                    const isIncome = transaction.type === 'income';
                    const amount = Number(transaction.amount) || 0;
                    return (
                        <TableRow key={transaction._id || transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString('es-ES')}</TableCell>
                            <TableCell className="font-medium">
                                {transaction.reference || transaction.description || (isIncome ? 'Ingreso' : 'Gasto')}
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>{transaction.fundId || 'Fondo General'}</TableCell>
                            <TableCell
                                className={cn(
                                'text-right font-medium',
                                isIncome ? 'text-green-600' : 'text-red-600'
                                )}
                            >
                                {isIncome ? '' : '-'}
                                {formatter.format(amount)}
                            </TableCell>
                        </TableRow>
                    );
                })
            )}
            </TableBody>
        </Table>
        </div>
        </CardContent>
    </Card>
    </main>
    </div>
  );
}
