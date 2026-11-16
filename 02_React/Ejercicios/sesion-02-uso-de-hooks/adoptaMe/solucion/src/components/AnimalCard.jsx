import { useGlobalContext } from "../hooks/useGlobalContext.js";
import "./AnimalCard.css";

// AnimalCard está a 2 niveles del Provider (App → AnimalGrid → AnimalCard)
// Consume el contexto directamente, sin necesitar props intermedias
export default function AnimalCard({ animal, favoritesHook }) {
  const { userName } = useGlobalContext(); // ← useContext en acción
  const { isFavorite, toggleFavorite } = favoritesHook;
  const fav = isFavorite(animal.id);

  return (
    <article className={`animal-card ${fav ? "animal-card--fav" : ""}`}>
      <div className="animal-card__emoji">{animal.emoji}</div>
      <div className="animal-card__body">
        <h3 className="animal-card__name">{animal.name}</h3>
        <p className="animal-card__breed">{animal.breed}</p>
        <p className="animal-card__age">{animal.age} año{animal.age !== 1 ? "s" : ""}</p>
      </div>
      <button
        className={`animal-card__fav-btn ${fav ? "animal-card__fav-btn--active" : ""}`}
        onClick={() => toggleFavorite(animal.id)}
        title={fav ? `${userName} ya lo tiene en favoritos` : `${userName}, añadir a favoritos`}
      >
        {fav ? "❤️ En favoritos" : "🤍 Añadir"}
      </button>
    </article>
  );
}
