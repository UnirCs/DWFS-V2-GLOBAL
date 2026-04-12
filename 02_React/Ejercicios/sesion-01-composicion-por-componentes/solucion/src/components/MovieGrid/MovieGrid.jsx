import "./MovieGrid.css";
import MovieCard from "./MovieCard.jsx";

export default function MovieGrid({ movies }) {
  return (
    <section className="movie-grid">
      <h2 className="movie-grid__heading">🎬 Estrenos de la semana</h2>
      <div className="movie-grid__list">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
