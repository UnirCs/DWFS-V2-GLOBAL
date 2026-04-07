import React, {useContext} from "react";
import "./Footer.css";
import {GlobalContext} from "../../context/global/GlobalContext.jsx";

export default function Footer() {
  const { darkMode } = useContext(GlobalContext);
  return (
    <footer className={`footer${darkMode ? " dark" : ""}`}>
      <p>© 2025 UNIR Supplies. Todos los derechos reservados.</p>
    </footer>
  );
}
