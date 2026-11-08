import {useEffect, useRef, useState} from "react";
import {registrar} from "./registro.js";

export default function Hijo({contadorUno, filtrosInline, filtrosMemo, onCambioInline, onCambioCallback}) {
    const [contadorDos, setContadorDos] = useState(0);
    const [idInstancia] = useState(() => Math.random().toString(36).slice(2, 7));
    const renders = useRef(0);
    renders.current += 1;
    const n = renders.current;

    useEffect(() => {
        registrar(`[instancia ${idInstancia}] MONTAJE · useEffect(..., [])`, "montaje");
        return () => registrar(`[instancia ${idInstancia}] DESMONTAJE (limpieza)`, "desmontaje");
    }, []);

    useEffect(() => {
        registrar(`Render ${n} · sin dependencias`);
    });
    useEffect(() => {
        registrar(`Render ${n} · [contadorUno] = ${contadorUno}`);
    }, [contadorUno]);
    useEffect(() => {
        registrar(`Render ${n} · [contadorUno, contadorDos]`);
    }, [contadorUno, contadorDos]);
    useEffect(() => {
        registrar(`Render ${n} · [filtrosInline] (objeto nuevo)`, "aviso");
    }, [filtrosInline]);
    useEffect(() => {
        registrar(`Render ${n} · [filtrosMemo] (useMemo)`);
    }, [filtrosMemo]);
    useEffect(() => {
        registrar(`Render ${n} · [onCambioInline] (función nueva)`, "aviso");
    }, [onCambioInline]);
    useEffect(() => {
        registrar(`Render ${n} · [onCambioCallback] (useCallback)`);
    }, [onCambioCallback]);

    return (
        <div className="tarjeta hijo">
            <h2>Hijo</h2>
            <p>Instancia: <code>{idInstancia}</code> · Render nº <strong>{n}</strong></p>
            <p>contadorUno (prop): <strong>{contadorUno}</strong> · contadorDos (estado
                propio): <strong>{contadorDos}</strong></p>
            <button onClick={() => setContadorDos((c) => c + 1)}>Cambiar contadorDos</button>
        </div>
    );
}