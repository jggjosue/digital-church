
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
import { CalendarIcon, Download, SlidersHorizontal, Landmark } from 'lucide-react';
import { incomeStatementData } from '@/lib/data';
import { AppHeader } from '@/components/app-header';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function IncomeExpensePage() {
  const { income, expenses, totalIncome, totalExpenses, netIncome } = incomeStatementData;

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Estado de Ingresos y Gastos"
        description="1 de Enero, 2023 - 31 de Agosto, 2023"
      >
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </AppHeader>
    <main className="flex-1 space-y-6 p-8">
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
            <SelectValue placeholder="Todos los Fondos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Fondos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <div className="space-y-6">
                {/* Income Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Ingresos</h2>
                    <div className="space-y-3">
                        {income.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <p className="text-muted-foreground">{item.label}</p>
                                <p className="font-medium">{formatCurrency(item.amount)}</p>
                            </div>
                        ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center font-bold">
                        <p>Ingresos Totales</p>
                        <p className="text-green-600">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>

                 {/* Expenses Section */}
                 <div>
                    <h2 className="text-2xl font-semibold mb-4">Gastos</h2>
                    <div className="space-y-3">
                        {expenses.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <p className="text-muted-foreground">{item.label}</p>
                                <p className="font-medium">{formatCurrency(item.amount)}</p>
                            </div>
                        ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center font-bold">
                        <p>Gastos Totales</p>
                        <p className="text-red-600">{formatCurrency(totalExpenses)}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 bg-muted/50 p-4 rounded-lg">
                 <div className="flex justify-between items-center font-bold text-xl">
                    <p>Ingreso Neto</p>
                    <p>{formatCurrency(netIncome)}</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
