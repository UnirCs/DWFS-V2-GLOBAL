import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  console.log("📊 [Dashboard] render – user:", user?.name);

  return (
    <div className="page">
      <div className="dashboard__header">
        <h1>👤 Panel de usuario</h1>
        <button className="dashboard__logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <p className="page__intro">
        Esta es una ruta protegida. Solo es visible si has iniciado sesión.
      </p>

      <section className="page__section">
        <h2>Datos de tu sesión</h2>
        <div className="dashboard__card">
          <div className="dashboard__field">
            <span className="dashboard__label">Nombre</span>
            <span className="dashboard__value">{user.name}</span>
          </div>
          <div className="dashboard__field">
            <span className="dashboard__label">Email</span>
            <span className="dashboard__value">{user.email}</span>
          </div>
          <div className="dashboard__field">
            <span className="dashboard__label">Rol</span>
            <span className={`dashboard__role dashboard__role--${user.role}`}>
              {user.role}
            </span>
          </div>
          <div className="dashboard__field">
            <span className="dashboard__label">Username</span>
            <span className="dashboard__value">
              <code>{user.username}</code>
            </span>
          </div>
        </div>
      </section>

      <section className="page__section">
        <h2>🔗 Rutas protegidas disponibles</h2>
        <ul className="page__list">
          <li>
            <Link to="/products">📦 Catálogo de productos</Link> – Usa{" "}
            <code>useSearchParams</code>
          </li>
          <li>
            <Link to="/users/1">👩‍💻 Ana García</Link> – Usa{" "}
            <code>useParams</code>
          </li>
          <li>
            <Link to="/users/2">👨‍🔬 Carlos López</Link>
          </li>
          <li>
            <Link to="/users/3">🎨 Lucía Martínez</Link>
          </li>
        </ul>
      </section>

      <section className="page__section">
        <h2>🔧 ¿Cómo funciona esta vista?</h2>
        <p>
          La ruta <code>/dashboard</code> está envuelta por{" "}
          <code>&lt;PrivateRoute&gt;</code>. Antes de renderizar este componente,
          PrivateRoute comprueba si hay un <code>user</code> en el{" "}
          <code>AuthContext</code>. Si no lo hay, redirige a <code>/login</code>.
        </p>
        <p>
          Los datos que ves arriba vienen del objeto <code>user</code> almacenado
          en el contexto tras el login.
        </p>
      </section>
    </div>
  );
}

