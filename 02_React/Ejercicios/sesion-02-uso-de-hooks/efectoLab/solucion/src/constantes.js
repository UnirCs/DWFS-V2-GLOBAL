// ─────────────────────────────────────────────────────────────────────────────
// Constantes compartidas por toda la app.
//
// Viven en su propio archivo (y no dentro del Provider) porque ESLint con
// `react-refresh` exige que un archivo que exporta componentes NO exporte
// además otros valores.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Claves de localStorage. Usar un prefijo ("efectolab:") evita colisionar con
 * otras apps que se sirvan desde el mismo origen (localhost:5173, por ejemplo).
 */
export const CLAVES = {
  segundos: "efectolab:segundos-de-foco",
  notas: "efectolab:notas",
  borrador: "efectolab:borrador",
  tema: "efectolab:tema",
};

/** Duración de un ciclo de foco. 20s en lugar de 25min para poder verlo en clase. */
export const SEGUNDOS_POR_CICLO = 20;

/** Máximo de entradas que guardamos en la bitácora (evita crecer sin límite). */
export const MAX_ENTRADAS_BITACORA = 40;

/** Retardo del autoguardado del borrador (debounce) en milisegundos. */
export const RETARDO_AUTOGUARDADO = 600;
