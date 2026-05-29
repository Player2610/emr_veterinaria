/**
 * Especies soportadas por el sistema.
 * Se puede extender en futuras versiones sin romper compatibilidad.
 */
export enum Species {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  RABBIT = 'RABBIT',
  HAMSTER = 'HAMSTER',
  GUINEA_PIG = 'GUINEA_PIG',
  FERRET = 'FERRET',
  TURTLE = 'TURTLE',
  SNAKE = 'SNAKE',
  LIZARD = 'LIZARD',
  FISH = 'FISH',
  HORSE = 'HORSE',
  COW = 'COW',
  PIG = 'PIG',
  SHEEP = 'SHEEP',
  GOAT = 'GOAT',
  OTHER = 'OTHER',
}

/** Especies de compañía más comunes — útil para filtros rápidos en la UI */
export const COMPANION_SPECIES: Species[] = [
  Species.DOG,
  Species.CAT,
  Species.BIRD,
  Species.RABBIT,
  Species.HAMSTER,
  Species.GUINEA_PIG,
  Species.FERRET,
];

/** Etiquetas legibles para mostrar en la UI */
export const SPECIES_LABELS: Record<Species, string> = {
  [Species.DOG]: 'Perro',
  [Species.CAT]: 'Gato',
  [Species.BIRD]: 'Ave',
  [Species.RABBIT]: 'Conejo',
  [Species.HAMSTER]: 'Hámster',
  [Species.GUINEA_PIG]: 'Cobaya',
  [Species.FERRET]: 'Hurón',
  [Species.TURTLE]: 'Tortuga',
  [Species.SNAKE]: 'Serpiente',
  [Species.LIZARD]: 'Lagarto',
  [Species.FISH]: 'Pez',
  [Species.HORSE]: 'Caballo',
  [Species.COW]: 'Vaca',
  [Species.PIG]: 'Cerdo',
  [Species.SHEEP]: 'Oveja',
  [Species.GOAT]: 'Cabra',
  [Species.OTHER]: 'Otro',
};
