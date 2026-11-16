import { useSesion } from "../hooks/useSesion.js";
import { formatearTiempo } from "../utils/tiempo.js";
import "./Cabecera.css";

export default function Cabecera({ rendersDeApp }) {
  // Datos globales vía contexto: la cabecera no recibe ni `tema` ni los
  // segundos por props, aunque esté a dos niveles del Provider.
  const { segundosDeFoco, ciclosCompletados, tema, alternarTema, enMarcha } = useSesion();

  return (
    <header className="cabecera">
      <div className="cabecera__titulo">
        <h1>🧪 EfectoLab</h1>
        <p>Efectos, re-renders, re-montajes y persistencia</p>
      </div>

      <div className="cabecera__marcadores">
        <span className="cabecera__marcador" title="Vive en el contexto + localStorage">
          ⏱️ {formatearTiempo(segundosDeFoco)}
          {enMarcha && <em className="cabecera__latido" />}
        </span>
        <span className="cabecera__marcador" title="Valor derivado de los segundos">
          🎯 {ciclosCompletados} ciclos
        </span>
        <span className="cabecera__marcador" title="Contado con useRef en App">
          🔄 {rendersDeApp} renders
        </span>
        <button className="cabecera__tema" onClick={alternarTema}>
          {tema === "oscuro" ? "☀️ Tema claro" : "🌙 Tema oscuro"}
        </button>
      </div>
    </header>
  );
}
