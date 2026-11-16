import "./BarraDePestanas.css";

// Constante local (no exportada) → no molesta a la regla de Fast Refresh.
const PESTANAS = [
  { id: "temporizador", etiqueta: "⏱️ Temporizador" },
  { id: "notas", etiqueta: "📝 Notas" },
  { id: "estadisticas", etiqueta: "📊 Estadísticas" },
];

export default function BarraDePestanas({ activa, onCambiar }) {
  return (
    <nav className="pestanas" aria-label="Paneles del laboratorio">
      {PESTANAS.map((pestana) => (
        <button
          key={pestana.id}
          className={`pestanas__boton ${activa === pestana.id ? "pestanas__boton--activa" : ""}`}
          aria-current={activa === pestana.id}
          onClick={() => onCambiar(pestana.id)}
        >
          {pestana.etiqueta}
        </button>
      ))}
    </nav>
  );
}
