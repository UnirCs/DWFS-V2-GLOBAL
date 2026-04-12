import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);
  console.log("🏠 [Home] render");

  return (
    <div className="page">
      <h1>👋 Bienvenido a RoutExplorer</h1>
      <p className="page__intro">
        Esta aplicación demuestra cómo <strong>proteger rutas</strong> en React
        Router usando la <strong>Context API</strong> y el patrón{" "}
        <strong>PrivateRoute</strong>.
      </p>

      {!user && (
        <section className="page__section">
          <div className="home__callout">
            <h2>🔒 Algunas rutas están protegidas</h2>
            <p>
              Intenta acceder a{" "}
              <Link to="/products">Productos</Link>,{" "}
              <Link to="/users/1">Usuarios</Link> o{" "}
              <Link to="/dashboard">Dashboard</Link> sin iniciar sesión.
              Serás redirigido al login automáticamente.
            </p>
            <p>
              <Link to="/login" className="home__login-link">
                🔑 Iniciar sesión
              </Link>
            </p>
          </div>
        </section>
      )}

      {user && (
        <section className="page__section">
          <div className="home__callout home__callout--success">
            <h2>✅ Sesión activa: {user.name}</h2>
            <p>
              Ahora puedes acceder a todas las rutas protegidas:
            </p>
            <ul className="page__list">
              <li><Link to="/dashboard">👤 Tu panel de usuario</Link></li>
              <li><Link to="/products">📦 Catálogo de productos</Link></li>
              <li><Link to="/users/1">👩‍💻 Perfil de Ana García</Link></li>
              <li><Link to="/users/2">👨‍🔬 Perfil de Carlos López</Link></li>
              <li><Link to="/users/3">🎨 Perfil de Lucía Martínez</Link></li>
            </ul>
          </div>
        </section>
      )}

      <section className="page__section">
        <h2>🗺️ Mapa de rutas</h2>
        <div className="home__routes-table">
          <div className="home__route-row home__route-row--header">
            <span>Ruta</span>
            <span>Acceso</span>
          </div>
          <div className="home__route-row">
            <code>/</code>
            <span className="home__badge home__badge--public">Pública</span>
          </div>
          <div className="home__route-row">
            <code>/about</code>
            <span className="home__badge home__badge--public">Pública</span>
          </div>
          <div className="home__route-row">
            <code>/login</code>
            <span className="home__badge home__badge--public">Pública</span>
          </div>
          <div className="home__route-row">
            <code>/dashboard</code>
            <span className="home__badge home__badge--private">🔒 Protegida</span>
          </div>
          <div className="home__route-row">
            <code>/users/:userId</code>
            <span className="home__badge home__badge--private">🔒 Protegida</span>
          </div>
          <div className="home__route-row">
            <code>/products</code>
            <span className="home__badge home__badge--private">🔒 Protegida</span>
          </div>
        </div>
      </section>
    </div>
  );
}

