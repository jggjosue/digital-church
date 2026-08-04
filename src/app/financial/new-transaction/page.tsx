'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar as CalendarIcon,
  Loader2,
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
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { MemberSelector } from '@/components/member-selector';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  category: z.string().min(1, 'La categoría es requerida'),
  fundId: z.string().optional(),
  reference: z.string().optional(),
  description: z.string().optional(),
  memberId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [transactionType, setTransactionType] = React.useState<'income'|'expense'>('income');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'income',
      amount: 0,
      category: '',
      fundId: '',
      reference: '',
      description: '',
      memberId: '',
    }
  });

  // Keep internal state synced with form type
  React.useEffect(() => {
    form.setValue('type', transactionType);
  }, [transactionType, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        type: values.type,
        amount: values.amount,
        date: values.date.toISOString(),
        category: values.category,
        fundId: values.fundId,
        reference: values.reference,
        description: values.description,
        memberId: values.memberId || undefined,
      };

      const res = await fetch('/api/data/financial-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar la transacción');

      toast({ title: 'Transacción guardada', description: 'La transacción ha sido registrada exitosamente.' });
      router.push('/financial');
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la transacción', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Nueva Transacción Financiera"
        description="Registre un nuevo ingreso o gasto para la iglesia."
      >
        <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild><Link href="/financial">Cancelar</Link></Button>
            <Button disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Transacción
            </Button>
        </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8 pt-4">
              <div className="space-y-2">
                  <Label>Tipo de Transacción</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button
                          type="button"
                          variant={transactionType === 'income' ? 'default' : 'outline'}
                          onClick={() => setTransactionType('income')}
                          className={cn("py-6 text-base", transactionType === 'income' && "ring-2 ring-primary-focus")}
                      >
                          <ArrowDown className="mr-2 h-5 w-5" /> Ingreso
                      </Button>
                      <Button
                          type="button"
                          variant={transactionType === 'expense' ? 'default' : 'outline'}
                          onClick={() => setTransactionType('expense')}
                          className={cn("py-6 text-base", transactionType === 'expense' && "ring-2 ring-primary-focus")}
                      >
                          <ArrowUp className="mr-2 h-5 w-5" /> Gasto
                      </Button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="date" render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                          <FormLabel>Fecha</FormLabel>
                          <Popover>
                              <PopoverTrigger asChild>
                                  <FormControl>
                                      <Button
                                          variant={"outline"}
                                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                      >
                                          {field.value ? format(field.value, "MM/dd/yyyy") : <span>Seleccione fecha</span>}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                  </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                          </Popover>
                          <FormMessage />
                      </FormItem>
                  )} />

                  <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Monto</FormLabel>
                          <FormControl>
                              <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                  <Input type="number" step="0.01" placeholder="0.00" className="pl-7" {...field} />
                              </div>
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )} />
              </div>
              
              <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Seleccione una categoría" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Diezmos y Ofrendas">Diezmos y Ofrendas</SelectItem>
                              <SelectItem value="Salarios y Beneficios">Salarios y Beneficios</SelectItem>
                              <SelectItem value="Servicios Públicos">Servicios Públicos</SelectItem>
                              <SelectItem value="Mantenimiento">Mantenimiento de Instalaciones</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )} />

              <FormField control={form.control} name="fundId" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Fondo / Ministerio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un fondo o ministerio" />
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="Fondo General">Fondo General</SelectItem>
                              <SelectItem value="Fondo de Construcción">Fondo de Construcción</SelectItem>
                              <SelectItem value="Fondo de Misiones">Fondo de Misiones</SelectItem>
                              <SelectItem value="Ministerio Juvenil">Ministerio Juvenil</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="memberId" render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                        <FormLabel>Miembro de la Congregación (Opcional)</FormLabel>
                        <FormControl>
                            <MemberSelector 
                              selectedIds={field.value ? [field.value] : []}
                              onSelectedIdsChange={(ids) => {
                                field.onChange(ids[0] || '');
                              }}
                              selectedNames={[]} // For a robust UI we'd track the name, but ids[0] is enough for submission
                              onSelectedNamesChange={(names) => {
                                if (names[0] && !form.getValues('reference')) {
                                  form.setValue('reference', names[0]);
                                }
                              }}
                              placeholder="Buscar miembro..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="reference" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Beneficiario / Pagador</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej., John Smith, Office Supplies Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                          <Textarea placeholder="Añada una descripción o cualquier detalle relevante..." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )} />

              <button type="submit" className="hidden" />
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
