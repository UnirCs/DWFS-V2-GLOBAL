# 🎬 CineReact – Ejercicio de Composición por Componentes

## Objetivo

Aplicar la **orientación a componentes** de React construyendo una interfaz de cartelera de cine llamada **CineReact**. A partir del diseño que se muestra a continuación, deberás identificar los distintos bloques de la pantalla, convertirlos en componentes React independientes y ensamblarlos para formar la interfaz final.

---

## Diseño de la pantalla

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎬 CineReact          Inicio   Estrenos   Géneros   Contacto           │  ← Navbar
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                     │
│  FILTRAR POR       │  🎬 Estrenos de la semana                          │
│  ─────────────     │                                                     │
│  • Acción          │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  • Comedia         │  │          │  │          │  │          │         │
│  • Drama           │  │  🏜️ img  │  │  🦸 img  │  │  😂 img  │         │  ← Cards (×N)
│  • Terror          │  │          │  │          │  │          │         │
│  • Sci-Fi          │  │  Título  │  │  Título  │  │  Título  │         │
│                    │  │  Género  │  │  Género  │  │  Género  │         │
│  ⭐ DESTACADO      │  │  ⭐ X.X  │  │  ⭐ X.X  │  │  ⭐ X.X  │         │
│  ─────────────     │  │[Ver más] │  │[Ver más] │  │[Ver más] │         │
│  🏜️ Dune: Parte III│  └──────────┘  └──────────┘  └──────────┘         │
│  Sci-Fi · ⭐ 9.0   │                                                     │
│                    │  ┌──────────┐  ┌──────────┐                        │
│                    │  │  🎭 img  │  │  👻 img  │                        │
│                    │  │  ...     │  │  ...     │                        │
│                    │  └──────────┘  └──────────┘                        │
│                    │                                                     │
├────────────────────┴────────────────────────────────────────────────────┤
│            © 2026 CineReact · Todos los derechos reservados             │  ← Footer
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Requisitos

### Generales
- Proyecto creado con **React + Vite** (sin TypeScript).
- No se puede usar `useState` ni `useEffect`. Solo **props y composición de componentes**.
- Los estilos deben ser **CSS plano** (sin librerías externas como Tailwind o MUI).

### Datos
Crea un archivo `src/data/movies.js` que exporte:
- Un array `movies` con al menos **5 películas**. Cada película debe tener: `id`, `title`, `genre`, `rating`, `year`, `description`, `image` (puede ser un emoji), `color`.
- Un array `genres` con los géneros disponibles: `["Acción", "Comedia", "Drama", "Terror", "Sci-Fi"]`.

### Componentes obligatorios

| Componente | Descripción |
|---|---|
| `Navbar` | Barra de navegación superior con logo y links. Recibe la lista de links por props. |
| `Footer` | Barra inferior con copyright. Recibe el año por props. |
| `Sidebar` | Panel lateral izquierdo. Contiene la lista de géneros y una card de película destacada. |
| `GenreList` | Lista de géneros. **Debe usar `.map()` sobre el array de géneros.** |
| `MovieCard` | Tarjeta individual de película. Recibe un objeto película completo por props. |
| `MovieGrid` | Cuadrícula de películas. **Debe usar `.map()` sobre el array de películas** para renderizar un `<MovieCard>` por cada una. |
| `PageLayout` | Envuelve el `<Sidebar>` y el área principal (`<main>`). Usa `children` para el contenido principal. |
| `App` | Componente raíz. Importa los datos y orquesta el layout completo. |

### Estructura de carpetas sugerida

```
src/
├── main.jsx
├── index.css          ← reset y variables CSS globales
├── App.jsx
├── App.css
├── data/
│   └── movies.js
└── components/
    ├── Navbar/
    │   ├── Navbar.jsx
    │   └── Navbar.css
    ├── PageLayout/
    │   ├── PageLayout.jsx
    │   └── PageLayout.css
    ├── Sidebar/
    │   ├── Sidebar.jsx
    │   ├── Sidebar.css
    │   └── GenreList.jsx
    ├── MovieGrid/
    │   ├── MovieGrid.jsx
    │   ├── MovieGrid.css
    │   ├── MovieCard.jsx
    │   └── MovieCard.css
    └── Footer/
        ├── Footer.jsx
        └── Footer.css
```

---

## Criterios de evaluación

- ✅ Todos los componentes están definidos y son funcionales.
- ✅ Los datos fluyen correctamente a través de props (de padre a hijo).
- ✅ Se usa `.map()` con `key` para renderizar listas (géneros y películas).
- ✅ `PageLayout` usa `children` para componer el área de contenido.
- ✅ Los estilos dan a la interfaz un aspecto ordenado y reconocible.
- ✅ No se usa gestión de estado (`useState`, `useReducer`, etc.).

---

## Pistas

- Piensa en el diseño como una jerarquía: ¿qué contiene a qué?
- El componente `App` es el que "sabe" los datos; los demás solo los reciben.
- `PageLayout` puede recibir `children` para colocar `<MovieGrid>` dentro del `<main>`.
- Para el CSS, puedes definir variables globales en `index.css` y usarlas en todos los componentes.
