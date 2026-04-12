export default function AboutUs() {
  console.log("ℹ️ [AboutUs] render");

  return (
    <div className="page">
      <h1>ℹ️ Sobre nosotros</h1>
      <p className="page__intro">
        Somos <strong>RoutExplorer</strong>, un equipo ficticio creado para este
        ejercicio de React Router con rutas protegidas.
      </p>

      <section className="page__section">
        <h2>¿Qué es una ruta protegida?</h2>
        <p>
          Una ruta protegida es aquella que requiere que el usuario esté
          autenticado para poder acceder. Si el usuario no tiene sesión activa,
          es redirigido automáticamente a la página de login.
        </p>
      </section>

      <section className="page__section">
        <h2>Piezas que intervienen</h2>
        <ul className="page__list">
          <li>
            <strong>AuthContext</strong> – Contexto de React que almacena el
            estado de sesión (<code>user</code>).
          </li>
          <li>
            <strong>AuthProvider</strong> – Componente provider que envuelve la
            app y gestiona el estado con <code>useState</code>.
          </li>
          <li>
            <strong>useAuth</strong> – Custom hook que encapsula{" "}
            <code>login()</code> y <code>logout()</code>.
          </li>
          <li>
            <strong>PrivateRoute</strong> – Componente guardián que comprueba la
            sesión y redirige si es necesario.
          </li>
          <li>
            <strong>Navigate</strong> – Componente de React Router que ejecuta
            redirecciones en el render.
          </li>
        </ul>
      </section>

      <section className="page__section">
        <h2>📌 Esta página es pública</h2>
        <p>
          Puedes acceder a ella sin iniciar sesión. No usa{" "}
          <code>PrivateRoute</code> ni ningún hook de autenticación.
        </p>
      </section>
    </div>
  );
}

