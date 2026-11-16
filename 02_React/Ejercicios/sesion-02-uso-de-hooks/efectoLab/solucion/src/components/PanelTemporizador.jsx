import { useEffect, useRef, useState } from "react";
import { useSesion } from "../hooks/useSesion.js";
import { useCicloDeVida } from "../hooks/useCicloDeVida.js";
import { formatearTiempo } from "../utils/tiempo.js";
import { SEGUNDOS_POR_CICLO } from "../constantes.js";
import EncabezadoDePanel from "./EncabezadoDePanel.jsx";
import "./Panel.css";

export default function PanelTemporizador() {
  const { idInstancia, renders } = useCicloDeVida("PanelTemporizador");
  const {
    segundosDeFoco,
    segundosDelCicloActual,
    ciclosCompletados,
    enMarcha,
    alternarMarcha,
    apuntar,
  } = useSesion();

  // ── Estado LOCAL: se pierde en cada re-montaje ─────────────────────────────
  // Mide cuánto tiempo lleva montada ESTA instancia del panel.
  const [segundosMontado, setSegundosMontado] = useState(0);

  // ── Efecto de MONTAJE [] con limpieza: intervalo propio del panel ──────────
  // Este intervalo nace y muere con el panel. Al cambiar de pestaña se cancela
  // y el contador vuelve a cero: por eso el tiempo "de esta instancia" no sirve
  // para guardar nada importante.
  useEffect(() => {
    const idIntervalo = setInterval(() => setSegundosMontado((s) => s + 1), 1000);
    return () => clearInterval(idIntervalo);
  }, []);

  // ── Efecto INCONDICIONAL (sin array) ───────────────────────────────────────
  // Escribe directamente en el DOM a través de un ref. Al no tocar el estado no
  // hay riesgo de bucle infinito. Con el cronómetro en marcha verás la marca de
  // tiempo cambiar cada segundo: una prueba visible de que se ejecuta en cada render.
  const selloRef = useRef(null);
  useEffect(() => {
    if (!selloRef.current) return;
    selloRef.current.textContent = `efecto sin dependencias · render nº ${renders} · ${new Date().toLocaleTimeString("es-ES")}`;
  });

  // ── Efecto CONDICIONAL [enMarcha] ──────────────────────────────────────────
  // Aunque el componente se renderice cada segundo, esto solo se dispara al
  // montar y cuando el botón cambia de estado. Nunca por el paso del tiempo.
  useEffect(() => {
    apuntar(
      `${enMarcha ? "▶️" : "⏸️"} Panel sincronizado · efecto [enMarcha] = ${enMarcha}`,
      "efecto",
    );
  }, [enMarcha, apuntar]);

  const progreso = Math.round((segundosDelCicloActual / SEGUNDOS_POR_CICLO) * 100);

  return (
    <article className="panel">
      <EncabezadoDePanel
        titulo="⏱️ Temporizador de foco"
        descripcion="Compara un contador que vive en el contexto con otro que vive en el propio panel."
        instancia={idInstancia}
        renders={renders}
      />

      <div className="panel__cuerpo">
        <div className="panel__columnas">
          <div className="cajon cajon--ok">
            <span className="cajon__etiqueta">Tiempo total de foco</span>
            <strong className="cajon__cifra">{formatearTiempo(segundosDeFoco)}</strong>
            <p className="cajon__nota">
              Contexto + <code>localStorage</code>. Sobrevive al cambio de pestaña y a{" "}
              <kbd>F5</kbd>.
            </p>
          </div>

          <div className="cajon cajon--ko">
            <span className="cajon__etiqueta">Tiempo de esta instancia</span>
            <strong className="cajon__cifra">{formatearTiempo(segundosMontado)}</strong>
            <p className="cajon__nota">
              <code>useState</code> local. Vuelve a <code>00:00</code> en cada re-montaje.
            </p>
          </div>
        </div>

        <div className="progreso">
          <div className="progreso__barra" style={{ width: `${progreso}%` }} />
        </div>
        <p className="panel__linea">
          Ciclo en curso: <strong>{segundosDelCicloActual}s</strong> de {SEGUNDOS_POR_CICLO}s ·
          ciclos completados: <strong>{ciclosCompletados}</strong>
        </p>

        <div className="panel__acciones">
          <button
            className={`boton ${enMarcha ? "boton--peligro" : "boton--principal"}`}
            onClick={alternarMarcha}
          >
            {enMarcha ? "⏸️ Pausar" : "▶️ Arrancar"}
          </button>
          <span className="panel__linea panel__linea--tenue" ref={selloRef} />
        </div>

        <p className="panel__aviso">
          💡 Arranca el cronómetro y cambia a otra pestaña: el panel se desmonta, su intervalo se
          cancela, pero el <strong>tiempo total sigue subiendo</strong> porque ese intervalo vive en
          el <code>SesionProvider</code>, que no se desmonta.
        </p>
      </div>
    </article>
  );
}
