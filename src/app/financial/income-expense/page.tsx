'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Download, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
};

type SummaryItem = {
  label: string;
  amount: number;
};

export default function IncomeExpensePage() {
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(new Date().getFullYear().toString());

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/financial/summary?year=${year}`)
      .then(res => res.json())
      .then(data => {
        if (mounted && !data.error) setSummary(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [year]);

  const income: SummaryItem[] = summary?.income || [];
  const expenses: SummaryItem[] = summary?.expenses || [];
  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const netIncome = summary?.netIncome || 0;

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Estado de Ingresos y Gastos"
        description="Resumen financiero actualizado según las transacciones registradas."
      >
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </AppHeader>
      <main className="flex-1 space-y-6 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
            <CalendarIcon className="h-4 w-4" />
            <span>Filtro de fechas general</span>
          </Button>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todas las Categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todos los Fondos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Fondos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Ingresos</h2>
                  {income.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay ingresos registrados</p>
                  ) : (
                    <div className="space-y-3">
                      {income.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <p className="text-muted-foreground">{item.label}</p>
                          <p className="font-medium">{formatCurrency(item.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center font-bold">
                    <p>Ingresos Totales</p>
                    <p className="text-green-600">{formatCurrency(totalIncome)}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-4">Gastos</h2>
                  {expenses.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay gastos registrados</p>
                  ) : (
                    <div className="space-y-3">
                      {expenses.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <p className="text-muted-foreground">{item.label}</p>
                          <p className="font-medium">{formatCurrency(item.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center font-bold">
                    <p>Gastos Totales</p>
                    <p className="text-red-600">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>

                <div className="mt-8 bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center font-bold text-xl">
                    <p>Ingreso Neto</p>
                    <p className={netIncome >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(netIncome)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
