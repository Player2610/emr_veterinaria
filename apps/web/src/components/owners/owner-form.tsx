'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const ownerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio').max(80),
  lastName: z.string().min(1, 'El apellido es obligatorio').max(80),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
  address: z.string().max(255).optional(),
  notes: z.string().optional(),
});

type OwnerFormValues = z.infer<typeof ownerSchema>;

interface OwnerFormProps {
  defaultValues?: Partial<OwnerFormValues>;
  ownerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OwnerForm({ defaultValues, ownerId, onSuccess, onCancel }: OwnerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues,
  });

  const onSubmit = async (values: OwnerFormValues) => {
    if (ownerId) {
      await api.patch(`/owners/${ownerId}`, values);
    } else {
      await api.post('/owners', values);
    }
    onSuccess?.();
  };

  const field = (name: keyof OwnerFormValues) => ({
    ...register(name),
    id: name,
    className: 'h-9 text-sm',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* First name */}
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
            Nombre *
          </label>
          <Input {...field('firstName')} placeholder="Ej. Sofía" />
          {errors.firstName && (
            <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last name */}
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium">
            Apellido *
          </label>
          <Input {...field('lastName')} placeholder="Ej. Ramírez" />
          {errors.lastName && (
            <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
          Teléfono *
        </label>
        <Input {...field('phone')} placeholder="Ej. +57 300 123 4567" />
        {errors.phone && (
          <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input {...field('email')} type="email" placeholder="Ej. sofia@email.com" />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
          Dirección
        </label>
        <Input {...field('address')} placeholder="Ej. Calle 10 # 20-30" />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
          Notas
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
          {isSubmitting ? 'Guardando…' : ownerId ? 'Actualizar' : 'Crear propietario'}
        </Button>
      </div>
    </form>
  );
}
