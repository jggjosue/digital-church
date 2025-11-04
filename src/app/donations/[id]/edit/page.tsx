
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { AppHeader } from '@/components/app-header';

const donationData = {
    id: 2,
    donorName: 'David Lee',
    date: '2023-10-27T00:00:00.000Z',
    amount: 1000.0,
    fund: 'Campaña de Construcción',
    paymentMethod: 'Cheque',
    notes: 'This donation is the final installment of the family\'s pledge towards the new building fund.',
    isRecurring: false,
};

export default function EditDonationPage({ params }: { params: { id: string }}) {
    const [date, setDate] = React.useState<Date | undefined>(new Date(donationData.date));

    return (
        <div className="flex flex-col flex-1">
        <AppHeader
            title={<>Editar Donación <span className="text-muted-foreground">#{params.id}</span></>}
            description="Modifique los detalles del registro de donación."
        >
             <Button variant="ghost" asChild>
                <Link href="/donations">Cancelar</Link>
            </Button>
            <Button>Guardar Cambios</Button>
        </AppHeader>
        <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
            <Card className="max-w-3xl mx-auto">
                <CardContent className="p-6 sm:p-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="donor-search">Donante</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="donor-search" defaultValue={donationData.donorName} className="pl-9" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                    <Input id="amount" type="number" defaultValue={donationData.amount} className="pl-7" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="donation-date">Fecha de Donación</Label>
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
                                        {date ? format(date, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fund-campaign">Fondo / Campaña</Label>
                                <Select defaultValue={donationData.fund === 'Campaña de Construcción' ? 'building-fund' : 'general-fund'}>
                                    <SelectTrigger id="fund-campaign">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general-fund">Fondo General</SelectItem>
                                        <SelectItem value="building-fund">Fondo de Construcción</SelectItem>
                                        <SelectItem value="missions-fund">Fondo de Misiones</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="payment-method">Método de Pago</Label>
                                <Select defaultValue={donationData.paymentMethod === 'Cheque' ? 'check' : 'credit-card'}>
                                    <SelectTrigger id="payment-method">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
                                        <SelectItem value="check">Cheque</SelectItem>
                                        <SelectItem value="cash">Efectivo</SelectItem>
                                        <SelectItem value="online">En Línea</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas (Opcional)</Label>
                            <Textarea id="notes" defaultValue={donationData.notes} rows={3} />
                        </div>

                        <div className="flex items-start space-x-3">
                            <Checkbox id="recurring" defaultChecked={donationData.isRecurring} />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                htmlFor="recurring"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                Hacer de esta una donación recurrente
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    Configure un horario automatizado para este regalo.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
        </div>
    );
}
