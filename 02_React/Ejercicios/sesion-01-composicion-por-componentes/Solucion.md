# 🎬 CineReact – Solución paso a paso

## Racional previo: ¿cómo pensar en componentes?

Antes de escribir una sola línea de código, el primer paso es **analizar el diseño como un árbol de componentes**. La regla de oro es: si un bloque visual tiene una responsabilidad clara y se podría reutilizar (o al menos aislar), es un buen candidato a ser componente.

Mirando el wireframe:

```
App
 ├── Navbar            → barra superior fija
 ├── PageLayout        → divide la pantalla en dos columnas
 │    ├── Sidebar      → columna izquierda
 │    │    ├── GenreList   → lista de géneros (usa .map)
 │    │    └── (card destacada, dentro de Sidebar)
 │    └── <main>       → columna derecha (contenido principal vía children)
 │         └── MovieGrid  → cuadrícula de películas
 │              └── MovieCard × N  → cada tarjeta (usa .map)
 └── Footer            → barra inferior fija
```

Este árbol responde a las preguntas:
- **¿Qué renderiza cada bloque?** → define su responsabilidad
- **¿Qué datos necesita?** → define qué props recibe
- **¿Quién tiene los datos?** → normalmente el componente más alto (App)

---

## Paso 1 – Crear el proyecto

```bash
npm create vite@latest cinereact -- --template react
cd cinereact
npm install
```

Con esto tenemos la estructura base de Vite con React.

---

## Paso 2 – Crear los datos (`src/data/movies.js`)

Los datos son **estáticos** (no hay backend), así que los definimos como constantes exportadas. El componente `App` los importará y los pasará hacia abajo.

```js
// src/data/movies.js
export const genres = ["Acción", "Comedia", "Drama", "Terror", "Sci-Fi"];

export const movies = [
  {
    id: 1,
    title: "Dune: Parte III",
    genre: "Sci-Fi",
    rating: 9.0,
    year: 2026,
    description: "Paul Atreides lidera una nueva rebelión en las arenas de Arrakis para preservar el futuro de la humanidad.",
    image: "🏜️",
    color: "#c9a84c",
  },
  {
    id: 2,
    title: "El último héroe",
    genre: "Acción",
    rating: 8.4,
    year: 2025,
    description: "Un ex agente secreto debe salir de su retiro para desmantelar la mayor red criminal del mundo.",
    image: "🦸",
    color: "#e63946",
  },
  {
    id: 3,
    title: "La gran comedia",
    genre: "Comedia",
    rating: 7.1,
    year: 2026,
    description: "Tres amigos organizan la boda del siglo y cada detalle se convierte en un desastre épico.",
    image: "😂",
    color: "#f4a261",
  },
  {
    id: 4,
    title: "Sombras del pasado",
    genre: "Drama",
    rating: 8.8,
    year: 2025,
    description: "Una familia deberá enfrentarse a secretos enterrados durante décadas cuando el patriarca desaparece.",
    image: "🎭",
    color: "#6a0572",
  },
  {
    id: 5,
    title: "Casa encantada",
    genre: "Terror",
    rating: 7.5,
    year: 2026,
    description: "Una joven pareja se muda a una vieja mansión sin saber que sus muros guardan algo oscuro y muy hambriento.",
    image: "👻",
    color: "#2d6a4f",
  },
];
```

> **¿Por qué aquí y no en App.jsx?** Separar los datos del código de presentación es una buena práctica. Si mañana los datos vienen de una API, solo cambias este archivo.

---

## Paso 3 – CSS global (`src/index.css`)

Definimos variables CSS y un reset básico. Usar variables de CSS (`--color-bg`, etc.) permite que todos los componentes usen los mismos colores sin repetición.

```css
/* src/index.css */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg: #0f0f13;
  --color-surface: #1a1a24;
  --color-surface-alt: #23232f;
  --color-border: #2e2e3e;
  --color-primary: #e63946;
  --color-primary-dark: #c1121f;
  --color-text: #eaeaea;
  --color-text-muted: #8888a0;
  --color-accent: #f4a261;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}
```

---

## Paso 4 – Componentes hoja (sin hijos)

Empezamos por los componentes más simples: los que no contienen a otros componentes, solo reciben datos por props y los muestran.

### `Navbar`

Recibe un array de objetos `{ label, href }` y los itera con `.map()` para generar los links.

```jsx
// src/components/Navbar/Navbar.jsx
import "./Navbar.css";

export default function Navbar({ links }) {
  return (
    <nav className="navbar">
      <div className="navbar__logo">🎬 <span>CineReact</span></div>
      <ul className="navbar__links">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="navbar__link">{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

> **Props recibidas:** `links` → array de `{ label: string, href: string }`

### `Footer`

Recibe el año como prop para no hardcodear el dato.

```jsx
// src/components/Footer/Footer.jsx
import "./Footer.css";

export default function Footer({ year }) {
  return (
    <footer className="footer">
      <p>© {year} <strong>CineReact</strong> · Todos los derechos reservados</p>
      <p className="footer__sub">Hecho con ❤️ y React</p>
    </footer>
  );
}
```

> **Props recibidas:** `year` → número

### `MovieCard`

Recibe un objeto película completo. Usamos **desestructuración** para acceder a sus propiedades de forma limpia.

```jsx
// src/components/MovieGrid/MovieCard.jsx
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
```

> **Props recibidas:** `movie` → objeto película completo
> **Truco:** `rating.toFixed(1)` formatea el número con exactamente un decimal.

### `GenreList`

Este componente itera sobre el array de géneros con `.map()`. Cada elemento necesita una `key` única: el propio nombre del género nos sirve.

```jsx
// src/components/Sidebar/GenreList.jsx
import "./Sidebar.css"; // comparte el CSS de Sidebar

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
```

> **Props recibidas:** `genres` → array de strings
> **Importante:** siempre usar `key` en los elementos de un `.map()`. React la usa para optimizar el re-renderizado.

---

## Paso 5 – Componentes contenedor

### `MovieGrid`

Contiene el título de sección y renderiza una `<MovieCard>` por cada película del array. El `id` de cada película es la `key` perfecta.

```jsx
// src/components/MovieGrid/MovieGrid.jsx
import "./MovieGrid.css";
import MovieCard from "./MovieCard";

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
```

> **Props recibidas:** `movies` → array de objetos película
> **CSS clave:** `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` crea una cuadrícula responsiva automáticamente.

### `Sidebar`

Compone `GenreList` con una card de película destacada. Recibe los géneros y la película destacada por props.

```jsx
// src/components/Sidebar/Sidebar.jsx
import "./Sidebar.css";
import GenreList from "./GenreList";

export default function Sidebar({ genres, featuredMovie }) {
  return (
    <aside className="sidebar">
      <section className="sidebar__section">
        <h3 className="sidebar__title">Filtrar por género</h3>
        <GenreList genres={genres} />
      </section>
      <section className="sidebar__section sidebar__featured">
        <h3 className="sidebar__title">⭐ Destacado del mes</h3>
        <div className="sidebar__featured-card" style={{ borderColor: featuredMovie.color }}>
          <span className="sidebar__featured-emoji">{featuredMovie.image}</span>
          <p className="sidebar__featured-name">{featuredMovie.title}</p>
          <p className="sidebar__featured-genre">{featuredMovie.genre}</p>
          <p className="sidebar__featured-rating">⭐ {featuredMovie.rating.toFixed(1)}</p>
        </div>
      </section>
    </aside>
  );
}
```

> **Props recibidas:** `genres` → array de strings; `featuredMovie` → objeto película

### `PageLayout`

Este componente implementa el patrón **children**: divide la pantalla en dos columnas y deja que el componente padre decida qué va en el área de contenido principal.

```jsx
// src/components/PageLayout/PageLayout.jsx
import "./PageLayout.css";
import Sidebar from "../Sidebar/Sidebar";

export default function PageLayout({ genres, featuredMovie, children }) {
  return (
    <div className="page-layout">
      <Sidebar genres={genres} featuredMovie={featuredMovie} />
      <main className="page-layout__main">{children}</main>
    </div>
  );
}
```

> **Props recibidas:** `genres`, `featuredMovie` (para pasarlos a Sidebar) y `children` (lo que App coloque entre las etiquetas de apertura y cierre de `<PageLayout>`).
> **¿Por qué children?** Hace al layout más flexible. Mañana podrías poner un componente diferente al `<MovieGrid>` sin tocar `PageLayout`.

---

## Paso 6 – Componente raíz `App`

`App` es el **único componente que "sabe" los datos**. Los importa y los distribuye hacia abajo a través de props. Ningún componente hijo necesita conocer la fuente de datos.

```jsx
// src/App.jsx
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
```

> **Clave:** observa cómo `<MovieGrid>` está **dentro** de `<PageLayout>`. Eso es lo que `PageLayout` recibe como `children`.

---

## Paso 7 – CSS de cada componente

Cada componente tiene su propio archivo CSS. Ejemplos de las clases más relevantes:

**`Navbar.css`** → `position: sticky; top: 0` para que quede fija al hacer scroll.

**`MovieGrid.css`** → `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` para cuadrícula responsiva.

**`MovieCard.css`** → `transition: transform 0.2s` para el efecto hover de elevación.

**`PageLayout.css`** → `display: flex` con el sidebar de ancho fijo y el main con `flex: 1`.

---

## Árbol final de componentes y flujo de datos

```
App
 │  datos: movies[], genres[], navLinks[], featuredMovie, year
 │
 ├── Navbar           ← props: links[]
 │
 ├── PageLayout       ← props: genres[], featuredMovie, children
 │    ├── Sidebar     ← props: genres[], featuredMovie
 │    │    └── GenreList  ← props: genres[]   → .map() aquí
 │    │
 │    └── <main>
 │         └── MovieGrid  ← props: movies[]
 │              └── MovieCard × N  ← props: movie  → .map() aquí
 │
 └── Footer           ← props: year
```

---

## Conceptos clave practicados

| Concepto | Dónde se aplica |
|---|---|
| **Componentes funcionales** | Todos los archivos JSX |
| **Props** | Cada componente recibe datos de su padre |
| **Desestructuración de props** | `MovieCard`, `Sidebar`, `PageLayout` |
| **`.map()` con `key`** | `Navbar`, `GenreList`, `MovieGrid` |
| **Patrón `children`** | `PageLayout` |
| **`style` dinámico** | `MovieCard` y `Sidebar` (color de borde/fondo por película) |
| **Separación de responsabilidades** | Datos en `data/movies.js`, lógica de presentación en componentes |
| **Variables CSS** | `index.css` con `--color-primary`, etc. |

---

## Para ejecutar la solución

```bash
cd solucion
npm install
npm run dev
```

La aplicación arrancará en `http://localhost:5173`.
