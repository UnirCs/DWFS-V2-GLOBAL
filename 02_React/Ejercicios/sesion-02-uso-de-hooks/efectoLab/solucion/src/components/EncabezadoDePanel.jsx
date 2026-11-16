/**
 * Cabecera común a los tres paneles: muestra la identidad de la INSTANCIA
 * actual y cuántas veces se ha renderizado.
 *
 * Mirar estos dos números es la forma más rápida de distinguir un re-render de
 * un re-montaje:
 *   · el nº de render sube y la instancia NO cambia  → re-render
 *   · la instancia cambia y el nº de render vuelve a 1 → re-montaje
 */
export default function EncabezadoDePanel({ titulo, instancia, renders, descripcion }) {
  return (
    <header className="panel__encabezado">
      <div>
        <h2 className="panel__titulo">{titulo}</h2>
        {descripcion && <p className="panel__descripcion">{descripcion}</p>}
      </div>
      <div className="panel__sellos">
        <span className="panel__sello" title="Cambia en cada montaje">
          instancia <strong>{instancia}</strong>
        </span>
        <span className="panel__sello" title="Contado con useRef">
          render nº <strong>{renders}</strong>
        </span>
      </div>
    </header>
  );
}
