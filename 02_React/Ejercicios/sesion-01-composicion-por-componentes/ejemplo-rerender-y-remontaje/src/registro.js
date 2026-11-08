// Registro FUERA del estado de React: si los efectos hicieran setState
// en el padre, provocarían renders extra y falsearían la prueba.
let entradas = [];
const suscriptores = new Set();

export function registrar(texto, tipo = "efecto") {
    entradas = [...entradas, {id: entradas.length + 1, texto, tipo}];
    console.log(texto);
    suscriptores.forEach((fn) => fn());
}

export function limpiarRegistro() {
    entradas = [];
    suscriptores.forEach((fn) => fn());
}

export function suscribir(fn) {
    suscriptores.add(fn);
    return () => suscriptores.delete(fn);
}

export function obtenerEntradas() {
    return entradas;
}