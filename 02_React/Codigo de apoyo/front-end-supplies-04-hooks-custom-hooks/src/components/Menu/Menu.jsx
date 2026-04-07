import React, {useContext} from "react";
import "./Menu.css";
import {GlobalContext} from "../../context/global/GlobalContext.jsx";

export default function Menu() {
  const { darkMode, toggleDarkMode } = useContext(GlobalContext);

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
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Suministros</a></li>
        <li><a href="#">Tiendas</a></li>
        <li><a href="#">Contacto</a></li>
      </ul>
    </nav>
  );
}