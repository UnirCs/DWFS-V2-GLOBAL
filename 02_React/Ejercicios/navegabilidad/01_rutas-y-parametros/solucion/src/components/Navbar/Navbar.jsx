import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/", label: "🏠 Inicio" },
  { to: "/about", label: "ℹ️ Sobre nosotros" },
  { to: "/users/1", label: "👤 Usuario 1" },
  { to: "/users/2", label: "👤 Usuario 2" },
  { to: "/users/3", label: "👤 Usuario 3" },
  { to: "/products", label: "📦 Productos" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  console.log("🧭 [Navbar] render – ruta actual:", pathname);

  return (
    <nav className="navbar">
      <div className="navbar__logo">🧭 RoutExplorer</div>
      <ul className="navbar__links">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`navbar__link ${pathname === link.to ? "navbar__link--active" : ""}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

