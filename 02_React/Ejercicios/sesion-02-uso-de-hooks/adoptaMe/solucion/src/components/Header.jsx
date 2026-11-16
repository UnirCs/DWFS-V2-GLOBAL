import { useGlobalContext } from "../hooks/useGlobalContext.js";
import "./Header.css";

// Header consume el contexto directamente → NO necesita recibir props
// Demuestra cómo useContext evita el prop drilling
export default function Header() {
  const { userName, theme, toggleTheme } = useGlobalContext();

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo">🐾</span>
        <div>
          <h1 className="header__title">AdoptaMe</h1>
          <p className="header__subtitle">Encuentra tu compañero ideal</p>
        </div>
      </div>
      <div className="header__actions">
        <span className="header__user">👤 {userName}</span>
        <button className="header__theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
        </button>
      </div>
    </header>
  );
}
