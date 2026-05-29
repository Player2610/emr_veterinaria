"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPECIES_LABELS = exports.COMPANION_SPECIES = exports.Species = void 0;
/**
 * Especies soportadas por el sistema.
 * Se puede extender en futuras versiones sin romper compatibilidad.
 */
var Species;
(function (Species) {
    Species["DOG"] = "DOG";
    Species["CAT"] = "CAT";
    Species["BIRD"] = "BIRD";
    Species["RABBIT"] = "RABBIT";
    Species["HAMSTER"] = "HAMSTER";
    Species["GUINEA_PIG"] = "GUINEA_PIG";
    Species["FERRET"] = "FERRET";
    Species["TURTLE"] = "TURTLE";
    Species["SNAKE"] = "SNAKE";
    Species["LIZARD"] = "LIZARD";
    Species["FISH"] = "FISH";
    Species["HORSE"] = "HORSE";
    Species["COW"] = "COW";
    Species["PIG"] = "PIG";
    Species["SHEEP"] = "SHEEP";
    Species["GOAT"] = "GOAT";
    Species["OTHER"] = "OTHER";
})(Species || (exports.Species = Species = {}));
/** Especies de compañía más comunes — útil para filtros rápidos en la UI */
exports.COMPANION_SPECIES = [
    Species.DOG,
    Species.CAT,
    Species.BIRD,
    Species.RABBIT,
    Species.HAMSTER,
    Species.GUINEA_PIG,
    Species.FERRET,
];
/** Etiquetas legibles para mostrar en la UI */
exports.SPECIES_LABELS = {
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
//# sourceMappingURL=species.enum.js.map