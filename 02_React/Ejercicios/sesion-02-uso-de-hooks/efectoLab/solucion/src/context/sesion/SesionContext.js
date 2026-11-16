import { createContext } from "react";

// Solo la "caja" vacía. El valor real lo inyecta <SesionProvider>.
// Valor por defecto `null` a propósito: así `useSesion()` puede detectar que un
// componente se está usando fuera del Provider y avisar con un error claro.
export const SesionContext = createContext(null);
