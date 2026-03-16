import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import PageLayout from "./components/PageLayout/PageLayout";
import MovieGrid from "./components/MovieGrid/MovieGrid";
import Footer from "./components/Footer/Footer";
import { movies, genres } from "./data/movies";

const navLinks = [
  { label: "Inicio", href: "#" },
  { label: "Estrenos", href: "#" },
  { label: "Géneros", href: "#" },
  { label: "Contacto", href: "#" },
];

const featuredMovie = movies[0]; // Dune: Parte III

export default function App() {
  return (
    <div className="app">
      <Navbar links={navLinks} />
      <PageLayout genres={genres} featuredMovie={featuredMovie}>
        <MovieGrid movies={movies} />
      </PageLayout>
      <Footer year={2026} />
    </div>
  );
}
