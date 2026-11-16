import { useState } from "react";
import { useSesion } from "../hooks/useSesion.js";
import { useCicloDeVida } from "../hooks/useCicloDeVida.js";
import { CLAVES } from "../constantes.js";
import { formatearTiempo } from "../utils/tiempo.js";
import EncabezadoDePanel from "./EncabezadoDePanel.jsx";
import "./Panel.css";

/** Lee las claves de la app tal cual están en el almacén (sin parsear). */
function leerAlmacen() {
  const lectura = {};
  Object.entries(CLAVES).forEach(([nombre, clave]) => {
    lectura[nombre] = window.localStorage.getItem(clave);
  });
  return lectura;
}

// Filas de la tabla-resumen: el mapa mental que debe quedar de este ejercicio.
const NIVELES = [
  { donde: "useRef en el panel", render: "sí", montaje: "no", recarga: "no" },
  { donde: "useState en el panel", render: "sí", montaje: "no", recarga: "no" },
  { donde: "useState en el Provider (contexto)", render: "sí", montaje: "sí", recarga: "no" },
  { donde: "localStorage", render: "sí", montaje: "sí", recarga: "sí" },
];

export default function PanelEstadisticas() {
  const { idInstancia, renders } = useCicloDeVida("PanelEstadisticas");
  const {
    segundosDeFoco,
    ciclosCompletados,
    notas,
    borrador,
    montajes,
    reiniciarContadores,
    borrarAlmacenYRecargar,
  } = useSesion();

  // Copia "cruda" de lo que hay en el almacén, tal cual lo guarda el navegador.
  //
  // El inicializador perezoso lee localStorage en el primer render de cada
  // instancia del panel. Hacerlo así (y no con un `useEffect([])` + setState)
  // evita un segundo render innecesario: la regla
  // `react-hooks/set-state-in-effect` existe precisamente para avisar de eso.
  const [crudo, setCrudo] = useState(leerAlmacen);

  // localStorage NO es reactivo: no avisa a React cuando cambia. Como esta
  // vista se queda desactualizada en cuanto guardamos algo, la refrescamos a
  // mano desde un manejador de eventos (que es el sitio natural para esto).
  function releerAlmacen() {
    setCrudo(leerAlmacen());
  }

  return (
    <article className="panel">
      <EncabezadoDePanel
        titulo="📊 Estadísticas y almacén"
        descripcion="Qué sobrevive a qué, y qué hay realmente guardado en el navegador."
        instancia={idInstancia}
        renders={renders}
      />

      <div className="panel__cuerpo">
        <div className="panel__columnas panel__columnas--tres">
          <div className="cajon">
            <span className="cajon__etiqueta">Foco acumulado</span>
            <strong className="cajon__cifra">{formatearTiempo(segundosDeFoco)}</strong>
          </div>
          <div className="cajon">
            <span className="cajon__etiqueta">Ciclos</span>
            <strong className="cajon__cifra">{ciclosCompletados}</strong>
          </div>
          <div className="cajon">
            <span className="cajon__etiqueta">Notas</span>
            <strong className="cajon__cifra">{notas.length}</strong>
          </div>
        </div>

        <h3 className="panel__subtitulo">Montajes por panel (viven en el contexto)</h3>
        <ul className="chips">
          {Object.keys(montajes).length === 0 && <li className="chips__vacio">Sin datos aún.</li>}
          {Object.entries(montajes).map(([nombre, veces]) => (
            <li key={nombre} className="chips__chip">
              {nombre}: <strong>{veces}</strong>
            </li>
          ))}
        </ul>
        <p className="panel__aviso panel__aviso--tenue">
          ⚠️ En desarrollo cada montaje cuenta <strong>dos veces</strong>: React{" "}
          <code>StrictMode</code> monta, desmonta y vuelve a montar cada componente para delatar
          efectos sin limpieza. En producción cuenta una.
        </p>

        <h3 className="panel__subtitulo">¿Qué sobrevive a qué?</h3>
        <table className="tabla">
          <thead>
            <tr>
              <th>Dónde vive el estado</th>
              <th>Re-render</th>
              <th>Re-montaje</th>
              <th>
                Recarga <kbd>F5</kbd>
              </th>
            </tr>
          </thead>
          <tbody>
            {NIVELES.map((nivel) => (
              <tr key={nivel.donde}>
                <td>{nivel.donde}</td>
                <td className={nivel.render === "sí" ? "si" : "no"}>{nivel.render}</td>
                <td className={nivel.montaje === "sí" ? "si" : "no"}>{nivel.montaje}</td>
                <td className={nivel.recarga === "sí" ? "si" : "no"}>{nivel.recarga}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="panel__subtitulo">Contenido real de localStorage</h3>
        <pre className="volcado">
          {Object.entries(crudo)
            .map(([nombre, valor]) => `${CLAVES[nombre]} = ${valor ?? "(no existe)"}`)
            .join("\n")}
        </pre>
        <p className="panel__aviso panel__aviso--tenue">
          Todo son <strong>strings</strong>: por eso hay que pasar por <code>JSON.stringify</code> al
          guardar y <code>JSON.parse</code> al leer. Borrador actual en el contexto:{" "}
          <code>{borrador === "" ? "(vacío)" : borrador.slice(0, 40)}</code>
        </p>

        <div className="panel__acciones">
          <button className="boton" onClick={releerAlmacen}>
            🔄 Releer almacén
          </button>
          <button className="boton" onClick={reiniciarContadores}>
            ♻️ Poner contadores a cero
          </button>
          <button className="boton boton--peligro" onClick={borrarAlmacenYRecargar}>
            🗑️ Borrar localStorage y recargar
          </button>
        </div>
      </div>
    </article>
  );
}
