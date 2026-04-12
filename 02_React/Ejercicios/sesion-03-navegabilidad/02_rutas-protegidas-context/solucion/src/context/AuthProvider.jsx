import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  // null = sin sesión, objeto = usuario logueado
  const [user, setUser] = useState(null);

  console.log("🔐 [AuthProvider] render – user:", user ? user.name : "null");

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

