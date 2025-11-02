'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
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
import { X } from 'lucide-react';

export default function SendEmailPage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');
  const memberIds = idsParam ? idsParam.split(',').map(id => parseInt(id, 10)) : [];
  
  const [recipients, setRecipients] = React.useState(() => 
    membersData.filter(m => memberIds.includes(m.id))
  );

  const handleRemoveRecipient = (id: number) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const recipientEmails = recipients.map(r => r.email).join(', ');

  return (
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enviar Correo a Miembros</h1>
          <p className="text-muted-foreground">
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
            <div className="min-h-10 rounded-md border border-input p-2 flex flex-wrap gap-2">
              {recipients.map(recipient => (
                <Badge key={recipient.id} variant="secondary" className="flex items-center gap-1.5">
                  {recipient.name}
                  <button onClick={() => handleRemoveRecipient(recipient.id)} className="rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
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
