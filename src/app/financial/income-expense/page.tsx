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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function IncomeExpensePage() {
  const { income, expenses, totalIncome, totalExpenses, netIncome } = incomeStatementData;

  return (
    <main className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Income & Expense Statement
          </h1>
          <p className="text-muted-foreground">January 1, 2023 - August 31, 2023</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>Jan 1, 2023 - Aug 31, 2023</span>
        </Button>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Funds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Funds</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <div className="space-y-6">
                {/* Income Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Income</h2>
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
                        <p>Total Income</p>
                        <p className="text-green-600">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>

                 {/* Expenses Section */}
                 <div>
                    <h2 className="text-2xl font-semibold mb-4">Expenses</h2>
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
                        <p>Total Expenses</p>
                        <p className="text-red-600">{formatCurrency(totalExpenses)}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 bg-muted/50 p-4 rounded-lg">
                 <div className="flex justify-between items-center font-bold text-xl">
                    <p>Net Income</p>
                    <p>{formatCurrency(netIncome)}</p>
                </div>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
