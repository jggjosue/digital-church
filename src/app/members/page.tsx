'use client';

import * as React from 'react';
import {
  FileUp,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { membersData } from '@/lib/data';

type Member = (typeof membersData)[0];

const statusColors = {
  Active: 'bg-green-500',
  Visitor: 'bg-yellow-500',
  Inactive: 'bg-red-500',
};

const groupColors = {
  Volunteers: 'bg-blue-100 text-blue-800',
  Choir: 'bg-yellow-100 text-yellow-800',
  'Youth Group': 'bg-purple-100 text-purple-800',
  'New Member': 'bg-green-100 text-green-800',
};

export default function MembersPage() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [view, setView] = React.useState<'table' | 'card'>('table');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(membersData.map((m) => m.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((i) => i !== id));
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="w-80 border-r bg-background p-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Membership Status
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="active" />
                <label htmlFor="active" className="text-sm">
                  Active
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="visitor" />
                <label htmlFor="visitor" className="text-sm">
                  Visitor
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="inactive" />
                <label htmlFor="inactive" className="text-sm">
                  Inactive
                </label>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Groups
            </h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="volunteers">Volunteers</SelectItem>
                <SelectItem value="choir">Choir</SelectItem>
                <SelectItem value="youth">Youth Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
            <Input placeholder="e.g. Baptized, New" />
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <Button className="w-full">Apply Filters</Button>
          <Button variant="ghost" className="w-full">
            Clear All
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Member Directory</h1>
            <p className="text-muted-foreground">
              Manage member profiles, contact information, and group
              memberships.
            </p>
          </div>
          <Button>
            <Plus className="mr-2" /> Add New Member
          </Button>
        </div>
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, email, or phone..." className="pl-9" />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={view === 'table' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setView('table')}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={view === 'card' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setView('card')}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selected.length > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
                  <div className="text-sm font-medium">
                    {selected.length} item{selected.length > 1 ? 's' : ''}{' '}
                    selected
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <div className="ml-4">
                      <Button size="sm">
                        Bulk Actions
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {view === 'table' ? (
                 <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-12">
                       <Checkbox
                         checked={
                           selected.length > 0 &&
                           selected.length === membersData.length
                         }
                         onCheckedChange={(checked) =>
                           handleSelectAll(!!checked)
                         }
                       />
                     </TableHead>
                     <TableHead>Name</TableHead>
                     <TableHead>Contact</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Groups</TableHead>
                     <TableHead>Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {membersData.map((member) => (
                     <TableRow key={member.id}>
                       <TableCell>
                         <Checkbox
                           checked={selected.includes(member.id)}
                           onCheckedChange={(checked) =>
                             handleSelectOne(member.id, !!checked)
                           }
                         />
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-3">
                           <Avatar>
                             <AvatarImage
                               src={`https://picsum.photos/seed/${member.id}/40/40`}
                               alt={member.name}
                             />
                             <AvatarFallback>
                               {member.name.charAt(0)}
                             </AvatarFallback>
                           </Avatar>
                           <div>
                             <div className="font-medium">{member.name}</div>
                             <div className="text-sm text-muted-foreground">
                               {member.email}
                             </div>
                           </div>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="text-sm">{member.phone1}</div>
                         <div className="text-sm text-muted-foreground">
                           {member.phone2}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                           <span
                             className={`h-2 w-2 rounded-full ${
                               statusColors[member.status as keyof typeof statusColors]
                             }`}
                           />
                           <span className="text-sm">{member.status}</span>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex flex-wrap gap-1">
                           {member.groups.map((group) => (
                             <Badge
                               key={group}
                               variant="outline"
                               className={`font-normal ${groupColors[group as keyof typeof groupColors] || 'bg-gray-100 text-gray-800'}`}
                             >
                               {group}
                             </Badge>
                           ))}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center">
                           <Button variant="link">View</Button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button variant="ghost" size="icon">
                                 <MoreHorizontal className="h-4 w-4" />
                               </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent>
                               <DropdownMenuItem>Edit</DropdownMenuItem>
                               <DropdownMenuItem>Delete</DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {membersData.map((member) => (
                    <Card key={member.id} className="relative">
                       <Checkbox
                           checked={selected.includes(member.id)}
                           onCheckedChange={(checked) =>
                             handleSelectOne(member.id, !!checked)
                           }
                           className="absolute top-4 left-4"
                         />
                      <CardHeader className="flex flex-row items-center justify-between">
                         <div className="flex items-center gap-4">
                           <Avatar className="h-12 w-12">
                             <AvatarImage src={`https://picsum.photos/seed/${member.id}/48/48`} alt={member.name} />
                             <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                             <CardTitle className="text-base">{member.name}</CardTitle>
                             <p className="text-sm text-muted-foreground">{member.email}</p>
                           </div>
                         </div>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent>
                             <DropdownMenuItem>Edit</DropdownMenuItem>
                             <DropdownMenuItem>Delete</DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                         <div className="text-sm">{member.phone1}</div>
                         <div className="flex items-center gap-2">
                           <span className={`h-2 w-2 rounded-full ${statusColors[member.status as keyof typeof statusColors]}`} />
                           <span className="text-sm">{member.status}</span>
                         </div>
                         <div className="flex flex-wrap gap-1 pt-2">
                           {member.groups.map((group) => (
                             <Badge key={group} variant="outline" className={`font-normal ${groupColors[group as keyof typeof groupColors] || 'bg-gray-100 text-gray-800'}`}>{group}</Badge>
                           ))}
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
