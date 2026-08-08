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
import { Search, Plus, RefreshCw, Loader2, Download } from 'lucide-react';
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
    if (amount < 0) {
        return `(${formatted})`;
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
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [year, setYear] = React.useState(new Date().getFullYear().toString());
  const [search, setSearch] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('all');

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
      const fundStats = summary?.fundStats || {};

      const funds = Object.keys(fundStats).map(fundName => {
          const stats = fundStats[fundName];
          const ytdInflows = stats.inflows;
          const ytdOutflows = stats.outflows;
          const balance = ytdInflows - ytdOutflows;

          return { 
              name: fundName,
              description: 'Generado a partir de transacciones',
              type: 'No Restringido',
              typeKey: 'unrestricted',
              status: 'Activo',
              ytdInflows, 
              ytdOutflows, 
              balance 
          };
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
  const filteredFunds = data.funds.filter((fund) =>
    (selectedType === 'all' || fund.typeKey === selectedType) &&
    `${fund.name} ${fund.description} ${fund.type}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleExport = async () => {
    await exportExcelReport({
      fileName: `saldos-de-fondos-${year}`,
      title: 'Saldos de Fondos',
      metadata: [
        ['Año', year],
        ['Búsqueda', search || 'Todos los fondos'],
        ['Tipo', selectedType === 'all' ? 'Todos' : selectedType],
      ],
      sections: [
        {
          name: 'Fondos',
          columns: ['Nombre', 'Descripción', 'Tipo', 'Saldo actual', 'Entradas YTD', 'Salidas YTD', 'Estado'],
          rows: filteredFunds.map((fund) => [
            fund.name,
            fund.description,
            fund.type,
            fund.balance,
            fund.ytdInflows,
            fund.ytdOutflows,
            fund.status,
          ]),
          currencyColumns: [3, 4, 5],
        },
      ],
    });
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Saldos de Fondos"
        description={`Al ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      >
        <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={() => void handleExport()} disabled={loading}>
                <Download className="mr-2 h-4 w-4" /> Exportar Reporte
            </Button>
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
            <Input
              placeholder="Buscar fondos..."
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
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
                    {filteredFunds.map((fund, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-4">
                                <div className="font-medium text-primary">{fund.name}</div>
                                <div className="text-xs text-muted-foreground">{fund.description}</div>
                            </td>
                            <td className="p-4">{fund.type}</td>
                            <td className="p-4 text-right font-medium">{formatCurrency(fund.balance)}</td>
                            <td className={cn("p-4 text-right", fund.ytdInflows > 0 ? 'text-green-600' : '')}>{formatCurrency(fund.ytdInflows)}</td>
                            <td className={cn("p-4 text-right", fund.ytdOutflows > 0 ? 'text-red-600' : '')}>{formatCurrency(fund.ytdOutflows)}</td>
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
