import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook: useEstadoPersistente
//
// Es un `useState` que, además, se guarda en localStorage. Reúne dos de las
// variantes de useEffect:
//   · efecto CONDICIONAL  [clave, valor] → escribe en localStorage al cambiar
//   · efecto de MONTAJE   []             → escucha el evento "storage"
// ─────────────────────────────────────────────────────────────────────────────

/** Lee y parsea una clave de localStorage. Nunca lanza: si falla, devuelve el fallback. */
function leerDelAlmacen(clave, fallback) {
  try {
    const crudo = window.localStorage.getItem(clave);
    // null = la clave no existe todavía (primera visita o almacén limpiado)
    if (crudo === null) return fallback;
    return JSON.parse(crudo);
  } catch (error) {
    // Puede fallar por JSON corrupto o por modo privado con el almacén bloqueado
    console.warn(`[useEstadoPersistente] No se pudo leer "${clave}"`, error);
    return fallback;
  }
}

export function useEstadoPersistente(clave, valorInicial) {
  // ── 1. Inicializador PEREZOSO ──────────────────────────────────────────────
  // Pasamos una FUNCIÓN a useState, no el valor. Así React solo la ejecuta en el
  // primer render de este componente y no leemos localStorage en cada render.
  //
  // Hidratar aquí (y no en un `useEffect([])`) tiene una ventaja clave: el primer
  // render ya pinta el valor guardado, sin el "parpadeo" del valor por defecto.
  const [valor, setValor] = useState(() => leerDelAlmacen(clave, valorInicial));

  // Guardamos el valor inicial en un ref para poder usarlo dentro de los efectos
  // sin meterlo en el array de dependencias: si quien nos llama pasa `[]` o `{}`
  // escritos en línea, la referencia cambia en CADA render y el efecto se
  // volvería a ejecutar una y otra vez.
  const valorInicialRef = useRef(valorInicial);

  // Nos permite saltarnos la primera ejecución del efecto de guardado.
  const esPrimeraVez = useRef(true);

  // ── 2. Efecto CONDICIONAL: guardar ─────────────────────────────────────────
  // Se ejecuta en el montaje y después solo cuando `clave` o `valor` cambian.
  useEffect(() => {
    // En el montaje el valor ya viene de localStorage: volver a escribirlo sería
    // trabajo inútil. `useRef` nos sirve de memoria entre renders sin provocar
    // un re-render al modificarlo.
    if (esPrimeraVez.current) {
      esPrimeraVez.current = false;
      return;
    }
    try {
      // localStorage solo almacena strings → hay que serializar con JSON.
      window.localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      // El almacén tiene un límite (~5 MB) y puede estar deshabilitado.
      console.warn(`[useEstadoPersistente] No se pudo guardar "${clave}"`, error);
    }
  }, [clave, valor]);

  // ── 3. Efecto de MONTAJE con limpieza: sincronizar entre pestañas ──────────
  // El evento "storage" lo dispara el navegador en LAS OTRAS pestañas del mismo
  // origen cuando una modifica localStorage. Nunca en la que hizo el cambio.
  useEffect(() => {
    function alCambiarElAlmacen(evento) {
      if (evento.key !== clave) return;
      setValor(
        evento.newValue === null
          ? valorInicialRef.current
          : leerDelAlmacen(clave, valorInicialRef.current),
      );
    }

    window.addEventListener("storage", alCambiarElAlmacen);
    // Sin esta limpieza acumularíamos un listener por cada montaje → fuga de memoria.
    return () => window.removeEventListener("storage", alCambiarElAlmacen);
  }, [clave]);

  return [valor, setValor];
}
