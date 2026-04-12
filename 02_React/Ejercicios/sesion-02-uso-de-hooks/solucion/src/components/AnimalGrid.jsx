import { useState, useEffect } from "react";
import AnimalCard from "./AnimalCard.jsx";
import "./AnimalGrid.css";

export default function AnimalGrid({ animals, loading, favoritesHook }) {
  const [resultMsg, setResultMsg] = useState("");

  // ── useEffect con [animals] ───────────────────────────────────────────────────
  // Se ejecuta cada vez que el array `animals` cambia, es decir,
  // cada vez que el usuario cambia el filtro de especie.
  // Actualiza el mensaje de "X resultados encontrados".
  useEffect(() => {
    if (loading) return;
    setResultMsg(
      animals.length === 0
        ? "No hay animales disponibles para esta especie."
        : `${animals.length} animal${animals.length !== 1 ? "es" : ""} disponible${animals.length !== 1 ? "s" : ""}`
    );
  }, [animals, loading]); // <── reacciona al cambio de animales filtrados

  if (loading) {
    return (
      <div className="animal-grid__loading">
        <span className="animal-grid__spinner">🐾</span>
        <p>Cargando animales...</p>
      </div>
    );
  }

  return (
    <div>
      <p className="animal-grid__count">{resultMsg}</p>
      <div className="animal-grid">
        {animals.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            favoritesHook={favoritesHook}
          />
        ))}
      </div>
    </div>
  );
}
