
'use client';

import * as React from 'react';
import { ArrowLeft, Search, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { membersData } from '@/lib/data';
import { cn } from '@/lib/utils';
import { AppHeader } from '@/components/app-header';

type Member = (typeof membersData)[0];

export default function NewMinistryPage() {
  const [leaders, setLeaders] = React.useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  React.useEffect(() => {
    if (searchTerm) {
      const leaderIds = leaders.map(l => l.id);
      setFilteredMembers(
        membersData.filter(
          m =>
            !leaderIds.includes(m.id) &&
            (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ).slice(0, 5)
      );
      setHighlightedIndex(-1);
    } else {
      setFilteredMembers([]);
    }
  }, [searchTerm, leaders]);

  const removeLeader = (id: number) => {
    setLeaders(leaders.filter(leader => leader.id !== id));
  };

  const addLeader = (member: Member) => {
    setLeaders(prev => [...prev, member]);
    setSearchTerm('');
    setFilteredMembers([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && leaders.length > 0) {
      const lastLeader = leaders[leaders.length - 1];
      removeLeader(lastLeader.id);
    } else if (filteredMembers.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev + 1) % filteredMembers.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredMembers.length) {
                addLeader(filteredMembers[highlightedIndex]);
            }
        }
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Crear Nuevo Ministerio"
        description="Complete los detalles a continuación para establecer un nuevo ministerio."
      >
        <div className="flex justify-end gap-2">
            <Button variant="ghost" asChild><Link href="/ministries">Cancelar</Link></Button>
            <Button>Crear Ministerio</Button>
        </div>
      </AppHeader>
    <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Ministerio</CardTitle>
          <CardDescription>
            Proporcione un nombre, descripción y designe líderes para el nuevo ministerio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ministry-name">Nombre del Ministerio</Label>
            <Input id="ministry-name" placeholder="Ej., Ministerio de Niños, Equipo de Adoración" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describa el propósito y las responsabilidades de este ministerio."
              rows={4}
            />
          </div>
          <div className="space-y-2">
              <Label htmlFor="category">Categoría del Ministerio</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outreach">Alcance Comunitario</SelectItem>
                  <SelectItem value="worship">Adoración</SelectItem>
                  <SelectItem value="youth">Jóvenes</SelectItem>
                  <SelectItem value="children">Niños</SelectItem>
                  <SelectItem value="care">Cuidado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <div className="space-y-2">
            <Label htmlFor="ministry-leaders">Líder(es) del Ministerio</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="ministry-leaders"
                placeholder="Buscar miembros para añadir como líderes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
               {filteredMembers.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-background border rounded-md shadow-lg z-10">
                        {filteredMembers.map((member, index) => (
                             <div 
                                key={member.id} 
                                className={cn("p-2 hover:bg-accent cursor-pointer",
                                    index === highlightedIndex && 'bg-accent'
                                )}
                                onMouseDown={(e) => { e.preventDefault(); addLeader(member); }}
                            >
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="space-y-2 mt-2">
                {leaders.map((leader) => (
                    <div key={leader.id} className="flex items-center justify-between rounded-lg border bg-secondary p-2">
                        <div className="flex items-center gap-3">
                            <Avatar className='h-8 w-8'>
                                <AvatarImage src={`https://picsum.photos/seed/${leader.id}/32/32`} alt={leader.name} />
                                <AvatarFallback>{leader.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{leader.name}</p>
                                <p className="text-xs text-muted-foreground">{leader.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLeader(leader.id)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
