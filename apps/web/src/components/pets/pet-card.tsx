import Link from 'next/link';
import { PawPrint, Calendar } from 'lucide-react';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SPECIES_LABELS } from '@emr/shared';
import type { Pet } from '@/hooks/use-api';

interface PetCardProps {
  pet: Pet;
  className?: string;
}

export function PetCard({ pet, className }: PetCardProps) {
  const speciesLabel =
    SPECIES_LABELS[pet.species as keyof typeof SPECIES_LABELS] ?? pet.species;

  return (
    <Link href={`/pets/${pet.id}`}>
      <Card
        className={cn(
          'cursor-pointer transition-shadow hover:shadow-md',
          className,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarImage src={pet.photoUrl} alt={pet.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <PawPrint className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{pet.name}</p>
                <Badge variant="secondary" className="flex-shrink-0 text-xs">
                  {speciesLabel}
                </Badge>
              </div>
              {pet.breed && (
                <p className="truncate text-xs text-muted-foreground">{pet.breed}</p>
              )}
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {pet.owner.firstName} {pet.owner.lastName}
              </p>
            </div>
          </div>
          {pet.lastVisitAt && (
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Última visita: {formatDate(pet.lastVisitAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
