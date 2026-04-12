import "./RenderCounter.css";

// Componente auxiliar que hace visible el efecto del useEffect sin dependencias
export default function RenderCounter({ count }) {
  return (
    <footer className="render-counter">
      <span className="render-counter__badge">🔄 Renders del componente raíz: <strong>{count}</strong></span>
      <span className="render-counter__hint">← Este contador aumenta con cada interacción porque el useEffect sin [] se ejecuta en CADA render</span>
    </footer>
  );
}
