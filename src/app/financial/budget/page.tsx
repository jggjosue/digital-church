'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Download, SlidersHorizontal } from 'lucide-react';
import { budgetReportData } from '@/lib/data';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number, showSign = false) => {
    const formatted = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    if (showSign) {
        return amount < 0 ? `(${formatted})` : formatted;
    }
    return formatted;
};

export default function BudgetReportPage() {
  const { totalBudget, totalActual, variance, previousPeriodBudget, income, expenses, netTotal } = budgetReportData;

  const getProgressValue = (actual: number, budget: number) => {
    if (budget === 0) return 0;
    return (actual / budget) * 100;
  };

  return (
    <main className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reporte de Presupuesto</h1>
          <p className="text-muted-foreground">1 de Enero, 2023 - 31 de Agosto, 2023</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>1 de Ene, 2023 - 31 de Ago, 2023</span>
        </Button>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas las Categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
          </SelectContent>
        </Select>
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los Ministerios" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los Ministerios</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">vs {formatCurrency(previousPeriodBudget)} Período Anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Real Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalActual)}</div>
            <p className="text-xs text-muted-foreground">Ingresos - Gastos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", variance > 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(variance)}</div>
            <p className="text-xs text-muted-foreground">+1.5% Sobre el Presupuesto</p>
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
                  <td className="p-4 text-right">{formatCurrency(income.totalBudget)}</td>
                  <td className="p-4 text-right">{formatCurrency(income.totalActual)}</td>
                  <td className={cn("p-4 text-right", (income.totalActual - income.totalBudget) > 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(income.totalActual - income.totalBudget)}</td>
                  <td className="p-4"></td>
                </tr>
                {income.items.map((item, index) => {
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
                  <td className="p-4 text-right">{formatCurrency(expenses.totalBudget)}</td>
                  <td className="p-4 text-right">{formatCurrency(expenses.totalActual)}</td>
                  <td className={cn("p-4 text-right", (expenses.totalBudget - expenses.totalActual) > 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(expenses.totalBudget - expenses.totalActual)}</td>
                  <td className="p-4"></td>
                </tr>
                {expenses.items.map((item, index) => {
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
                })}
                <tr className="font-bold bg-muted/50 border-t-2">
                    <td className="p-4">Total Neto</td>
                    <td className="p-4 text-right">{formatCurrency(netTotal.budget)}</td>
                    <td className="p-4 text-right">{formatCurrency(netTotal.actual)}</td>
                    <td className={cn("p-4 text-right", (netTotal.actual - netTotal.budget) > 0 ? 'text-green-600' : 'text-red-600')}>{formatCurrency(netTotal.actual - netTotal.budget)}</td>
                    <td className="p-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
