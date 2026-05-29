'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Species, Gender } from '@emr/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useOwners } from '@/hooks/use-api';

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const petSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  species: z.nativeEnum(Species),
  breed: z.string().optional(),
  gender: z.nativeEnum(Gender),
  dateOfBirth: z.string().optional(),
  weight: z.coerce.number().positive().optional(),
  ownerId: z.string().min(1, 'El propietario es obligatorio'),
});

type PetFormValues = z.infer<typeof petSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface PetFormProps {
  defaultValues?: Partial<PetFormValues>;
  petId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PetForm({ defaultValues, petId, onSuccess, onCancel }: PetFormProps) {
  const { data: owners } = useOwners();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PetFormValues>({
    resolver: zodResolver(petSchema),
    defaultValues: defaultValues ?? { gender: Gender.UNKNOWN },
  });

  const onSubmit = async (values: PetFormValues) => {
    if (petId) {
      await api.patch(`/pets/${petId}`, values);
    } else {
      await api.post('/pets', values);
    }
    onSuccess?.();
  };

  const field = (name: keyof PetFormValues) => ({
    ...register(name),
    id: name,
    className: 'h-9 text-sm',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Nombre *
        </label>
        <Input {...field('name')} placeholder="Ej. Max" />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Species */}
      <div>
        <label htmlFor="species" className="mb-1.5 block text-sm font-medium">
          Especie *
        </label>
        <select
          {...register('species')}
          id="species"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {Object.values(Species).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.species && (
          <p className="mt-1 text-xs text-destructive">{errors.species.message}</p>
        )}
      </div>

      {/* Breed */}
      <div>
        <label htmlFor="breed" className="mb-1.5 block text-sm font-medium">
          Raza
        </label>
        <Input {...field('breed')} placeholder="Ej. Labrador" />
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="mb-1.5 block text-sm font-medium">
          Sexo *
        </label>
        <select
          {...register('gender')}
          id="gender"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value={Gender.MALE}>Macho</option>
          <option value={Gender.FEMALE}>Hembra</option>
          <option value={Gender.UNKNOWN}>Desconocido</option>
        </select>
      </div>

      {/* Date of birth */}
      <div>
        <label htmlFor="dateOfBirth" className="mb-1.5 block text-sm font-medium">
          Fecha de nacimiento
        </label>
        <Input {...field('dateOfBirth')} type="date" />
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="mb-1.5 block text-sm font-medium">
          Peso (kg)
        </label>
        <Input {...field('weight')} type="number" step="0.1" placeholder="Ej. 8.5" />
      </div>

      {/* Owner */}
      <div>
        <label htmlFor="ownerId" className="mb-1.5 block text-sm font-medium">
          Propietario *
        </label>
        <select
          {...register('ownerId')}
          id="ownerId"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Selecciona un propietario…</option>
          {owners?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.firstName} {o.lastName}
            </option>
          ))}
        </select>
        {errors.ownerId && (
          <p className="mt-1 text-xs text-destructive">{errors.ownerId.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : petId ? 'Actualizar' : 'Crear mascota'}
        </Button>
      </div>
    </form>
  );
}
