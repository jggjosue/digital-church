'use client';

import * as React from 'react';
import {
  Search,
  Download,
  FileText,
  Landmark,
  ListFilter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { donationReportsData } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function DonationReportsPage() {
  const { totalDonations, averageDonation, newDonors, givingTrends, recentDonations } = donationReportsData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  return (
    <main className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donation Reports</h1>
          <p className="text-muted-foreground">
            Generate and view donation activity
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by donor..." className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
                <Select>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="This Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="All Funds" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Funds</SelectItem>
                        <SelectItem value="general">General Fund</SelectItem>
                        <SelectItem value="building">Building Fund</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="All Campaigns" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Campaigns</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Statements
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalDonations.amount)}</div>
            <p className="text-xs text-muted-foreground">{totalDonations.period}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(averageDonation.amount)}</div>
            <p className="text-xs text-muted-foreground">{averageDonation.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(newDonors.amount)}</div>
            <p className="text-xs text-muted-foreground">{newDonors.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Giving Trends</CardTitle>
            <CardDescription>Monthly donations over the past year</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px] text-muted-foreground bg-muted/50 rounded-lg">
            Chart will be displayed here
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div className="font-medium">{donation.donorName}</div>
                      <div className="text-sm text-muted-foreground">{donation.donorEmail}</div>
                    </TableCell>
                    <TableCell>{donation.date}</TableCell>
                    <TableCell>{donation.fund}</TableCell>
                    <TableCell>{donation.paymentMethod}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(donation.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
