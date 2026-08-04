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
import { Search, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { fundBalancesData } from '@/lib/data';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/app-header';

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
    if (amount < 0) {
        return `(${formatted})`
    }
    return formatted;
};

const statusColors: { [key: string]: string } = {
    Activo: 'bg-green-100 text-green-800 border-green-200',
    Inactivo: 'bg-gray-100 text-gray-800 border-gray-200',
};

type Transaction = {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    fundId: string;
};

export default function FundBalancesPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
      fetch('/api/data/financial-transactions')
        .then(res => res.json())
        .then(data => {
            if (data.items) {
                setTransactions(data.items);
            }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  const processData = () => {
      const fundStats: Record<string, { inflows: number, outflows: number }> = {};
      
      transactions.forEach(t => {
          if (!t.fundId) return;
          if (!fundStats[t.fundId]) {
              fundStats[t.fundId] = { inflows: 0, outflows: 0 };
          }
          if (t.type === 'income') {
              fundStats[t.fundId].inflows += t.amount;
          } else {
              fundStats[t.fundId].outflows += t.amount;
          }
      });

      const funds = fundBalancesData.funds.map(fund => {
          const stats = fundStats[fund.name] || { inflows: 0, outflows: 0 };
          // Calculate new balance based on initial balance in fundBalancesData + new transactions
          // Assuming fund.balance is the initial balance. For a real app, initial balance would be in DB.
          // Since we don't have DB for funds, we'll just sum the transactions.
          const ytdInflows = fund.ytdInflows + stats.inflows;
          const ytdOutflows = fund.ytdOutflows - stats.outflows; // Outflows in data are negative
          const balance = fund.balance + stats.inflows - stats.outflows;

          return { ...fund, ytdInflows, ytdOutflows, balance };
      });

      const totalBalance = funds.reduce((acc, fund) => acc + fund.balance, 0);
      const totalInflows = funds.reduce((acc, fund) => acc + fund.ytdInflows, 0);
      const totalOutflows = funds.reduce((acc, fund) => acc + fund.ytdOutflows, 0);

      return {
          totalBalance,
          activeFunds: funds.filter(f => f.status === 'Activo').length,
          totalInflows,
          totalOutflows,
          funds
      };
  };

  const data = processData();

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Saldos de Fondos"
        description={`Al ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      >
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Reconciliar
            </Button>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Añadir Nuevo Fondo
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar fondos..." className="pl-9" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los Tipos de Fondos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Tipos de Fondos</SelectItem>
            <SelectItem value="unrestricted">No Restringido</SelectItem>
            <SelectItem value="designated">Designado</SelectItem>
            <SelectItem value="restricted">Restringido</SelectItem>
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
                <CardTitle className="text-sm font-medium">Saldo Total de Fondos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(data.totalBalance)}</div>
                <p className="text-xs text-muted-foreground">en {data.activeFunds} fondos activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Entradas Totales (YTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(data.totalInflows)}</div>
                <p className="text-xs text-muted-foreground">Entradas del Año hasta la Fecha</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Salidas Totales (YTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{formatCurrency(data.totalOutflows)}</div>
                <p className="text-xs text-muted-foreground">Salidas del Año hasta la Fecha</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-semibold">Nombre del Fondo</th>
                      <th className="p-4 text-left font-semibold">Tipo de Fondo</th>
                      <th className="p-4 text-right font-semibold">Saldo Actual</th>
                      <th className="p-4 text-right font-semibold">Entradas YTD</th>
                      <th className="p-4 text-right font-semibold">Salidas YTD</th>
                      <th className="p-4 text-center font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.funds.map((fund, index) => (
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
                                <Badge variant="outline" className={statusColors[fund.status] || ''}>{fund.status}</Badge>
                            </td>
                        </tr>
                    ))}
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
