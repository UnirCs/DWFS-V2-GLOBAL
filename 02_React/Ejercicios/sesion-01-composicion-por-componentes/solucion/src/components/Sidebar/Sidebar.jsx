import "./Sidebar.css";
import GenreList from "./GenreList.jsx";

export default function Sidebar({ genres, featuredMovie }) {
  return (
    <aside className="sidebar">
      <section className="sidebar__section">
        <h3 className="sidebar__title">Filtrar por género</h3>
        <GenreList genres={genres} />
      </section>

      <section className="sidebar__section sidebar__featured">
        <h3 className="sidebar__title">⭐ Destacado del mes</h3>
        <div
          className="sidebar__featured-card"
          style={{ borderColor: featuredMovie.color }}
        >
          <span className="sidebar__featured-emoji">{featuredMovie.image}</span>
          <p className="sidebar__featured-name">{featuredMovie.title}</p>
          <p className="sidebar__featured-genre">{featuredMovie.genre}</p>
          <p className="sidebar__featured-rating">
            ⭐ {featuredMovie.rating.toFixed(1)}
          </p>
        </div>
      </section>
    </aside>
  );
}
