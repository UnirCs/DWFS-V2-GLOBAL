import React, { useState, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import "./Login.css";
import { AuthContext } from "../../context/auth/AuthContext";
import { useLogin } from "../../hooks/useLogin";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { login, isLoading, error, clearError } = useLogin();

  // Si ya está logueado, redirigir
  if (user) {
    const from = location.state?.from || "/profile";
    return <Navigate to={from} replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores cuando el usuario escriba
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (error) {
      clearError();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validación de campos vacíos
    const newFieldErrors = {};
    if (!formData.username.trim()) {
      newFieldErrors.username = "El usuario es obligatorio";
    }
    if (!formData.password.trim()) {
      newFieldErrors.password = "La contraseña es obligatoria";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    // Usar el hook para hacer login
    const result = await login(formData.username, formData.password);

    if (result.success) {
      // El AuthContext se encarga de la redirección automática
      setFormData({ username: "", password: "" });
      setFieldErrors({});
    }
  }

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta empresarial de UNIR Supplies</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-banner">{error}</div>
          )}

          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={fieldErrors.username ? "error" : ""}
              placeholder="Nombre de usuario"
              disabled={isLoading}
            />
            {fieldErrors.username && <span className="error-message">{fieldErrors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={fieldErrors.password ? "error" : ""}
              placeholder="Contraseña"
              disabled={isLoading}
            />
            {fieldErrors.password && <span className="error-message">{fieldErrors.password}</span>}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Credenciales de prueba:</h3>
          <div className="demo-list">
            <div className="demo-item">
              <strong>TechStore:</strong> techstore / 123456
            </div>
            <div className="demo-item">
              <strong>Digital Office:</strong> digitaloffice / password123
            </div>
            <div className="demo-item">
              <strong>InnovaCorp:</strong> innovacorp / admin2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
