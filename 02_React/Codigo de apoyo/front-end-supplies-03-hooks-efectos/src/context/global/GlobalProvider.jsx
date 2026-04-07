import React, { useState } from "react";
import { GlobalContext } from "./GlobalContext";

export function GlobalProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((v) => !v);

  return (
    <GlobalContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </GlobalContext.Provider>
  );
}

