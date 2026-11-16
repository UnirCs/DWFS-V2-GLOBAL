import { useEffect, useRef, useState } from "react";
import { useSesion } from "../hooks/useSesion.js";
import { useCicloDeVida } from "../hooks/useCicloDeVida.js";
import { RETARDO_AUTOGUARDADO } from "../constantes.js";
import EncabezadoDePanel from "./EncabezadoDePanel.jsx";
import "./Panel.css";

export default function PanelNotas() {
  const { idInstancia, renders } = useCicloDeVida("PanelNotas");
  const { borrador, setBorrador, notas, guardarNota, borrarNota, apuntar } = useSesion();

  // ── Borrador CON red de seguridad ──────────────────────────────────────────
  // El estado local arranca con el valor del contexto. Como el contexto lo tomó
  // de localStorage, al re-montar el panel el texto reaparece.
  const [texto, setTexto] = useState(borrador);

  // ── Borrador SIN red de seguridad (para comparar) ──────────────────────────
  const [textoVolatil, setTextoVolatil] = useState("");

  const areaRef = useRef(null);

  // ── Efecto de MONTAJE []: enfocar el textarea ──────────────────────────────
  // Manipular el foco es tocar el DOM: un efecto secundario clásico. En el
  // primer render el nodo todavía no existe; dentro del efecto ya sí.
  useEffect(() => {
    areaRef.current?.focus();
  }, []);

  // ── Efecto CONDICIONAL [texto] con limpieza: autoguardado con debounce ─────
  // Cada pulsación programa un guardado dentro de 600 ms. Si sigues escribiendo,
  // la función de limpieza cancela el guardado anterior antes de programar el
  // siguiente. Resultado: se guarda una vez al dejar de escribir, no 40 veces.
  useEffect(() => {
    if (texto === borrador) return; // ya está guardado, no hay nada que hacer

    const idTemporizador = setTimeout(() => {
      setBorrador(texto); // → useEstadoPersistente lo escribe en localStorage
      apuntar(`💾 Borrador autoguardado (${texto.length} caracteres)`, "guardado");
    }, RETARDO_AUTOGUARDADO);

    // Limpieza: se ejecuta ANTES de la siguiente ejecución del efecto y al
    // desmontar. Sin ella tendríamos un setTimeout por cada tecla pulsada.
    return () => clearTimeout(idTemporizador);
  }, [texto, borrador, setBorrador, apuntar]);

  return (
    <article className="panel">
      <EncabezadoDePanel
        titulo="📝 Notas de la sesión"
        descripcion="Dos borradores idénticos: uno respaldado por contexto + localStorage y otro no."
        instancia={idInstancia}
        renders={renders}
      />

      <div className="panel__cuerpo">
        <div className="panel__columnas">
          <div className="cajon cajon--ok">
            <span className="cajon__etiqueta">Borrador persistente</span>
            <textarea
              ref={areaRef}
              className="area"
              rows={4}
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Escribe y espera medio segundo…"
            />
            <p className="cajon__nota">
              Autoguardado en <code>localStorage</code> {RETARDO_AUTOGUARDADO} ms después de la
              última tecla.
            </p>
          </div>

          <div className="cajon cajon--ko">
            <span className="cajon__etiqueta">Borrador volátil</span>
            <textarea
              className="area"
              rows={4}
              value={textoVolatil}
              onChange={(evento) => setTextoVolatil(evento.target.value)}
              placeholder="Esto se perderá…"
            />
            <p className="cajon__nota">
              Solo <code>useState</code> local: desaparece al cambiar de pestaña o al re-montar.
            </p>
          </div>
        </div>

        <div className="panel__acciones">
          <button
            className="boton boton--principal"
            onClick={() => {
              guardarNota(texto);
              setTexto("");
            }}
            disabled={!texto.trim()}
          >
            📌 Guardar como nota
          </button>
          <span className="panel__linea panel__linea--tenue">
            {notas.length} nota(s) en <code>localStorage</code>
          </span>
        </div>

        <ul className="lista">
          {notas.length === 0 && <li className="lista__vacia">Todavía no hay notas guardadas.</li>}
          {notas.map((nota) => (
            <li key={nota.id} className="lista__elemento">
              <div>
                <p>{nota.texto}</p>
                <span className="lista__hora">{nota.hora}</span>
              </div>
              <button
                className="boton boton--icono"
                onClick={() => borrarNota(nota.id)}
                aria-label={`Borrar nota ${nota.texto}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <p className="panel__aviso">
          💡 Escribe en los dos recuadros, espera un segundo, cambia a Estadísticas y vuelve. Solo
          uno de los dos textos ha sobrevivido. Prueba ahora a cambiar de pestaña{" "}
          <strong>sin esperar</strong>: la limpieza del efecto cancela el autoguardado pendiente y
          pierdes las últimas letras.
        </p>
      </div>
    </article>
  );
}
