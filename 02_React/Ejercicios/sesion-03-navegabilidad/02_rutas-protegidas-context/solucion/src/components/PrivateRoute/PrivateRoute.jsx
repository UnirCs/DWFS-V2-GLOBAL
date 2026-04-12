import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  console.log(
    "🛡️ [PrivateRoute] check –",
    user ? "✅ autenticado" : "❌ sin sesión",
    "– ruta:",
    location.pathname
  );

  if (!user) {
    // Redirigir a /login guardando la ruta de origen en state
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si hay sesión, renderizar el componente hijo
  return children;
}

