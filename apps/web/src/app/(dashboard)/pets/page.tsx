import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { PetList } from '@/components/pets/pet-list';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PetForm } from '@/components/pets/pet-form';

export const metadata: Metadata = { title: 'Mascotas' };

export default function PetsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mascotas"
        description="Gestiona todas las mascotas registradas en la clínica"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Nueva mascota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar mascota</DialogTitle>
              </DialogHeader>
              <PetForm />
            </DialogContent>
          </Dialog>
        }
      />
      <PetList />
    </div>
  );
}
