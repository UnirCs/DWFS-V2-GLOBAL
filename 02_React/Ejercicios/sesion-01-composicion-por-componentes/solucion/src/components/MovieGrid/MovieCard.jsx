import "./MovieCard.css";

export default function MovieCard({ movie }) {
  const { title, genre, rating, year, description, image, color } = movie;

  return (
    <article className="movie-card">
      <div className="movie-card__poster" style={{ backgroundColor: color }}>
        <span className="movie-card__emoji">{image}</span>
        <span className="movie-card__year">{year}</span>
      </div>
      <div className="movie-card__body">
        <h3 className="movie-card__title">{title}</h3>
        <p className="movie-card__description">{description}</p>
        <div className="movie-card__footer">
          <span className="movie-card__genre">{genre}</span>
          <span className="movie-card__rating">⭐ {rating.toFixed(1)}</span>
        </div>
        <button className="movie-card__btn">Ver más</button>
      </div>
    </article>
  );
}
