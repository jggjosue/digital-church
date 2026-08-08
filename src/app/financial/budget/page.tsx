'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Download, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/app-header';
import { exportExcelReport } from '@/lib/export-excel';

const formatCurrency = (amount: number, showSign = false) => {
    const formatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(Math.abs(amount));

    if (showSign) {
        return amount < 0 ? `(${formatted})` : formatted;
    }
    return formatted;
};

type Transaction = {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
};

type BudgetItem = {
    category: string;
    budget: number;
    actual: number;
};

export default function BudgetReportPage() {
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(new Date().getFullYear().toString());

  React.useEffect(() => {
      setLoading(true);
      fetch(`/api/financial/summary?year=${year}`)
        .then(res => res.json())
        .then(data => {
            if (!data.error) setSummary(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
  }, [year]);

  const processData = () => {
      const actuals: Record<string, number> = {};
      let totalActualIncome = 0;
      let totalActualExpenses = 0;
      
      if (summary) {
          summary.income.forEach((i: any) => {
              actuals[i.label] = i.amount;
              totalActualIncome += i.amount;
          });
          summary.expenses.forEach((e: any) => {
              actuals[e.label] = e.amount;
              totalActualExpenses += e.amount;
          });
      }

      const incomeItems: BudgetItem[] = summary?.income ? summary.income.map((i: any) => ({
          category: i.label,
          budget: 0,
          actual: i.amount
      })) : [];

      const expenseItems: BudgetItem[] = summary?.expenses ? summary.expenses.map((e: any) => ({
          category: e.label,
          budget: 0,
          actual: e.amount
      })) : [];

      const totalBudget = 0;
      const previousPeriodBudget = 0;
      
      const income = {
          items: incomeItems,
          totalBudget: 0,
          totalActual: totalActualIncome
      };

      const expenses = {
          items: expenseItems,
          totalBudget: 0,
          totalActual: totalActualExpenses
      };

      const totalActual = totalActualIncome - totalActualExpenses;
      const netTotal = {
          budget: income.totalBudget - expenses.totalBudget,
          actual: totalActual
      };
      const variance = totalActual - totalBudget;

      return { totalBudget, totalActual, variance, previousPeriodBudget, income, expenses, netTotal };
  };

  const data = processData();

  const getProgressValue = (actual: number, budget: number) => {
    if (budget === 0) return 0;
    return (actual / budget) * 100;
  };

  const handleExport = async () => {
    const rows = [
      ...data.income.items.map((item) => [
        'Ingreso', item.category, item.budget, item.actual,
        item.actual - item.budget,
        item.budget > 0 ? item.actual / item.budget : 0,
      ]),
      ...data.expenses.items.map((item) => [
        'Gasto', item.category, item.budget, item.actual,
        item.budget - item.actual,
        item.budget > 0 ? item.actual / item.budget : 0,
      ]),
    ];
    await exportExcelReport({
      fileName: `presupuesto-${year}`,
      title: 'Reporte de Presupuesto',
      metadata: [['Año', year]],
      sections: [
        {
          name: 'Presupuesto',
          columns: ['Tipo', 'Categoría', 'Presupuesto', 'Real', 'Variación', '% utilizado'],
          rows,
          currencyColumns: [2, 3, 4],
          percentageColumns: [5],
        },
        {
          name: 'Totales',
          columns: ['Indicador', 'Presupuesto', 'Real', 'Variación'],
          rows: [
            ['Ingresos', data.income.totalBudget, data.income.totalActual, data.income.totalActual - data.income.totalBudget],
            ['Gastos', data.expenses.totalBudget, data.expenses.totalActual, data.expenses.totalBudget - data.expenses.totalActual],
            ['Total neto', data.netTotal.budget, data.netTotal.actual, data.netTotal.actual - data.netTotal.budget],
          ],
          currencyColumns: [1, 2, 3],
        },
      ],
    });
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Reporte de Presupuesto"
        description="Presupuesto base con ingresos y gastos reales dinámicos."
      >
        <Button type="button" onClick={() => void handleExport()} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
          <CalendarIcon className="h-4 w-4" />
          <span>Filtro de fechas</span>
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
                <SelectValue placeholder="Todos los Ministerios" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los Ministerios</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {loading ? (
           <div className="flex justify-center p-12">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
      ) : (
      <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(data.totalBudget)}</div>
                <p className="text-xs text-muted-foreground">vs {formatCurrency(data.previousPeriodBudget)} Período Anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Real Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(data.totalActual)}</div>
                <p className="text-xs text-muted-foreground">Ingresos - Gastos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Variación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-3xl font-bold", data.variance > 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(data.variance)}</div>
                <p className="text-xs text-muted-foreground">Sobre el Presupuesto</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-semibold">Categoría</th>
                      <th className="p-4 text-right font-semibold">Presupuesto</th>
                      <th className="p-4 text-right font-semibold">Real</th>
                      <th className="p-4 text-right font-semibold">Variación</th>
                      <th className="p-4 text-left font-semibold">% del Presupuesto Usado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold bg-muted/50">
                      <td className="p-4">Ingresos</td>
                      <td className="p-4 text-right">{formatCurrency(data.income.totalBudget)}</td>
                      <td className="p-4 text-right">{formatCurrency(data.income.totalActual)}</td>
                      <td className={cn("p-4 text-right", (data.income.totalActual - data.income.totalBudget) > 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(data.income.totalActual - data.income.totalBudget)}</td>
                      <td className="p-4"></td>
                    </tr>
                    {data.income.items.map((item, index) => {
                        const variance = item.actual - item.budget;
                        return (
                            <tr key={`income-${index}`} className="border-b">
                                <td className="p-4 pl-8 text-muted-foreground">{item.category}</td>
                                <td className="p-4 text-right">{formatCurrency(item.budget)}</td>
                                <td className="p-4 text-right">{formatCurrency(item.actual)}</td>
                                <td className={cn("p-4 text-right", variance > 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(variance, true)}</td>
                                <td className="p-4"><Progress value={getProgressValue(item.actual, item.budget)} className={cn(getProgressValue(item.actual, item.budget) > 100 ? '[&>div]:bg-green-600' : '')} /></td>
                            </tr>
                        )
                    })}
                     <tr className="font-bold bg-muted/50">
                      <td className="p-4">Gastos</td>
                      <td className="p-4 text-right">{formatCurrency(data.expenses.totalBudget)}</td>
                      <td className="p-4 text-right">{formatCurrency(data.expenses.totalActual)}</td>
                      <td className={cn("p-4 text-right", (data.expenses.totalBudget - data.expenses.totalActual) > 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(data.expenses.totalBudget - data.expenses.totalActual)}</td>
                      <td className="p-4"></td>
                    </tr>
                    {data.expenses.items.length === 0 ? (
                      <tr className="border-b">
                        <td colSpan={5} className="p-4 text-center text-xs text-muted-foreground">No hay gastos ni deducciones registradas</td>
                      </tr>
                    ) : (
                      data.expenses.items.map((item, index) => {
                         const variance = item.budget - item.actual;
                         const progress = getProgressValue(item.actual, item.budget);
                         return (
                            <tr key={`expense-${index}`} className="border-b">
                                <td className="p-4 pl-8 text-muted-foreground">{item.category}</td>
                                <td className="p-4 text-right">{formatCurrency(item.budget)}</td>
                                <td className="p-4 text-right">{formatCurrency(item.actual)}</td>
                                <td className={cn("p-4 text-right", variance < 0 ? 'text-red-600' : 'text-green-600')}>{formatCurrency(variance, true)}</td>
                                <td className="p-4"><Progress value={progress} className={cn(progress > 100 ? '[&>div]:bg-red-600' : '')} /></td>
                            </tr>
                         )
                      })
                    )}
                    <tr className="font-bold bg-muted/50 border-t-2">
                        <td className="p-4">Total Neto</td>
                        <td className="p-4 text-right">{formatCurrency(data.netTotal.budget)}</td>
                        <td className="p-4 text-right">{formatCurrency(data.netTotal.actual)}</td>
                        <td className={cn("p-4 text-right", (data.netTotal.actual - data.netTotal.budget) > 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(data.netTotal.actual - data.netTotal.budget)}</td>
                        <td className="p-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </>
      )}
    </main>
    </div>
  );
}
