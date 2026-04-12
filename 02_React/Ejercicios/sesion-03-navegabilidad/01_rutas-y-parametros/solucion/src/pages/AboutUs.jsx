export default function AboutUs() {
  console.log("ℹ️ [AboutUs] render");

  return (
    <div className="page">
      <h1>ℹ️ Sobre nosotros</h1>
      <p className="page__intro">
        Somos <strong>RoutExplorer</strong>, un equipo ficticio creado para este
        ejercicio de React Router.
      </p>

      <section className="page__section">
        <h2>Nuestra misión</h2>
        <p>
          Ayudar a desarrolladores a entender cómo funciona la navegación del lado
          del cliente en aplicaciones React. Sin recargas de página, sin esperas
          innecesarias.
        </p>
      </section>

      <section className="page__section">
        <h2>¿Por qué esta página es especial?</h2>
        <p>
          Este componente <strong>no usa ningún hook de React Router</strong>. No
          necesita leer parámetros de la URL ni query strings. Es una vista estática
          pura, lo que demuestra que no todas las rutas necesitan lógica de routing
          compleja.
        </p>
        <p>
          Aun así, se beneficia del <code>Layout</code> común: el Navbar y el Footer
          aparecen automáticamente gracias al <code>&lt;Outlet /&gt;</code> definido
          en el componente padre.
        </p>
      </section>

      <section className="page__section">
        <h2>Datos curiosos</h2>
        <ul className="page__list">
          <li>React Router usa la <strong>History API</strong> del navegador internamente.</li>
          <li>
            El componente <code>Link</code> evita la recarga llamando a{" "}
            <code>event.preventDefault()</code>.
          </li>
          <li>
            <code>BrowserRouter</code> crea un contexto de React; sin él, los hooks
            de routing fallarían.
          </li>
        </ul>
      </section>
    </div>
  );
}

