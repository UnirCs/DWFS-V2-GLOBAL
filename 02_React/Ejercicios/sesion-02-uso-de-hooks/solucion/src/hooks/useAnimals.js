import { useState, useEffect } from "react";

// Datos de animales por especie para simular una API
const MOCK_DATA = {
  all: [
    { id: "d1", name: "Rocky",   species: "dog",  emoji: "🐶", breed: "Labrador",      age: 2 },
    { id: "d2", name: "Luna",    species: "dog",  emoji: "🐕", breed: "Border Collie", age: 4 },
    { id: "d3", name: "Max",     species: "dog",  emoji: "🦮", breed: "Golden Retriever", age: 1 },
    { id: "c1", name: "Misu",    species: "cat",  emoji: "🐱", breed: "Siamés",        age: 3 },
    { id: "c2", name: "Olivia",  species: "cat",  emoji: "🐈", breed: "Maine Coon",    age: 5 },
    { id: "c3", name: "Simba",   species: "cat",  emoji: "😸", breed: "Persa",         age: 2 },
    { id: "r1", name: "Pelusa",  species: "rabbit", emoji: "🐰", breed: "Angora",      age: 1 },
    { id: "r2", name: "Thumper", species: "rabbit", emoji: "🐇", breed: "Holandés",    age: 3 },
  ],
};

/**
 * useAnimals – Custom Hook
 *
 * ✅ useEffect con [] → simula la carga inicial de datos (solo al montar)
 * ✅ useEffect con [species] → filtra los animales cuando cambia la especie
 *
 * @param {string} species - Especie seleccionada ("all" | "dog" | "cat" | "rabbit")
 * @returns {{ animals: Array, loading: boolean, error: string|null, total: number }}
 */
export function useAnimals(species) {
  const [allAnimals, setAllAnimals] = useState([]);
  const [animals, setAnimals]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // ── useEffect con [] ─────────────────────────────────────────────────────────
  // Se ejecuta UNA SOLA VEZ al montar el componente.
  // Simula un fetch inicial (como si viniese de una API real).
  // En una app real aquí iría: fetch("https://api.example.com/animals")
  useEffect(() => {
    setLoading(true);
    // Simulamos la latencia de red con setTimeout
    const timer = setTimeout(() => {
      try {
        setAllAnimals(MOCK_DATA.all);
        setAnimals(MOCK_DATA.all);
        setLoading(false);
      } catch (err) {
        setError("No se pudieron cargar los animales.");
        setLoading(false);
      }
    }, 900);

    // Función de limpieza: cancela el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, []); // <── array vacío: solo al montar

  // ── useEffect con [species, allAnimals] ──────────────────────────────────────
  // Se ejecuta cada vez que cambia la especie seleccionada O los datos base.
  // Filtra el array completo y actualiza `animals`.
  useEffect(() => {
    if (allAnimals.length === 0) return;
    if (species === "all") {
      setAnimals(allAnimals);
    } else {
      setAnimals(allAnimals.filter((a) => a.species === species));
    }
  }, [species, allAnimals]); // <── reacciona al cambio de especie

  return { animals, loading, error, total: allAnimals.length };
}
