import { useContext } from "react";
import { SesionContext } from "../context/sesion/SesionContext.js";

/**
 * Atajo para consumir el contexto de sesión.
 *
 * Envolver `useContext` en un custom hook tiene dos ventajas:
 *  1. Los componentes no necesitan importar el objeto de contexto.
 *  2. Podemos validar que estamos dentro del Provider y fallar con un mensaje útil
 *     en lugar de con un confuso "Cannot destructure property of null".
 */
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) {
    throw new Error("useSesion() debe usarse dentro de <SesionProvider>");
  }
  return contexto;
}
