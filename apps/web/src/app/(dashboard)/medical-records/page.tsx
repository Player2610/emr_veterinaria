'use client';

import { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { useMedicalRecords, usePets, type MedicalRecord } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type ColumnDef } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MedicalRecordDetail } from '@/components/medical-records/medical-record-detail';
import { MedicalRecordForm } from '@/components/medical-records/medical-record-form';

export default function MedicalRecordsPage() {
  const [petFilter, setPetFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: pets } = usePets();
  const { data: records, isLoading, mutate } = useMedicalRecords(
    petFilter ? { petId: petFilter } : undefined,
  );

  const columns: ColumnDef<MedicalRecord>[] = [
    {
      id: 'pet',
      header: 'Mascota',
      sortable: true,
      accessorFn: (r) => (
        <span className="font-medium">{r.pet.name}</span>
      ),
    },
    {
      id: 'chiefComplaint',
      header: 'Motivo de consulta',
      accessorFn: (r) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {r.chiefComplaint}
        </span>
      ),
    },
    {
      id: 'vet',
      header: 'Veterinario',
      accessorFn: (r) =>
        r.vet ? (
          <span className="text-sm">
            {r.vet.user.firstName} {r.vet.user.lastName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: 'createdAt',
      header: 'Fecha',
      sortable: true,
      accessorFn: (r) => (
        <span className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      headerClassName: 'w-20',
      accessorFn: (r) => (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => setSelectedRecord(r)}
        >
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial médico"
        description="Registros clínicos de todas las mascotas"
        actions={
          <Button className="gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Nuevo registro
          </Button>
        }
      />

      {/* Pet filter */}
      <div className="flex items-center gap-3">
        <label htmlFor="pet-filter" className="text-sm font-medium">
          Filtrar por mascota:
        </label>
        <select
          id="pet-filter"
          value={petFilter}
          onChange={(e) => setPetFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas las mascotas</option>
          {pets?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={records ?? []}
        columns={columns}
        rowKey="id"
        isLoading={isLoading}
        emptyMessage="No hay registros médicos todavía."
      />

      {/* Detail dialog */}
      <MedicalRecordDetail
        record={selectedRecord}
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Create form dialog */}
      <Dialog open={showForm} onOpenChange={(v) => !v && setShowForm(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo registro médico</DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            onSuccess={() => {
              setShowForm(false);
              void mutate();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
