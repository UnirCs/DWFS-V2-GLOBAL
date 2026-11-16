import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// StrictMode se queda ACTIVADO a propósito: en desarrollo monta, desmonta y
// vuelve a montar cada componente para delatar los efectos sin función de
// limpieza. Por eso verás entradas duplicadas en la bitácora (MONTAJE →
// DESMONTAJE → MONTAJE). En producción esto no ocurre.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
