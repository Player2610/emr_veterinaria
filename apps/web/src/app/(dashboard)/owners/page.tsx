'use client';

import { useState } from 'react';
import { Plus, Eye, Pencil } from 'lucide-react';
import { useOwners, type Owner } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type ColumnDef } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OwnerForm } from '@/components/owners/owner-form';

export default function OwnersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);

  const { data, isLoading, mutate } = useOwners();

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (owner: Owner) => {
    setEditing(owner);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditing(null);
    void mutate();
  };

  const columns: ColumnDef<Owner>[] = [
    {
      id: 'name',
      header: 'Nombre',
      sortable: true,
      accessorFn: (o) => (
        <div>
          <p className="font-medium">
            {o.firstName} {o.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{o.email}</p>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Teléfono',
      accessorFn: (o) => (
        <span className="text-sm text-muted-foreground">{o.phone ?? '—'}</span>
      ),
    },
    {
      id: 'pets',
      header: 'Mascotas',
      sortable: true,
      accessorFn: (o) => <Badge variant="secondary">{o.petsCount}</Badge>,
    },
    {
      id: 'createdAt',
      header: 'Registrado',
      sortable: true,
      accessorFn: (o) => (
        <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-28',
      accessorFn: (o) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="gap-1">
            <Eye className="h-4 w-4" />
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => openEdit(o)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propietarios"
        description="Clientes registrados en la clínica"
        actions={
          <Button className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo propietario
          </Button>
        }
      />

      <DataTable
        data={data ?? []}
        columns={columns}
        rowKey="id"
        isLoading={isLoading}
        emptyMessage="No hay propietarios registrados todavía."
      />

      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar propietario' : 'Nuevo propietario'}
            </DialogTitle>
          </DialogHeader>
          <OwnerForm
            defaultValues={
              editing
                ? {
                    firstName: editing.firstName,
                    lastName: editing.lastName,
                    email: editing.email ?? '',
                    phone: editing.phone ?? '',
                  }
                : undefined
            }
            ownerId={editing?.id}
            onSuccess={handleSuccess}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
