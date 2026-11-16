import { useSesion } from "../hooks/useSesion.js";
import "./Bitacora.css";

export default function Bitacora() {
  // La bitácora vive en el contexto: por eso no se borra al cambiar de pestaña,
  // aunque las entradas las generen componentes que ya se han desmontado.
  const { bitacora, limpiarBitacora } = useSesion();

  return (
    <aside className="bitacora">
      <header className="bitacora__cabecera">
        <h2>📜 Bitácora de efectos</h2>
        <button className="bitacora__limpiar" onClick={limpiarBitacora}>
          Limpiar
        </button>
      </header>

      <ol className="bitacora__lista">
        {bitacora.length === 0 && (
          <li className="bitacora__vacia">Interactúa con el laboratorio para ver efectos aquí.</li>
        )}
        {/* Las entradas más recientes van primero */}
        {bitacora.map((entrada) => (
          <li key={entrada.id} className={`bitacora__entrada bitacora__entrada--${entrada.tipo}`}>
            <span className="bitacora__hora">{entrada.hora}</span>
            <span className="bitacora__texto">{entrada.texto}</span>
          </li>
        ))}
      </ol>

      <p className="bitacora__pie">
        Sobrevive a re-montajes (vive en el contexto) pero no a <kbd>F5</kbd>: no se persiste a
        propósito.
      </p>
    </aside>
  );
}
