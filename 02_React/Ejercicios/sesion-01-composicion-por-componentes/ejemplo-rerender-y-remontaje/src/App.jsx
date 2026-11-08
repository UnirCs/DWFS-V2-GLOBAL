import {useCallback, useMemo, useState, useSyncExternalStore} from "react";
import Hijo from "./Hijo.jsx";
import {limpiarRegistro, obtenerEntradas, registrar, suscribir} from "./registro.js";

function Registro() {
    const entradas = useSyncExternalStore(suscribir, obtenerEntradas);
    return (
        <div className="tarjeta registro">
            <div className="registro-cabecera">
                <h2>Efectos ejecutados</h2>
                <button onClick={limpiarRegistro}>Limpiar</button>
            </div>
            <ol>{entradas.map((e) => <li key={e.id} className={e.tipo}>{e.texto}</li>)}</ol>
        </div>
    );
}

export default function App() {
    const [tick, setTick] = useState(0);            // el hijo NO lo recibe
    const [contadorUno, setContadorUno] = useState(0);
    const [clave, setClave] = useState(1);
    const [visible, setVisible] = useState(true);

    const filtrosInline = {categoria: "ropa"};    // referencia nueva en cada render
    const onCambioInline = () => {
    };
    const filtrosMemo = useMemo(() => ({categoria: "ropa"}), []);
    const onCambioCallback = useCallback(() => {
    }, []);

    const accion = (texto, fn) => () => {
        registrar(`── ${texto} ──`, "accion");
        fn();
    };

    return (
        <main>
            <h1>useEffect: re-render del padre ≠ remontaje</h1>
            <div className="tarjeta">
                <h2>Padre</h2>
                <p>tick: <strong>{tick}</strong> · contadorUno: <strong>{contadorUno}</strong></p>
                <div className="botones">
                    <button onClick={accion("Re-render del padre", () => setTick((t) => t + 1))}>Re-render del padre
                    </button>
                    <button onClick={accion("Cambia contadorUno", () => setContadorUno((c) => c + 1))}>Cambiar
                        contadorUno
                    </button>
                    <button onClick={accion("Remontar hijo (key)", () => setClave((k) => k + 1))}>Remontar hijo (key)
                    </button>
                    <button onClick={accion(visible ? "Ocultar hijo" : "Mostrar hijo", () => setVisible((v) => !v))}>
                        {visible ? "Ocultar hijo" : "Mostrar hijo"}
                    </button>
                </div>
                {visible && (
                    <Hijo key={clave} contadorUno={contadorUno}
                          filtrosInline={filtrosInline} filtrosMemo={filtrosMemo}
                          onCambioInline={onCambioInline} onCambioCallback={onCambioCallback}/>
                )}
            </div>
            <Registro/>
        </main>
    );
}