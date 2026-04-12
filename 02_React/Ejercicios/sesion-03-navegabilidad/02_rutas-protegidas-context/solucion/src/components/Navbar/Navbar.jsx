import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();

  console.log("🧭 [Navbar] render – user:", user ? user.name : "null");

  return (
    <nav className="navbar">
      <div className="navbar__logo">🧭 RoutExplorer</div>
      <ul className="navbar__links">
        {/* Enlaces siempre visibles */}
        <li>
          <Link
            to="/"
            className={`navbar__link ${pathname === "/" ? "navbar__link--active" : ""}`}
          >
            🏠 Inicio
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            className={`navbar__link ${pathname === "/about" ? "navbar__link--active" : ""}`}
          >
            ℹ️ About
          </Link>
        </li>

        {user ? (
          <>
            {/* Enlaces visibles solo con sesión activa */}
            <li>
              <Link
                to="/products"
                className={`navbar__link ${pathname === "/products" ? "navbar__link--active" : ""}`}
              >
                📦 Productos
              </Link>
            </li>
            <li>
              <Link
                to="/users/1"
                className={`navbar__link ${pathname.startsWith("/users") ? "navbar__link--active" : ""}`}
              >
                👥 Usuarios
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className={`navbar__link navbar__link--highlight ${pathname === "/dashboard" ? "navbar__link--active" : ""}`}
              >
                👤 {user.name}
              </Link>
            </li>
          </>
        ) : (
          <li>
            <Link
              to="/login"
              className={`navbar__link navbar__link--highlight ${pathname === "/login" ? "navbar__link--active" : ""}`}
            >
              🔒 Iniciar sesión
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

