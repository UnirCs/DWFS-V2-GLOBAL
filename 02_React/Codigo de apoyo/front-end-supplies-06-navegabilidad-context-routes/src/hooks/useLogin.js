import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import { mockCompanies } from "../utils/mockCompanies";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = async (username, password) => {
    setIsLoading(true);
    setError("");

    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son obligatorios");
      setIsLoading(false);
      return { success: false };
    }

    try {
      // Simular petición HTTP
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Buscar usuario en datos mock
      const company = mockCompanies.find(
        c => c.username === username && c.password === password
      );

      if (company) {
        // Login exitoso
        setUser(company);
        console.log("Login exitoso para:", company.company.name);
        setIsLoading(false);
        return { success: true };
      } else {
        setError("Credenciales incorrectas");
        setIsLoading(false);
        return { success: false };
      }
    } catch (err) {
      setError("Error en el servidor. Inténtalo de nuevo.");
      setIsLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    setTimeout(() => {
      setUser(null);
      navigate("/");
    }, 1000)
  };

  return {
    login,
    logout,
    isLoading,
    error,
    clearError: () => setError("")
  };
}
