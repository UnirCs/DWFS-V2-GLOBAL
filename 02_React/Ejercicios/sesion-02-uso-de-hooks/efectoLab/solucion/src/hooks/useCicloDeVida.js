import { useEffect, useRef, useState } from "react";
import { useSesion } from "./useSesion.js";

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hook: useCicloDeVida
//
// Instrumenta un componente para poder VER su ciclo de vida:
//   · un identificador de instancia, nuevo en cada MONTAJE
//   · el número de render actual de esa instancia
//   · entradas en la bitácora al montarse y al desmontarse
//
// Lo usan los tres paneles, así que es el ejemplo perfecto de por qué existen
// los custom hooks: la misma lógica con hooks reutilizada en varios sitios.
// ─────────────────────────────────────────────────────────────────────────────

export function useCicloDeVida(nombre) {
  const { apuntar, contarMontaje } = useSesion();

  // El inicializador perezoso solo se ejecuta una vez por INSTANCIA. Si el id
  // que ves en pantalla cambia, es que el componente se ha vuelto a montar;
  // si se mantiene, solo ha habido re-renders.
  const [idInstancia] = useState(() => Math.random().toString(36).slice(2, 7));

  // useRef guarda un valor entre renders SIN provocar un re-render al cambiarlo.
  // Con useState aquí tendríamos un bucle infinito: render → setState → render…
  //
  // 📎 ESLint avisa (`react-hooks/refs`) de que no se deben tocar refs durante
  // el render: React no garantiza que un cambio en `.current` se refleje en la
  // pantalla. Lo aceptamos sabiendo lo que hacemos porque es un contador de
  // diagnóstico, no un dato del que dependa la corrección de la UI.
  const renders = useRef(0);
  // eslint-disable-next-line react-hooks/refs -- contador de diagnóstico
  const numeroDeRender = (renders.current += 1);

  // ── Efecto de MONTAJE [] con limpieza ──────────────────────────────────────
  // Array vacío = "no dependo de nada", así que React solo lo ejecuta al montar
  // y solo limpia al desmontar. Es el equivalente a componentDidMount +
  // componentWillUnmount de los componentes de clase.
  useEffect(() => {
    apuntar(`🟢 MONTAJE de <${nombre}> · instancia ${idInstancia}`, "montaje");
    contarMontaje(nombre);

    // La función de limpieza del efecto [] = el desmontaje del componente.
    return () => {
      apuntar(`🔴 DESMONTAJE de <${nombre}> · instancia ${idInstancia}`, "desmontaje");
    };
    // Todas las dependencias son estables (strings y funciones con useCallback),
    // de modo que en la práctica este array se comporta como un `[]`.
  }, [nombre, idInstancia, apuntar, contarMontaje]);

  return { idInstancia, renders: numeroDeRender };
}
