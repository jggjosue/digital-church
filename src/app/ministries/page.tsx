'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Plus,
  Search,
  Users,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { ministriesData } from '@/lib/data';

type Ministry = (typeof ministriesData)[0];

export default function MinistriesPage() {
  return (
    <main className="flex-1 bg-muted/20 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ministries</h1>
          <p className="text-muted-foreground">
            Manage church ministries and their members.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Ministry
        </Button>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ministries..." className="pl-9" />
        </div>
        <div className="w-[180px]">
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Sort by: Name" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="name">Sort by: Name</SelectItem>
                    <SelectItem value="members">Sort by: Members</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        {ministriesData.map((ministry) => (
            <Card key={ministry.id}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold">{ministry.name}</h3>
                            <p className="text-muted-foreground mt-1">{ministry.description}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                {ministry.members} Members
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Leader: {ministry.leader}
                            </div>
                            <div className="flex items-center">
                                {ministry.memberAvatars.slice(0, 3).map((avatar, index) => (
                                    <Avatar key={index} className={`h-8 w-8 -ml-2 border-2 border-card`}>
                                        <AvatarImage src={avatar} />
                                        <AvatarFallback>{ministry.leader.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {ministry.members > 3 && (
                                <Avatar className="h-8 w-8 -ml-2 border-2 border-card bg-muted text-muted-foreground">
                                    <AvatarFallback>+{ministry.members - 3}</AvatarFallback>
                                </Avatar>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button>View Details</Button>
                            <Button variant="outline">Assign Members</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </main>
  );
}
