/**
 * Especies soportadas por el sistema.
 * Se puede extender en futuras versiones sin romper compatibilidad.
 */
export declare enum Species {
    DOG = "DOG",
    CAT = "CAT",
    BIRD = "BIRD",
    RABBIT = "RABBIT",
    HAMSTER = "HAMSTER",
    GUINEA_PIG = "GUINEA_PIG",
    FERRET = "FERRET",
    TURTLE = "TURTLE",
    SNAKE = "SNAKE",
    LIZARD = "LIZARD",
    FISH = "FISH",
    HORSE = "HORSE",
    COW = "COW",
    PIG = "PIG",
    SHEEP = "SHEEP",
    GOAT = "GOAT",
    OTHER = "OTHER"
}
/** Especies de compañía más comunes — útil para filtros rápidos en la UI */
export declare const COMPANION_SPECIES: Species[];
/** Etiquetas legibles para mostrar en la UI */
export declare const SPECIES_LABELS: Record<Species, string>;
//# sourceMappingURL=species.enum.d.ts.map