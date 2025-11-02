'use client';

import * as React from 'react';
import {
  FileText,
  Plus,
  Search,
  ListFilter,
  Download,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const donationsData = [
  {
    id: 1,
    donorName: 'John & Jane Smith',
    date: 'Oct 28, 2023',
    amount: 250.0,
    fund: 'General Fund',
    paymentMethod: 'Credit Card',
  },
  {
    id: 2,
    donorName: 'David Lee',
    date: 'Oct 27, 2023',
    amount: 1000.0,
    fund: 'Building Campaign',
    paymentMethod: 'Check',
  },
  {
    id: 3,
    donorName: 'Maria Garcia',
    date: 'Oct 25, 2023',
    amount: 75.0,
    fund: 'Missions Fund',
    paymentMethod: 'Online Giving',
  },
  {
    id: 4,
    donorName: 'Anonymous',
    date: 'Oct 24, 2023',
    amount: 500.0,
    fund: 'General Fund',
    paymentMethod: 'Cash',
  },
  {
    id: 5,
    donorName: 'The Williams Family',
    date: 'Oct 22, 2023',
    amount: 150.0,
    fund: 'Youth Ministry',
    paymentMethod: 'Bank Transfer',
  },
  // Add more data for pagination
  { id: 6, donorName: 'Chris Green', date: 'Oct 21, 2023', amount: 100.00, fund: 'General Fund', paymentMethod: 'Credit Card' },
  { id: 7, donorName: 'Patricia Hall', date: 'Oct 20, 2023', amount: 200.00, fund: 'Building Campaign', paymentMethod: 'Check' },
  { id: 8, donorName: 'Jennifer Allen', date: 'Oct 19, 2023', amount: 50.00, fund: 'Missions Fund', paymentMethod: 'Online Giving' },
  { id: 9, donorName: 'James Young', date: 'Oct 18, 2023', amount: 300.00, fund: 'General Fund', paymentMethod: 'Cash' },
  { id: 10, donorName: 'Linda King', date: 'Oct 17, 2023', amount: 450.00, fund: 'Youth Ministry', paymentMethod: 'Bank Transfer' },
  { id: 11, donorName: 'Richard Wright', date: 'Oct 16, 2023', amount: 50.00, fund: 'General Fund', paymentMethod: 'Credit Card' },
  { id: 12, donorName: 'Susan Hill', date: 'Oct 15, 2023', amount: 120.00, fund: 'Building Campaign', paymentMethod: 'Check' },
];

export default function DonationsPage() {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;
    const totalItems = donationsData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
        }
    };

    const paginatedData = donationsData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  return (
    <main className="flex-1 bg-muted/20 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Donations & Giving</h1>
          <p className="text-muted-foreground">
            Manage donations, pledges, and generate giving statements.
          </p>
        </div>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Generate Statement
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Giving This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$15,480.50</div>
            <p className="text-xs text-green-600">+5.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pledge Fulfillment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">88%</div>
            <p className="text-xs text-red-600">-1.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-green-600">+1</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="donations">
          <TabsList>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="pledges">Pledges</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>
          <TabsContent value="donations">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search donations..." className="pl-9" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <ListFilter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add Donation
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>DONOR NAME</TableHead>
                      <TableHead>DATE</TableHead>
                      <TableHead>AMOUNT</TableHead>
                      <TableHead>FUND/CAMPAIGN</TableHead>
                      <TableHead>PAYMENT METHOD</TableHead>
                      <TableHead className="text-right">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">{donation.donorName}</TableCell>
                        <TableCell>{donation.date}</TableCell>
                        <TableCell>${donation.amount.toFixed(2)}</TableCell>
                        <TableCell>{donation.fund}</TableCell>
                        <TableCell>{donation.paymentMethod}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" className="text-primary">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                    </div>
                    <Pagination>
                        <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                            <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}>
                                {i + 1}
                            </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}/>
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pledges">
            <div className="p-6 text-center text-muted-foreground">
              Pledge management coming soon.
            </div>
          </TabsContent>
          <TabsContent value="campaigns">
            <div className="p-6 text-center text-muted-foreground">
              Campaign management coming soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
