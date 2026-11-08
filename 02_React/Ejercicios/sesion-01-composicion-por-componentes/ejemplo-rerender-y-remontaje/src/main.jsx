import {createRoot} from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Sin <StrictMode> a propósito: en desarrollo duplicaría los efectos de montaje.
createRoot(document.getElementById("root")).render(<App/>);