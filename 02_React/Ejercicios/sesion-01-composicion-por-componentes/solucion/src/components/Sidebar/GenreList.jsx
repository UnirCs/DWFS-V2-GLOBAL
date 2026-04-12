import "./Sidebar.css";

export default function GenreList({ genres }) {
  return (
    <ul className="genre-list">
      {genres.map((genre) => (
        <li key={genre} className="genre-list__item">
          <span className="genre-list__dot" />
          {genre}
        </li>
      ))}
    </ul>
  );
}
