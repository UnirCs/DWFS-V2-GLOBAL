import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { credentials } from "../data/credentials";

export function useAuth() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const login = (username, password) => {
    const found = credentials.find(
      (c) => c.username === username && c.password === password
    );

    if (found) {
      // Excluimos la contraseña del objeto que se guarda en el contexto
      const { password: _, ...userData } = found;
      setUser(userData);
      console.log("🔑 [useAuth] login exitoso – usuario:", found.name);
      return { success: true };
    }

    console.log("🔑 [useAuth] login fallido – credenciales incorrectas");
    return { success: false, error: "Credenciales incorrectas" };
  };

  const logout = () => {
    console.log("🔑 [useAuth] logout");
    setUser(null);
    navigate("/");
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
}

