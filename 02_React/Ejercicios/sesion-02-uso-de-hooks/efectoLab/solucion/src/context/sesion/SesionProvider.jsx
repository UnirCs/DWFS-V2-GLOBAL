import { useCallback, useEffect, useMemo, useState } from "react";
import { SesionContext } from "./SesionContext.js";
import { useEstadoPersistente } from "../../hooks/useEstadoPersistente.js";
import {
  CLAVES,
  MAX_ENTRADAS_BITACORA,
  SEGUNDOS_POR_CICLO,
} from "../../constantes.js";
import { horaActual } from "../../utils/tiempo.js";

// ─────────────────────────────────────────────────────────────────────────────
// SesionProvider
//
// Aquí vive TODO el estado que debe sobrevivir al desmontaje de los paneles.
// La regla es simple: el estado sobrevive mientras viva el componente que lo
// declara. Como el Provider está por encima de las pestañas y nunca se
// desmonta, su estado sobrevive al cambiar de pestaña.
//
// Dos niveles de persistencia conviven en este archivo:
//   · useEstadoPersistente → contexto + localStorage  (sobrevive también a F5)
//   · useState             → solo contexto            (se pierde al recargar)
// ─────────────────────────────────────────────────────────────────────────────

export function SesionProvider({ children }) {
  // ── Estado persistido (contexto + localStorage) ────────────────────────────
  const [segundosDeFoco, setSegundosDeFoco] = useEstadoPersistente(CLAVES.segundos, 0);
  const [notas, setNotas] = useEstadoPersistente(CLAVES.notas, []);
  const [borrador, setBorrador] = useEstadoPersistente(CLAVES.borrador, "");
  const [tema, setTema] = useEstadoPersistente(CLAVES.tema, "oscuro");

  // ── Estado NO persistido a propósito (solo contexto) ───────────────────────
  // Que el cronómetro esté en marcha es información de "esta sesión": no tiene
  // sentido recuperarla al recargar.
  const [enMarcha, setEnMarcha] = useState(false);
  const [bitacora, setBitacora] = useState([]);
  // Cuántas veces se ha montado cada panel: { PanelNotas: 3, ... }
  const [montajes, setMontajes] = useState({});

  // ── Acciones ───────────────────────────────────────────────────────────────
  // ⚠️ `useCallback` NO es decorativo aquí: estas funciones viajan en el array de
  // dependencias de los efectos de los paneles. Si se recrearan en cada render,
  // esos efectos se ejecutarían sin parar (bucle infinito).
  const apuntar = useCallback((texto, tipo = "info") => {
    setBitacora((previas) =>
      [{ id: crypto.randomUUID(), hora: horaActual(), texto, tipo }, ...previas].slice(
        0,
        MAX_ENTRADAS_BITACORA,
      ),
    );
  }, []);

  const contarMontaje = useCallback((nombre) => {
    // Actualización funcional: no leemos `montajes` directamente, así esta
    // función no necesita depender de él y puede seguir siendo estable.
    setMontajes((previos) => ({ ...previos, [nombre]: (previos[nombre] ?? 0) + 1 }));
  }, []);

  const limpiarBitacora = useCallback(() => setBitacora([]), []);

  const alternarMarcha = useCallback(() => setEnMarcha((valor) => !valor), []);

  const alternarTema = useCallback(() => {
    setTema((actual) => (actual === "oscuro" ? "claro" : "oscuro"));
  }, [setTema]);

  const guardarNota = useCallback(
    (texto) => {
      const limpio = texto.trim();
      if (!limpio) return;
      setNotas((previas) => [
        { id: crypto.randomUUID(), texto: limpio, hora: horaActual() },
        ...previas,
      ]);
      setBorrador("");
      apuntar(`📌 Nota guardada en localStorage: "${limpio.slice(0, 24)}…"`, "guardado");
    },
    [setNotas, setBorrador, apuntar],
  );

  const borrarNota = useCallback(
    (id) => setNotas((previas) => previas.filter((nota) => nota.id !== id)),
    [setNotas],
  );

  const reiniciarContadores = useCallback(() => {
    setSegundosDeFoco(0);
    setNotas([]);
    setBorrador("");
    setEnMarcha(false);
    // No borramos las claves: los efectos de useEstadoPersistente las
    // reescribirán con los valores por defecto (0, [], "").
    apuntar("♻️ Estado reiniciado (las claves se reescriben con sus valores por defecto)", "aviso");
  }, [setSegundosDeFoco, setNotas, setBorrador, apuntar]);

  const borrarAlmacenYRecargar = useCallback(() => {
    Object.values(CLAVES).forEach((clave) => window.localStorage.removeItem(clave));
    // Recargamos en lugar de resetear el estado: si solo lo reseteáramos, el
    // efecto de guardado volvería a crear las claves inmediatamente. Así se ve
    // de verdad lo que ocurre cuando no hay nada guardado.
    window.location.reload();
  }, []);

  // ── Valor DERIVADO, no estado ──────────────────────────────────────────────
  // Los ciclos se calculan a partir de los segundos. No hace falta un useState
  // ni un useEffect para esto: sería estado duplicado y podría desincronizarse.
  const ciclosCompletados = Math.floor(segundosDeFoco / SEGUNDOS_POR_CICLO);
  const segundosDelCicloActual = segundosDeFoco % SEGUNDOS_POR_CICLO;

  // ─────────────────────────────────────────────────────────────────────────
  // 📎 Sobre los `eslint-disable` que vienen a continuación
  //
  // La regla `react-hooks/set-state-in-effect` prohíbe llamar a un setState de
  // forma SÍNCRONA dentro de un efecto, porque provoca un segundo render en
  // cascada (render → efecto → setState → render). Tiene toda la razón: es una
  // de las primeras causas de bucles infinitos.
  //
  // Aquí lo hacemos a propósito y de forma controlada: `apuntar()` escribe en
  // la bitácora, que es instrumentación de este ejercicio, y los efectos que
  // la usan tienen dependencias ESTABLES, así que la cascada se detiene en un
  // render extra. En una app real el registro no viviría en el estado de React:
  // mira `../ejemplo-rerender-y-remontaje/src/registro.js` para la alternativa
  // con un store externo + `useSyncExternalStore`.
  // ─────────────────────────────────────────────────────────────────────────

  // ── Efecto CONDICIONAL [enMarcha] con limpieza: el cronómetro ──────────────
  // El intervalo vive en el Provider, no en el panel. Por eso el tiempo sigue
  // corriendo aunque el panel del temporizador esté desmontado.
  useEffect(() => {
    // Salida temprana sin función de limpieza: cuando está parado no hay
    // intervalo que cancelar.
    if (!enMarcha) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver nota de arriba
    apuntar("⏱️ setInterval creado · efecto [enMarcha]", "efecto");
    const idIntervalo = setInterval(() => {
      // Actualización funcional: el efecto no depende de `segundosDeFoco`, así
      // que no hay que recrear el intervalo cada segundo.
      setSegundosDeFoco((segundos) => segundos + 1);
    }, 1000);

    return () => {
      clearInterval(idIntervalo);
      apuntar("🧹 clearInterval · limpieza del efecto [enMarcha]", "limpieza");
    };
  }, [enMarcha, apuntar, setSegundosDeFoco]);

  // ── Efecto CONDICIONAL [ciclosCompletados] ─────────────────────────────────
  // El componente se re-renderiza cada segundo, pero este efecto solo se dispara
  // cuando el número de ciclos CAMBIA. Es la mejor demostración de para qué
  // sirve el array de dependencias.
  useEffect(() => {
    if (ciclosCompletados === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver nota de arriba
    apuntar(`🎉 Ciclo ${ciclosCompletados} completado`, "exito");
  }, [ciclosCompletados, apuntar]);

  // ── Efecto CONDICIONAL [tema]: sincronizar React con el DOM ────────────────
  // El <html> está fuera del árbol de React: tocarlo es un efecto secundario y
  // su sitio es un useEffect.
  useEffect(() => {
    document.documentElement.classList.toggle("claro", tema === "claro");
  }, [tema]);

  // ── Efecto de MONTAJE [] del Provider ──────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver nota de arriba
    apuntar("🚀 <SesionProvider> montado · estado hidratado desde localStorage", "montaje");
  }, [apuntar]);

  // `useMemo` evita crear un objeto nuevo en cada render. Sin él, cualquier
  // componente que tuviera el valor del contexto en un array de dependencias
  // volvería a ejecutar sus efectos en todos los renders.
  const valor = useMemo(
    () => ({
      segundosDeFoco,
      segundosDelCicloActual,
      ciclosCompletados,
      enMarcha,
      notas,
      borrador,
      tema,
      bitacora,
      montajes,
      alternarMarcha,
      alternarTema,
      setBorrador,
      guardarNota,
      borrarNota,
      apuntar,
      contarMontaje,
      limpiarBitacora,
      reiniciarContadores,
      borrarAlmacenYRecargar,
    }),
    [
      segundosDeFoco,
      segundosDelCicloActual,
      ciclosCompletados,
      enMarcha,
      notas,
      borrador,
      tema,
      bitacora,
      montajes,
      alternarMarcha,
      alternarTema,
      setBorrador,
      guardarNota,
      borrarNota,
      apuntar,
      contarMontaje,
      limpiarBitacora,
      reiniciarContadores,
      borrarAlmacenYRecargar,
    ],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
