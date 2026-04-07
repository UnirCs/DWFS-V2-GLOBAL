import React, {useContext} from "react";
import { Link } from "react-router-dom";
import "./Menu.css";
import {GlobalContext} from "../../context/global/GlobalContext.jsx";
import {AuthContext} from "../../context/auth/AuthContext.jsx";

export default function Menu() {
  const { darkMode, toggleDarkMode } = useContext(GlobalContext);
  const { user } = useContext(AuthContext);

  return (
    <nav className={`menu${darkMode ? " dark" : ""}`}>
      <ul className="menu-list">
        <li className="menu-switch">
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider"></span>
          </label>
          <span className="switch-label">Modo oscuro</span>
        </li>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/products">Suministros</Link></li>
        <li><Link to="/stores">Tiendas</Link></li>
        <li><Link to="/contact">Contacto</Link></li>
        {user ? (
          <li><Link to="/profile">Mi Perfil</Link></li>
        ) : (
          <li><Link to="/login">Iniciar Sesión</Link></li>
        )}
      </ul>
    </nav>
  );
}