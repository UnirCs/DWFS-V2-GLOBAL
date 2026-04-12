import { useState } from "react";

/**
 * useFavorites – Custom Hook
 *
 * Encapsula toda la lógica de "marcar/desmarcar favoritos".
 * Se puede importar en cualquier componente sin duplicar código.
 *
 * @returns {{ favorites: string[], addFavorite: Function, removeFavorite: Function, isFavorite: Function }}
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  function addFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeFavorite(id) {
    setFavorites((prev) => prev.filter((fav) => fav !== id));
  }

  function isFavorite(id) {
    return favorites.includes(id);
  }

  function toggleFavorite(id) {
    isFavorite(id) ? removeFavorite(id) : addFavorite(id);
  }

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}
