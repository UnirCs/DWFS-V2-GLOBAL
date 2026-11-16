import { useGlobalContext } from "../hooks/useGlobalContext.js";
import "./FavoritesSidebar.css";

// FavoritesSidebar reutiliza el mismo hook useFavorites que AnimalCard.
// Demuestra que un custom hook puede ser consumido por componentes independientes
// sin compartir estado de forma directa → el estado se "sube" (lifting state up) a App.
export default function FavoritesSidebar({ animals, favoritesHook }) {
  const { userName } = useGlobalContext(); // ← useContext también aquí
  const { favorites, removeFavorite } = favoritesHook;

  // Convertimos los IDs de favoritos en objetos completos de animal
  const favoriteAnimals = favorites
    .map((id) => animals.find((a) => a.id === id))
    .filter(Boolean);

  return (
    <aside className="fav-sidebar">
      <h2 className="fav-sidebar__title">❤️ Favoritos de {userName}</h2>

      {favoriteAnimals.length === 0 ? (
        <p className="fav-sidebar__empty">
          Aún no has marcado ningún animal.<br />
          ¡Pulsa 🤍 en una tarjeta!
        </p>
      ) : (
        <ul className="fav-sidebar__list">
          {favoriteAnimals.map((animal) => (
            <li key={animal.id} className="fav-sidebar__item">
              <span className="fav-sidebar__emoji">{animal.emoji}</span>
              <div className="fav-sidebar__info">
                <strong>{animal.name}</strong>
                <span>{animal.breed}</span>
              </div>
              <button
                className="fav-sidebar__remove"
                onClick={() => removeFavorite(animal.id)}
                title="Quitar de favoritos"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {favoriteAnimals.length > 0 && (
        <p className="fav-sidebar__footer">
          {favoriteAnimals.length} animal{favoriteAnimals.length !== 1 ? "es" : ""} guardado{favoriteAnimals.length !== 1 ? "s" : ""}
        </p>
      )}
    </aside>
  );
}
