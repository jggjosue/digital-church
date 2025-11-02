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

export default function NewTransactionPage() {
  const [transactionType, setTransactionType] = React.useState('income');
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <main className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          New Financial Transaction
        </h1>
        <p className="text-muted-foreground">
          Record a new income or expense for the church.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="space-y-2">
                <Label>Transaction Type</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant={transactionType === 'income' ? 'default' : 'outline'}
                        onClick={() => setTransactionType('income')}
                        className={cn("py-6 text-base", transactionType === 'income' && "ring-2 ring-primary-focus")}
                    >
                        <ArrowDown className="mr-2 h-5 w-5" /> Income
                    </Button>
                    <Button
                        variant={transactionType === 'expense' ? 'default' : 'outline'}
                        onClick={() => setTransactionType('expense')}
                        className={cn("py-6 text-base", transactionType === 'expense' && "ring-2 ring-primary-focus")}
                    >
                        <ArrowUp className="mr-2 h-5 w-5" /> Expense
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
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
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <Input id="amount" type="number" placeholder="0.00" className="pl-7" />
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tithes">Tithes & Offerings</SelectItem>
                  <SelectItem value="salaries">Salaries & Benefits</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="maintenance">Facility Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fund">Fund / Ministry</Label>
              <Select>
                <SelectTrigger id="fund">
                  <SelectValue placeholder="Select a fund or ministry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Fund</SelectItem>
                  <SelectItem value="building">Building Fund</SelectItem>
                  <SelectItem value="missions">Missions Fund</SelectItem>
                  <SelectItem value="youth">Youth Ministry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payee">Payee / Payer (Optional)</Label>
              <Input id="payee" placeholder="e.g., John Smith, Office Supplies Inc." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Add a description or any relevant details..." />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Transaction</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
