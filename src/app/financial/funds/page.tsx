'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { fundBalancesData } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const formatCurrency = (amount: number, showSign = false) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    if (showSign) {
        return amount < 0 ? `(${formatted})` : formatted;
    }
    if (amount < 0) {
        return `(${formatted})`
    }
    return formatted;
};

const statusColors: { [key: string]: string } = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function FundBalancesPage() {
    const { totalBalance, activeFunds, totalInflows, totalOutflows, funds } = fundBalancesData;
  return (
    <main className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fund Balances</h1>
          <p className="text-muted-foreground">As of August 31, 2023</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Reconcile
            </Button>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Fund
            </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search funds..." className="pl-9" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Fund Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fund Types</SelectItem>
            <SelectItem value="unrestricted">Unrestricted</SelectItem>
            <SelectItem value="designated">Designated</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fund Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">Across {activeFunds} active funds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Inflows (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalInflows)}</div>
            <p className="text-xs text-muted-foreground">Year to Date Inflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Outflows (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalOutflows)}</div>
            <p className="text-xs text-muted-foreground">Year to Date Outflows</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-semibold">Fund Name</th>
                  <th className="p-4 text-left font-semibold">Fund Type</th>
                  <th className="p-4 text-right font-semibold">Current Balance</th>
                  <th className="p-4 text-right font-semibold">YTD Inflows</th>
                  <th className="p-4 text-right font-semibold">YTD Outflows</th>
                  <th className="p-4 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund, index) => (
                    <tr key={index} className="border-b">
                        <td className="p-4">
                            <div className="font-medium text-primary">{fund.name}</div>
                            <div className="text-xs text-muted-foreground">{fund.description}</div>
                        </td>
                        <td className="p-4">{fund.type}</td>
                        <td className="p-4 text-right font-medium">{formatCurrency(fund.balance)}</td>
                        <td className={cn("p-4 text-right", fund.ytdInflows > 0 ? 'text-green-600' : '')}>{formatCurrency(fund.ytdInflows)}</td>
                        <td className={cn("p-4 text-right", fund.ytdOutflows < 0 ? 'text-red-600' : '')}>{formatCurrency(fund.ytdOutflows, true)}</td>
                        <td className="p-4 text-center">
                            <Badge variant="outline" className={statusColors[fund.status]}>{fund.status}</Badge>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
