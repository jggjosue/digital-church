
'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { AppHeader } from '@/components/app-header';

export default function NewTransactionPage() {
  const [transactionType, setTransactionType] = React.useState('income');
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Nueva Transacción Financiera"
        description="Registre un nuevo ingreso o gasto para la iglesia."
      >
        <div className="flex justify-end gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button>Guardar Transacción</Button>
        </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-8">
      <Card>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2">
                <Label>Tipo de Transacción</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant={transactionType === 'income' ? 'default' : 'outline'}
                        onClick={() => setTransactionType('income')}
                        className={cn("py-6 text-base", transactionType === 'income' && "ring-2 ring-primary-focus")}
                    >
                        <ArrowDown className="mr-2 h-5 w-5" /> Ingreso
                    </Button>
                    <Button
                        variant={transactionType === 'expense' ? 'default' : 'outline'}
                        onClick={() => setTransactionType('expense')}
                        className={cn("py-6 text-base", transactionType === 'expense' && "ring-2 ring-primary-focus")}
                    >
                        <ArrowUp className="mr-2 h-5 w-5" /> Gasto
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Seleccione una fecha</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <Input id="amount" type="number" placeholder="0.00" className="pl-7" />
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tithes">Diezmos y Ofrendas</SelectItem>
                  <SelectItem value="salaries">Salarios y Beneficios</SelectItem>
                  <SelectItem value="utilities">Servicios Públicos</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento de Instalaciones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund">Fondo / Ministerio</Label>
              <Select>
                <SelectTrigger id="fund">
                  <SelectValue placeholder="Seleccione un fondo o ministerio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Fondo General</SelectItem>
                  <SelectItem value="building">Fondo de Construcción</SelectItem>
                  <SelectItem value="missions">Fondo de Misiones</SelectItem>
                  <SelectItem value="youth">Ministerio Juvenil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payee">Beneficiario / Pagador (Opcional)</Label>
              <Input id="payee" placeholder="Ej., John Smith, Office Supplies Inc." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea id="notes" placeholder="Añada una descripción o cualquier detalle relevante..." />
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
