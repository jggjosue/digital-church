'use client';

import * as React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { rolesData } from '@/lib/data';

type Role = (typeof rolesData)[0];

const OverlappingAvatars = ({ users }: { users: Role['users'] }) => {
    if (typeof users === 'number') {
        return <span className="text-sm text-muted-foreground">{users} users</span>;
    }

    const visibleUsers = users.slice(0, 3);
    const hiddenUsersCount = users.length - visibleUsers.length;

    return (
        <div className="flex items-center">
            {visibleUsers.map((user, index) => (
                <Avatar key={user.id} className={`h-8 w-8 border-2 border-background ${index > 0 ? '-ml-3' : ''}`}>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            ))}
            {hiddenUsersCount > 0 && (
                 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold -ml-3 border-2 border-background">
                    +{hiddenUsersCount}
                </div>
            )}
        </div>
    );
};


export default function SettingsPage() {
  return (
    <main className="flex-1 bg-muted/20 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Define and manage user roles, assign permissions, and control access levels.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Role
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">ROLE NAME</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead>USERS</TableHead>
                <TableHead className="text-right pr-6">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesData.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium pl-6">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">{role.description}</TableCell>
                  <TableCell>
                    <OverlappingAvatars users={role.users} />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
