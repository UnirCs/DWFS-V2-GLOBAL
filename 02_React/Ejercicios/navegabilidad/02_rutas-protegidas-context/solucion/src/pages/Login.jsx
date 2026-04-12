import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ruta de destino: de donde venía el usuario, o /dashboard por defecto
  const from = location.state?.from || "/dashboard";

  console.log("🔑 [Login] render – from:", from, "– user:", user ? user.name : "null");

  // Si ya está logueado, redirigir automáticamente
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son obligatorios");
      return;
    }

    const result = login(username, password);

    if (result.success) {
      // Tras login exitoso, navegar a la ruta original
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="page">
      <div className="login">
        <div className="login__header">
          <h1>🔑 Iniciar sesión</h1>
          <p className="page__intro">
            Accede a las rutas protegidas de RoutExplorer
          </p>
          {from !== "/dashboard" && (
            <p className="login__redirect-notice">
              Necesitas iniciar sesión para acceder a <code>{from}</code>
            </p>
          )}
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {error && <div className="login__error">{error}</div>}

          <div className="login__field">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              autoComplete="username"
            />
          </div>

          <div className="login__field">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login__button">
            Iniciar sesión
          </button>
        </form>

        <div className="login__credentials">
          <h3>🧪 Credenciales de prueba</h3>
          <div className="login__credential-item">
            <strong>Admin:</strong> <code>admin</code> / <code>admin123</code>
          </div>
          <div className="login__credential-item">
            <strong>Usuario:</strong> <code>user</code> / <code>user123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

