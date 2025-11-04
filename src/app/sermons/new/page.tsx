
'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { AppHeader } from '@/components/app-header';

export default function NewSermonPage() {
    const [date, setDate] = React.useState<Date | undefined>();

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Añadir Nuevo Sermón"
        description="Rellene los detalles a continuación para añadir un nuevo sermón a la biblioteca."
      >
        <div/>
      </AppHeader>
    <main className="flex-1 bg-muted/20 p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6 sm:p-8 space-y-8">
            <div className="space-y-2">
                <Label htmlFor="sermon-title">Título del Sermón</Label>
                <Input id="sermon-title" placeholder="Ej., El Poder del Perdón" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="speaker">Predicador</Label>
                    <Select>
                        <SelectTrigger id="speaker">
                            <SelectValue placeholder="Seleccione un predicador" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pastor-john">Pastor John Doe</SelectItem>
                            <SelectItem value="pastora-jane">Pastora Jane Smith</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="series">Serie (opcional)</Label>
                     <Select>
                        <SelectTrigger id="series">
                            <SelectValue placeholder="Seleccione una serie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gospel-john">Evangelio de Juan</SelectItem>
                            <SelectItem value="book-james">Libro de Santiago</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="topics">Temas / Etiquetas</Label>
                    <Input id="topics" placeholder="Ej., Fe, Gracia, Perdón" />
                    <p className="text-xs text-muted-foreground">Separar etiquetas con comas.</p>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="notes">Notas del Sermón / Transcripción</Label>
                <Textarea id="notes" placeholder="Ingrese notas del sermón, puntos clave o una transcripción completa..." rows={6} />
            </div>

            <div className="space-y-2">
                <Label>Subida de Medios</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-primary">Subir un archivo o arrastrar y soltar</p>
                            <p className="text-xs text-muted-foreground">Audio (MP3) o Video (MP4) hasta 500MB</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" />
                    </label>
                </div> 
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" asChild><Link href="/sermons">Cancelar</Link></Button>
                <Button>Guardar Sermón</Button>
            </div>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}
