import { Link } from "react-router-dom";

export default function Home() {
  console.log("🏠 [Home] render");

  return (
    <div className="page">
      <h1>👋 Bienvenido a RoutExplorer</h1>
      <p className="page__intro">
        Esta aplicación demuestra los fundamentos de <strong>React Router</strong>:
        rutas, layouts con <code>Outlet</code>, path params y query params.
      </p>

      <section className="page__section">
        <h2>🗺️ Explora las vistas</h2>
        <ul className="page__list">
          <li>
            <Link to="/about">Sobre nosotros</Link> – Página estática, sin hooks de router.
          </li>
          <li>
            <Link to="/users/1">Perfil de Ana García</Link> – Usa <code>useParams</code> para leer <code>:userId</code>.
          </li>
          <li>
            <Link to="/users/2">Perfil de Carlos López</Link> – Otro usuario, mismo componente.
          </li>
          <li>
            <Link to="/users/3">Perfil de Lucía Martínez</Link> – Un tercer usuario.
          </li>
          <li>
            <Link to="/users/999">Usuario inexistente</Link> – Prueba el caso de error.
          </li>
          <li>
            <Link to="/products">Todos los productos</Link> – Usa <code>useSearchParams</code>.
          </li>
          <li>
            <Link to="/products?category=Electrónica">Solo Electrónica</Link> – Query param predefinido.
          </li>
        </ul>
      </section>

      <section className="page__section">
        <h2>🔍 ¿Qué observar?</h2>
        <p>
          Abre la <strong>consola del navegador</strong> (F12) y fíjate en los{" "}
          <code>console.log</code> de cada componente. Verás cuáles se renderizan al
          navegar y cómo el Layout se mantiene estable.
        </p>
      </section>
    </div>
  );
}

