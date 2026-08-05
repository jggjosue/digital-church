'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AppHeader } from '@/components/app-header';
import { useToast } from '@/hooks/use-toast';

type PrayerGroup = {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ManagePrayerGroupsPage() {
  const { toast } = useToast();
  const [groups, setGroups] = React.useState<PrayerGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  // Form para crear nuevo grupo
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // Form para editar grupo existente
  const [editingGroup, setEditingGroup] = React.useState<PrayerGroup | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [updating, setUpdating] = React.useState(false);

  // Para eliminar grupo
  const [deletingGroup, setDeletingGroup] = React.useState<PrayerGroup | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadGroups = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/prayer/groups', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.groups)) {
        setGroups(data.groups);
      } else {
        throw new Error(data.error || 'No se pudieron cargar los grupos.');
      }
    } catch (error) {
      toast({
        title: 'Error de carga',
        description: error instanceof Error ? error.message : 'Error al consultar la base de datos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Campo incompleto',
        description: 'Ingrese el nombre del grupo de oración.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/prayer/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo guardar el grupo.');
      }

      toast({
        title: 'Grupo creado',
        description: `El grupo "${data.group?.name || name}" ha sido guardado exitosamente.`,
      });

      setName('');
      setDescription('');
      setIsAddOpen(false);
      await loadGroups();
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'No se pudo crear el grupo.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editName.trim()) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/prayer/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el grupo.');
      }

      toast({
        title: 'Grupo actualizado',
        description: 'Los datos del grupo se han actualizado correctamente.',
      });

      setEditingGroup(null);
      await loadGroups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el grupo.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/prayer/groups/${deletingGroup.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo eliminar el grupo.');
      }

      toast({
        title: 'Grupo eliminado',
        description: `El grupo "${deletingGroup.name}" fue eliminado correctamente.`,
      });

      setDeletingGroup(null);
      await loadGroups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el grupo.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredGroups = React.useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase().trim();
    return groups.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))
    );
  }, [groups, search]);

  return (
    <div className="flex flex-col flex-1">
      <AppHeader
        title="Gestionar Grupos de Oración"
        description="Administre los grupos de oración disponibles para la comunidad."
      >
        <div className="flex items-center gap-2 pt-4 sm:pt-0">
          <Button variant="outline" asChild>
            <Link href="/prayer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Peticiones
            </Link>
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Grupo
          </Button>
        </div>
      </AppHeader>

      <main className="flex-1 space-y-6 p-4 sm:p-8 bg-muted/20">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{groups.length}</div>
              <p className="text-xs text-muted-foreground">Grupos creados en el sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">Activo</div>
              <p className="text-xs text-muted-foreground">Sincronizado con la base de datos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Acción Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setIsAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Crear Nuevo Grupo
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar grupos por nombre..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No se encontraron grupos de oración.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NOMBRE DEL GRUPO</TableHead>
                      <TableHead>DESCRIPCIÓN</TableHead>
                      <TableHead className="hidden md:table-cell">CREADO POR</TableHead>
                      <TableHead className="hidden sm:table-cell">FECHA</TableHead>
                      <TableHead className="text-right">ACCIONES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => {
                      const dateStr = group.createdAt
                        ? new Date(group.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—';

                      return (
                        <TableRow key={group.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary shrink-0" />
                              <span>{group.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                            {group.description || 'Sin descripción'}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {group.createdBy || 'Sistema'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {dateStr}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Editar grupo"
                                onClick={() => {
                                  setEditingGroup(group);
                                  setEditName(group.name);
                                  setEditDescription(group.description || '');
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                title="Eliminar grupo"
                                onClick={() => setDeletingGroup(group)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal para Crear Grupo */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo de Oración</DialogTitle>
            <DialogDescription>
              Complete los detalles para agregar un nuevo grupo de oración a la base de datos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nombre del Grupo</Label>
              <Input
                id="create-name"
                placeholder="Ej. Intercesores de Madrugada"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Descripción (opcional)</Label>
              <Input
                id="create-desc"
                placeholder="Detalles sobre el propósito del grupo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Grupo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Grupo */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo de Oración</DialogTitle>
            <DialogDescription>
              Modifique el nombre o descripción del grupo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateGroup} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Grupo</Label>
              <Input
                id="edit-name"
                placeholder="Nombre del grupo"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descripción (opcional)</Label>
              <Input
                id="edit-desc"
                placeholder="Descripción del grupo"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Eliminar Grupo */}
      <AlertDialog open={!!deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este grupo de oración?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el grupo &quot;{deletingGroup?.name}&quot; de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteGroup();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
