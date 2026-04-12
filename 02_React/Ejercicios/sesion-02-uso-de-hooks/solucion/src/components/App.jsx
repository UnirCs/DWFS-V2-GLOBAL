import { useState, useEffect, useRef } from "react";
import { AppProvider } from "../context/global/AppProvider.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { useAnimals } from "../hooks/useAnimals.js";
import Header from "./Header.jsx";
import FilterBar from "./FilterBar.jsx";
import AnimalGrid from "./AnimalGrid.jsx";
import FavoritesSidebar from "./FavoritesSidebar.jsx";
import RenderCounter from "./RenderCounter.jsx";
import "./App.css";

function AppContent() {
  const [species, setSpecies]     = useState("all");
  const { animals, loading, error } = useAnimals(species);
  const favoritesHook             = useFavorites();

  // Contador de renders para demostrar useEffect sin dependencias
  const renderCount = useRef(0);
  renderCount.current += 1;

  // ── useEffect SIN array de dependencias ──────────────────────────────────────
  // Se ejecuta después de CADA render, sin excepción.
  // Útil para efectos que deben sincronizarse con cualquier cambio de la UI.
  // Aquí actualizamos el título de la pestaña del navegador.
  useEffect(() => {
    document.title = `AdoptaMe 🐾 | Render #${renderCount.current}`;
  }); // <── sin segundo argumento: se ejecuta siempre

  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <section className="app-content">
          <FilterBar activeSpecies={species} onSpeciesChange={setSpecies} />
          {error && <p className="app-error">⚠️ {error}</p>}
          <AnimalGrid
            animals={animals}
            loading={loading}
            favoritesHook={favoritesHook}
          />
        </section>
        <FavoritesSidebar
          animals={animals}
          favoritesHook={favoritesHook}
        />
      </main>
      <RenderCounter count={renderCount.current} />
    </div>
  );
}

// App envuelve todo con el Provider para que el contexto esté disponible
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
