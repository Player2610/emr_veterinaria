"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PetIdentificationType = exports.HealthStatus = exports.ReproductiveStatus = void 0;
// ─────────────────────────────────────────────────────────────────────────────
// Información clínica de la mascota
// ─────────────────────────────────────────────────────────────────────────────
/** Estado reproductivo del animal */
var ReproductiveStatus;
(function (ReproductiveStatus) {
    ReproductiveStatus["INTACT"] = "INTACT";
    ReproductiveStatus["SPAYED"] = "SPAYED";
    ReproductiveStatus["NEUTERED"] = "NEUTERED";
    ReproductiveStatus["UNKNOWN"] = "UNKNOWN";
})(ReproductiveStatus || (exports.ReproductiveStatus = ReproductiveStatus = {}));
/** Estado de salud general */
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "HEALTHY";
    HealthStatus["UNDER_TREATMENT"] = "UNDER_TREATMENT";
    HealthStatus["CHRONIC_CONDITION"] = "CHRONIC_CONDITION";
    HealthStatus["CRITICAL"] = "CRITICAL";
    HealthStatus["DECEASED"] = "DECEASED";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
/** Tipo de identificación del animal */
var PetIdentificationType;
(function (PetIdentificationType) {
    PetIdentificationType["MICROCHIP"] = "MICROCHIP";
    PetIdentificationType["TATTOO"] = "TATTOO";
    PetIdentificationType["COLLAR_TAG"] = "COLLAR_TAG";
    PetIdentificationType["NONE"] = "NONE";
})(PetIdentificationType || (exports.PetIdentificationType = PetIdentificationType = {}));
//# sourceMappingURL=patient.types.js.map