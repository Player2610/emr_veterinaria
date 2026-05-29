'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PawPrint, Plus, Eye } from 'lucide-react';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { usePets } from '@/hooks/use-api';
import { SPECIES_LABELS } from '@emr/shared';
import { DataTable, type ColumnDef } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/common/empty-state';
import type { Pet } from '@/hooks/use-api';

export function PetList() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePets({ q: search || undefined });

  const columns: ColumnDef<Pet>[] = [
    {
      id: 'name',
      header: 'Mascota',
      sortable: true,
      accessorFn: (pet) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={pet.photoUrl} alt={pet.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              <PawPrint className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{pet.name}</p>
            {pet.breed && (
              <p className="text-xs text-muted-foreground">{pet.breed}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'species',
      header: 'Especie',
      sortable: true,
      accessorFn: (pet) => (
        <Badge variant="secondary">
          {SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] ?? pet.species}
        </Badge>
      ),
    },
    {
      id: 'owner',
      header: 'Propietario',
      sortable: true,
      accessorFn: (pet) => (
        <div>
          <p className="text-sm">
            {pet.owner.firstName} {pet.owner.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{pet.owner.email}</p>
        </div>
      ),
    },
    {
      id: 'lastVisit',
      header: 'Última visita',
      sortable: true,
      accessorFn: (pet) => (
        <span className="text-sm text-muted-foreground">
          {pet.lastVisitAt ? formatDate(pet.lastVisitAt) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-20',
      accessorFn: (pet) => (
        <Link href={`/pets/${pet.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <Eye className="h-4 w-4" />
            Ver
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      data={data ?? []}
      columns={columns}
      rowKey="id"
      isLoading={isLoading}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar por nombre, especie…"
      emptyMessage={
        search
          ? `Sin resultados para "${search}"`
          : 'No hay mascotas registradas todavía.'
      }
    />
  );
}
