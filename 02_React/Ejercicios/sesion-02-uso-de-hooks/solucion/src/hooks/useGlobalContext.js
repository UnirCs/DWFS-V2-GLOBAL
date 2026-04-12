import { useContext } from "react";
import { AppContext } from "../context/global/AppContext";

// Hook de conveniencia para consumir el contexto global
export function useGlobalContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useGlobalContext debe usarse dentro de <AppProvider>");
  return ctx;
}

