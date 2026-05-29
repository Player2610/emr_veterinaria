'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, PawPrint, Pencil } from 'lucide-react';
import { usePet } from '@/hooks/use-api';
import { SPECIES_LABELS } from '@emr/shared';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';

interface PetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PetDetailPage({ params }: PetDetailPageProps) {
  const { id } = use(params);
  const { data: pet, isLoading } = usePet(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!pet) {
    return (
      <EmptyState
        icon={PawPrint}
        title="Mascota no encontrada"
        description="No existe ninguna mascota con ese ID, o no tienes acceso."
        action={
          <Link href="/pets">
            <Button variant="outline">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver a mascotas
            </Button>
          </Link>
        }
      />
    );
  }

  const speciesLabel =
    SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] ?? pet.species;

  return (
    <div className="space-y-6">
      <PageHeader
        title={pet.name}
        description={`${speciesLabel}${pet.breed ? ` · ${pet.breed}` : ''}`}
        actions={
          <Button variant="outline" className="gap-1">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        }
      />

      {/* Profile card */}
      <Card>
        <CardContent className="flex items-start gap-5 p-6">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={pet.photoUrl} alt={pet.name} />
            <AvatarFallback className="bg-primary/10">
              <PawPrint className="h-8 w-8 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <Info label="Especie" value={speciesLabel} />
            <Info label="Raza" value={pet.breed ?? '—'} />
            <Info label="Género" value={pet.gender} />
            <Info
              label="Fecha de nacimiento"
              value={pet.dateOfBirth ? formatDate(pet.dateOfBirth) : '—'}
            />
            <Info
              label="Peso"
              value={pet.weight !== undefined ? `${pet.weight} kg` : '—'}
            />
            <Info
              label="Última visita"
              value={pet.lastVisitAt ? formatDate(pet.lastVisitAt) : '—'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Owner */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Propietario</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Info
            label="Nombre"
            value={`${pet.owner.firstName} ${pet.owner.lastName}`}
          />
          <Info label="Email" value={pet.owner.email} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Historial médico</TabsTrigger>
          <TabsTrigger value="vaccines">Vacunas</TabsTrigger>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <EmptyState
            title="Sin registros médicos"
            description="No hay entradas en el historial médico de esta mascota todavía."
            action={<Button>Añadir registro</Button>}
          />
        </TabsContent>

        <TabsContent value="vaccines" className="mt-4">
          <EmptyState
            title="Sin registros de vacunación"
            description="No se han registrado vacunas para esta mascota."
            action={<Button>Registrar vacuna</Button>}
          />
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <EmptyState
            title="Sin citas"
            description="Esta mascota no tiene citas registradas."
            action={<Button>Crear cita</Button>}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
