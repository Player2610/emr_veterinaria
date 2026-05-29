'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppointmentType, AppointmentPriority } from '@emr/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const appointmentSchema = z.object({
  petId: z.string().min(1, 'La mascota es obligatoria'),
  scheduledAt: z.string().min(1, 'La fecha es obligatoria'),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  type: z.nativeEnum(AppointmentType),
  priority: z.nativeEnum(AppointmentPriority),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const TYPE_LABELS: Record<AppointmentType, string> = {
  [AppointmentType.GENERAL_CHECKUP]: 'Chequeo general',
  [AppointmentType.VACCINATION]: 'Vacunación',
  [AppointmentType.SURGERY]: 'Cirugía',
  [AppointmentType.EMERGENCY]: 'Urgencia',
  [AppointmentType.FOLLOW_UP]: 'Seguimiento',
  [AppointmentType.SPECIALIST]: 'Especialista',
  [AppointmentType.GROOMING]: 'Estética',
  [AppointmentType.LABORATORY]: 'Laboratorio',
  [AppointmentType.IMAGING]: 'Imagen diagnóstica',
  [AppointmentType.OTHER]: 'Otro',
};

interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentFormValues>;
  appointmentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentForm({
  defaultValues,
  appointmentId,
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: defaultValues ?? {
      durationMinutes: 30,
      type: AppointmentType.GENERAL_CHECKUP,
      priority: AppointmentPriority.NORMAL,
    },
  });

  const onSubmit = async (values: AppointmentFormValues) => {
    if (appointmentId) {
      await api.patch(`/appointments/${appointmentId}`, values);
    } else {
      await api.post('/appointments', values);
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Pet ID */}
      <div>
        <label htmlFor="petId" className="mb-1.5 block text-sm font-medium">
          ID Mascota *
        </label>
        <Input
          {...register('petId')}
          id="petId"
          placeholder="UUID de la mascota"
          className="h-9 text-sm"
        />
        {errors.petId && (
          <p className="mt-1 text-xs text-destructive">{errors.petId.message}</p>
        )}
      </div>

      {/* Date & time */}
      <div>
        <label htmlFor="scheduledAt" className="mb-1.5 block text-sm font-medium">
          Fecha y hora *
        </label>
        <Input
          {...register('scheduledAt')}
          id="scheduledAt"
          type="datetime-local"
          className="h-9 text-sm"
        />
        {errors.scheduledAt && (
          <p className="mt-1 text-xs text-destructive">{errors.scheduledAt.message}</p>
        )}
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="durationMinutes" className="mb-1.5 block text-sm font-medium">
          Duración (minutos)
        </label>
        <Input
          {...register('durationMinutes')}
          id="durationMinutes"
          type="number"
          min={5}
          max={480}
          className="h-9 text-sm"
        />
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="mb-1.5 block text-sm font-medium">
          Tipo
        </label>
        <select
          {...register('type')}
          id="type"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {Object.values(AppointmentType).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="mb-1.5 block text-sm font-medium">
          Prioridad
        </label>
        <select
          {...register('priority')}
          id="priority"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value={AppointmentPriority.LOW}>Baja</option>
          <option value={AppointmentPriority.NORMAL}>Normal</option>
          <option value={AppointmentPriority.HIGH}>Alta</option>
          <option value={AppointmentPriority.URGENT}>Urgente</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
          Notas
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={3}
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
          {isSubmitting
            ? 'Guardando…'
            : appointmentId
              ? 'Actualizar cita'
              : 'Crear cita'}
        </Button>
      </div>
    </form>
  );
}
