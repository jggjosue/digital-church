'use client';

import * as React from 'react';
import {
  Download,
  Search,
  Plus,
  LayoutDashboard,
  FileText,
  PiggyBank,
  Banknote,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { incomeExpenseData, budgetSpendingData, recentTransactions } from '@/lib/data';

const FinancialSidebar = () => {
  const pathname = '/financial'; // Mock pathname for active link styling
  const navItems = [
    { href: '/financial', icon: LayoutDashboard, label: 'Dashboard' },
    {
      href: '/financial/income-expense',
      icon: FileText,
      label: 'Income & Expense Statement',
    },
    { href: '/financial/budget', icon: PiggyBank, label: 'Budget Report' },
    { href: '/financial/funds', icon: Banknote, label: 'Fund Balances' },
    {
      href: '/financial/donations',
      icon: ClipboardList,
      label: 'Donation Reports',
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background p-4">
      <div className="flex h-16 items-center gap-3 px-2">
        <h2 className="font-semibold text-lg">Grace Fellowship</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
              pathname === item.href && 'bg-accent text-accent-foreground font-medium'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-2">
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>
    </aside>
  );
};

export default function FinancialPage() {
  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      <FinancialSidebar />
      <main className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Reporting
          </h1>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <Tabs defaultValue="year-to-date">
          <TabsList>
            <TabsTrigger value="last-month">Last Month</TabsTrigger>
            <TabsTrigger value="this-quarter">This Quarter</TabsTrigger>
            <TabsTrigger value="year-to-date">Year to Date</TabsTrigger>
            <TabsTrigger value="custom-range">Custom Range</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tithes & Offerings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$45,280.50</div>
              <p className="text-xs text-green-600">+5.2% from last year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$21,745.00</div>
              <p className="text-xs text-red-600">+8.1% from last year</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$23,535.50</div>
              <p className="text-xs text-green-600">+2.3% from last year</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expenses Over Time</CardTitle>
              <p className="text-2xl font-bold text-muted-foreground">$23,535.50 <span className='text-lg'>Net</span></p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={incomeExpenseData}>
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget vs. Actual Spending</CardTitle>
               <p className="text-2xl font-bold text-muted-foreground">$15,800 <span className='text-lg'>Spent this month</span></p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={budgetSpendingData}>
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                   <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip cursor={{fill: 'hsla(var(--muted))'}} content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="spent"
                    stackId="a"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                   <Bar
                    dataKey="budget"
                    stackId="a"
                    fill="hsl(var(--muted))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.fund}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.amount > 0 ? '' : '-'}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
