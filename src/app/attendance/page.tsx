'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  Users,
  Trash2,
  Edit,
  UserPlus,
  ChevronDown,
  BarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { attendanceRecords } from '@/lib/data';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const statusColors: { [key: string]: string } = {
    Present: 'bg-green-100 text-green-800 border-green-200',
    Absent: 'bg-gray-100 text-gray-800 border-gray-200',
    Excused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const statusDotColors: { [key: string]: string } = {
    Present: 'bg-green-500',
    Absent: 'bg-gray-400',
    Excused: 'bg-yellow-500',
};


export default function AttendancePage() {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 5;
  
    const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);
  
    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };
  
    const paginatedData = attendanceRecords.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  return (
    <main className="flex-1 bg-muted/20 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><BarChart className="mr-2 h-4 w-4" /> Generate Report</Button>
            <Button><Plus className="mr-2 h-4 w-4" /> Record New Attendance</Button>
        </div>
      </div>
      <Card className="mt-6">
        <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by member name..." className="pl-9" />
                </div>
                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Service/Event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services/Events</SelectItem>
                      <SelectItem value="sunday">Sunday Morning Service</SelectItem>
                      <SelectItem value="youth">Youth Group Meeting</SelectItem>
                      <SelectItem value="bible-study">Midweek Bible Study</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ministry Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      <SelectItem value="youth">Youth Group</SelectItem>
                      <SelectItem value="choir">Choir</SelectItem>
                      <SelectItem value="volunteers">Volunteers</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service/Event Name</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.serviceName}</TableCell>
                  <TableCell>{record.memberName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-medium ${statusColors[record.status]}`}>
                        <span className={`h-2 w-2 rounded-full mr-2 ${statusDotColors[record.status]}`}></span>
                        {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.checkInTime}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                    Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, attendanceRecords.length)} of {attendanceRecords.length} results
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
    </main>
  );
}
