/** Convierte 125 en "02:05". */
export function formatearTiempo(totalSegundos) {
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

/** Hora actual legible, para sellar las entradas de la bitácora. */
export function horaActual() {
  return new Date().toLocaleTimeString("es-ES");
}
