
"use client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { volunteersData } from "@/lib/data"
import { Users } from 'lucide-react';

const totalVolunteers = volunteersData.length;

export function TotalVolunteers() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Voluntarios Totales</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalVolunteers}</div>
        <p className="text-xs text-muted-foreground">Voluntarios activos</p>
      </CardContent>
    </Card>
  )
}
