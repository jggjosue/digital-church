
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { membersData } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Member = (typeof membersData)[0];

export function SendEmailForm() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');
  const memberIds = idsParam ? idsParam.split(',').map(id => parseInt(id, 10)) : [];
  
  const [recipients, setRecipients] = React.useState<Member[]>(() => 
    membersData.filter(m => memberIds.includes(m.id))
  );

  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  React.useEffect(() => {
    if (searchTerm) {
      const recipientIds = recipients.map(r => r.id);
      setFilteredMembers(
        membersData.filter(
          m =>
            !recipientIds.includes(m.id) &&
            (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ).slice(0, 5) // Limit results for performance
      );
      setHighlightedIndex(-1); // Reset highlight when search term changes
    } else {
      setFilteredMembers([]);
    }
  }, [searchTerm, recipients]);


  const handleRemoveRecipient = (id: number) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRecipient = (member: Member) => {
    setRecipients(prev => [...prev, member]);
    setSearchTerm('');
    setFilteredMembers([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && recipients.length > 0) {
      const lastRecipient = recipients[recipients.length - 1];
      handleRemoveRecipient(lastRecipient.id);
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
                handleAddRecipient(filteredMembers[highlightedIndex]);
            }
        }
    }
  };

  const recipientEmails = recipients.map(r => r.email).join(', ');

  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" size="icon" asChild className="shrink-0">
          <Link href="/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Enviar Correo a Miembros</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Redacte y envíe un correo electrónico a los miembros seleccionados.
          </p>
        </div>
      </div>

      <Card className="mt-8 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Redactar Correo</CardTitle>
          <CardDescription>
            {recipients.length} {recipients.length === 1 ? 'destinatario' : 'destinatarios'} seleccionados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipients">Para</Label>
            <div className="min-h-10 rounded-md border border-input p-2 flex flex-wrap gap-2 items-center">
              {recipients.map(recipient => (
                <Badge key={recipient.id} variant="secondary" className="flex items-center gap-1.5 py-1 text-sm">
                  <span>{recipient.name}</span>
                  <button onClick={() => handleRemoveRecipient(recipient.id)} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <div className="relative flex-grow">
                 <Input 
                    id="recipients-input"
                    placeholder="Añadir más destinatarios..."
                    className="border-none focus-visible:ring-0 shadow-none h-auto py-0 px-1"
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
                                onMouseDown={(e) => { e.preventDefault(); handleAddRecipient(member); }}
                            >
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            </div>
            <Input id="recipients" value={recipientEmails} className="hidden" readOnly/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" placeholder="Asunto de su correo electrónico" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Escriba su mensaje aquí..."
              rows={10}
              className="text-base"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button>
              <Send className="mr-2 h-4 w-4" /> Enviar Correo
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
