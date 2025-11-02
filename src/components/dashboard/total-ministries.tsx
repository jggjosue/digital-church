
"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ministriesData } from "@/lib/data"
import { Church } from 'lucide-react';

const totalMinistries = ministriesData.length;

export function TotalMinistries() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Ministerios Totales</CardTitle>
        <Church className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalMinistries}</div>
         <p className="text-xs text-muted-foreground">Ministerios activos de la iglesia</p>
      </CardContent>
    </Card>
  )
}
