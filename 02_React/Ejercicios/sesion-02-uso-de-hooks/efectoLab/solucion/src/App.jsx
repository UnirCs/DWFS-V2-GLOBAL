import { useEffect, useRef, useState } from "react";
import { SesionProvider } from "./context/sesion/SesionProvider.jsx";
import Cabecera from "./components/Cabecera.jsx";
import BarraDePestanas from "./components/BarraDePestanas.jsx";
import PanelTemporizador from "./components/PanelTemporizador.jsx";
import PanelNotas from "./components/PanelNotas.jsx";
import PanelEstadisticas from "./components/PanelEstadisticas.jsx";
import Bitacora from "./components/Bitacora.jsx";
import "./App.css";

function Laboratorio() {
  // Pestaña activa: al cambiarla, el panel anterior se DESMONTA y el nuevo se MONTA.
  const [pestana, setPestana] = useState("temporizador");
  // Esta clave se le pasa como `key` al panel. Cambiarla fuerza un re-montaje
  // del MISMO componente: React tira la instancia vieja y crea una nueva.
  const [claveDeMontaje, setClaveDeMontaje] = useState(1);
  // Estado que nadie usa salvo para provocar un re-render del laboratorio.
  const [renderizadosForzados, setRenderizadosForzados] = useState(0);

  // Contador de renders con useRef: lo incrementamos durante el render porque
  // modificar un ref no dispara otro render (con useState sería un bucle).
  // El `eslint-disable` está explicado en src/hooks/useCicloDeVida.js.
  const renders = useRef(0);
  // eslint-disable-next-line react-hooks/refs -- contador de diagnóstico
  const numeroDeRender = (renders.current += 1);

  // ── Efecto INCONDICIONAL (sin array de dependencias) ───────────────────────
  // Se ejecuta después de CADA render, sin excepción. Es el único efecto que no
  // lleva segundo argumento.
  //
  // ⚠️ Aquí NO se puede llamar a un setState ni a `apuntar()` del contexto:
  // provocaría render → efecto → setState → render → efecto… hasta colgar la
  // pestaña. Por eso solo escribimos en `document.title`, que está fuera de React.
  useEffect(() => {
    document.title = `🧪 EfectoLab · render #${numeroDeRender}`;
  }); // <── sin segundo argumento

  return (
    <div className="laboratorio">
      <Cabecera rendersDeApp={numeroDeRender} />

      <main className="laboratorio__cuerpo">
        <section className="laboratorio__escenario">
          <BarraDePestanas activa={pestana} onCambiar={setPestana} />

          <div className="laboratorio__mandos">
            <button
              className="laboratorio__mando"
              onClick={() => setRenderizadosForzados((n) => n + 1)}
            >
              🔄 Forzar re-render ({renderizadosForzados})
            </button>
            <button
              className="laboratorio__mando laboratorio__mando--peligro"
              onClick={() => setClaveDeMontaje((clave) => clave + 1)}
            >
              ♻️ Forzar re-montaje · key={claveDeMontaje}
            </button>
            <p className="laboratorio__pista">
              El primer botón re-renderiza el panel (misma instancia). El segundo cambia su{" "}
              <code>key</code> y lo re-monta (instancia nueva, estado local perdido).
            </p>
          </div>

          {/* Render condicional: el panel que no se cumple no es que se oculte,
              es que NO EXISTE en el árbol. Por eso se desmonta. */}
          {pestana === "temporizador" && <PanelTemporizador key={claveDeMontaje} />}
          {pestana === "notas" && <PanelNotas key={claveDeMontaje} />}
          {pestana === "estadisticas" && <PanelEstadisticas key={claveDeMontaje} />}
        </section>

        <Bitacora />
      </main>
    </div>
  );
}

// `App` solo monta el Provider. El contexto no está disponible en el mismo
// componente que lo provee, solo en sus hijos: por eso el laboratorio es un
// componente aparte.
export default function App() {
  return (
    <SesionProvider>
      <Laboratorio />
    </SesionProvider>
  );
}
