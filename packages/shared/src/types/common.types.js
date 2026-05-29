"use strict";
// ─────────────────────────────────────────────────────────────────────────────
// Tipos base
// ─────────────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveStatus = exports.Gender = void 0;
// ─────────────────────────────────────────────────────────────────────────────
// Enumeraciones inline comunes
// ─────────────────────────────────────────────────────────────────────────────
/** Género biológico */
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["UNKNOWN"] = "UNKNOWN";
})(Gender || (exports.Gender = Gender = {}));
/** Estado de activación de una entidad */
var ActiveStatus;
(function (ActiveStatus) {
    ActiveStatus["ACTIVE"] = "ACTIVE";
    ActiveStatus["INACTIVE"] = "INACTIVE";
    ActiveStatus["SUSPENDED"] = "SUSPENDED";
})(ActiveStatus || (exports.ActiveStatus = ActiveStatus = {}));
//# sourceMappingURL=common.types.js.map