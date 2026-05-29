'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { usePets } from '@/hooks/use-api';

const medicalRecordSchema = z.object({
  petId: z.string().min(1, 'La mascota es obligatoria'),
  chiefComplaint: z.string().min(1, 'El motivo de consulta es obligatorio'),
  anamnesis: z.string().optional(),
  notes: z.string().optional(),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MedicalRecordForm({ onSuccess, onCancel }: MedicalRecordFormProps) {
  const { data: pets } = usePets();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
  });

  const onSubmit = async (values: MedicalRecordFormValues) => {
    await api.post('/medical-records', values);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Pet */}
      <div>
        <label htmlFor="petId" className="mb-1.5 block text-sm font-medium">
          Mascota *
        </label>
        <select
          {...register('petId')}
          id="petId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Selecciona una mascota…</option>
          {pets?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.owner.firstName} {p.owner.lastName})
            </option>
          ))}
        </select>
        {errors.petId && (
          <p className="mt-1 text-xs text-destructive">{errors.petId.message}</p>
        )}
      </div>

      {/* Chief complaint */}
      <div>
        <label htmlFor="chiefComplaint" className="mb-1.5 block text-sm font-medium">
          Motivo de consulta *
        </label>
        <Input
          {...register('chiefComplaint')}
          id="chiefComplaint"
          placeholder="Ej. Vómito y letargia de 24 horas"
          className="h-9 text-sm"
        />
        {errors.chiefComplaint && (
          <p className="mt-1 text-xs text-destructive">{errors.chiefComplaint.message}</p>
        )}
      </div>

      {/* Anamnesis */}
      <div>
        <label htmlFor="anamnesis" className="mb-1.5 block text-sm font-medium">
          Anamnesis
        </label>
        <textarea
          {...register('anamnesis')}
          id="anamnesis"
          rows={3}
          placeholder="Historia clínica del paciente…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
          Notas adicionales
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={2}
          placeholder="Observaciones opcionales…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Crear registro'}
        </Button>
      </div>
    </form>
  );
}
