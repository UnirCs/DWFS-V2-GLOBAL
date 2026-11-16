# 🐾 AdoptaMe – Solución paso a paso

## Índice

1. [Racional previo: ¿qué hook encaja dónde?](#racional-previo)
2. [Paso 1 – Crear el proyecto](#paso-1)
3. [Paso 2 – CSS global y variables de tema](#paso-2)
4. [Paso 3 – useContext: AppContext](#paso-3)
5. [Paso 4 – Custom Hook: useFavorites](#paso-4)
6. [Paso 5 – Custom Hook: useAnimals (useEffect [])](#paso-5)
7. [Paso 6 – App.jsx (useEffect sin deps + useRef)](#paso-6)
8. [Paso 7 – Componentes de presentación](#paso-7)
9. [Mapa conceptual final](#mapa-final)
10. [Errores comunes](#errores-comunes)

---

## Racional previo: ¿qué hook encaja dónde? <a name="racional-previo"></a>

Antes de escribir código conviene hacerse esta pregunta por cada pieza de lógica:

| Pregunta | Hook a usar |
|---|---|
| ¿Necesito que un valor cause un re-render cuando cambia? | `useState` |
| ¿Necesito sincronizar algo externo (DOM, API, timer) con el estado? | `useEffect` |
| ¿Necesito un valor compartido por toda la app sin pasar props manualmente? | `useContext` |
| ¿Tengo lógica con hooks que se repite en dos o más componentes? | Custom Hook |
| ¿Necesito un valor que persista entre renders pero SIN causar re-render? | `useRef` |

En esta app:
- El **filtro de especie** y los **favoritos** → `useState`
- El **tema** y el **nombre de usuario** → `useContext` (son globales)
- La **carga inicial de animales** → `useEffect []`
- La **actualización del mensaje de resultados** → `useEffect [animals]`
- La **actualización del título de la pestaña** → `useEffect` sin deps
- El **contador de renders** sin causar re-renders → `useRef`
- La **lógica de favoritos** reutilizada en dos sitios → `useFavorites` (custom hook)

---

## Paso 1 – Crear el proyecto <a name="paso-1"></a>

```bash
npm create vite@latest adopta-me -- --template react
cd adopta-me
npm install
```

Crear la estructura de carpetas manualmente:

```bash
mkdir -p src/context/global src/hooks src/components
```

> 📌 **¿Por qué separar en carpetas?** Separar contexto, hooks y componentes facilita encontrar cada pieza y hace explícito su rol en la arquitectura. La subcarpeta `context/global` agrupa los ficheros del contexto global (declaración + Provider) y evita las advertencias de ESLint Fast Refresh al tener cada archivo con una única responsabilidad de exportación.

---

## Paso 2 – CSS global y variables de tema <a name="paso-2"></a>

Definimos dos "conjuntos" de variables CSS: uno para el tema oscuro (por defecto en `:root`) y otro para el claro (en `:root.light`). Cuando queramos cambiar el tema solo tenemos que añadir o quitar la clase `light` del elemento `<html>`.

```css
/* src/index.css */
:root {
  --bg: #0f0f13;
  --bg-surface: #1a1a24;
  --text: #eaeaea;
  --primary: #7c6af7;
  /* ... más variables ... */
}

:root.light {
  --bg: #f0f0f5;
  --bg-surface: #ffffff;
  --text: #1a1a2e;
  /* solo sobreescribimos las que cambian */
}
```

> 📖 **Doc:** [Using CSS custom properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

## Paso 3 – useContext: AppContext <a name="paso-3"></a>

### ¿Cuándo usar useContext?

`useContext` es la solución cuando tienes datos que **muchos componentes necesitan** y pasarlos por props implicaría atravesar componentes intermedios que no los usan (eso se llama **prop drilling**).

En esta app, `userName` y `theme` los necesitan `Header`, `AnimalCard` y `FavoritesSidebar`. Sin contexto habría que pasar esas props por `App → AnimalGrid → AnimalCard`, lo cual es ruido innecesario.

### Implementación en tres archivos

> ⚠️ **Motivación:** ESLint con `react-refresh` exige que cada archivo exporte **un único tipo de cosa**: solo componentes, solo constantes o solo funciones. Reunir el contexto, el Provider y el hook en un mismo archivo genera advertencias. La solución es dividirlos.

**1️⃣ Declaración del contexto** — solo exporta la constante `AppContext`:

```js
// src/context/global/AppContext.js
import { createContext } from "react";

// Valor por defecto null para detectar usos fuera del Provider
export const AppContext = createContext(null);
```

**2️⃣ Provider** — solo exporta el componente `AppProvider`:

```jsx
// src/context/global/AppProvider.jsx
import { useState } from "react";
import { AppContext } from "./AppContext";

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [userName] = useState("Ada Lovelace");

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("light", next === "light");
      return next;
    });
  }

  return (
    <AppContext.Provider value={{ theme, toggleTheme, userName }}>
      {children}
    </AppContext.Provider>
  );
}
```

**3️⃣ Hook de acceso** — solo exporta la función `useGlobalContext`:

```js
// src/hooks/useGlobalContext.js
import { useContext } from "react";
import { AppContext } from "../context/global/AppContext";

export function useGlobalContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useGlobalContext debe usarse dentro de <AppProvider>");
  return ctx;
}
```

**Tres momentos distintos:**
1. `createContext` → define la "caja" donde viven los datos globales.
2. `<AppContext.Provider value={...}>` → "inyecta" los datos en el árbol de componentes.
3. `useContext(AppContext)` (vía `useGlobalContext()`) → "extrae" los datos desde cualquier componente hijo.


> 📖 **Doc:** [createContext](https://react.dev/reference/react/createContext) · [useContext](https://react.dev/reference/react/useContext)

---

## Paso 4 – Custom Hook: `useFavorites` <a name="paso-4"></a>

### ¿Cuándo crear un custom hook?

Cuando la **misma lógica con hooks** (no solo funciones) aparece en más de un componente. Si te encuentras copiando y pegando bloques de `useState` + funciones de manipulación, es señal de que ese código merece su propio hook.

### Reglas de los hooks

- Solo llamar hooks en el nivel raíz de una función (no dentro de `if`, `for`, etc.).
- Solo llamar hooks desde componentes de React o desde otros custom hooks.
- El nombre debe empezar por `use` (convención que permite a herramientas como el linter detectarlos).

```js
// src/hooks/useFavorites.js
import { useState } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  function addFavorite(id) {
    setFavorites((prev) => prev.includes(id) ? prev : [...prev, id]);
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
```

> ⚠️ **Importante:** cada llamada a `useFavorites()` crea su **propia instancia de estado**. Para que `AnimalCard` y `FavoritesSidebar` compartan la misma lista de favoritos, el hook se llama **una sola vez** en `App` y se pasa el resultado por props. Esto se llama **lifting state up**.

> 📖 **Doc:** [Reutilizar lógica con Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## Paso 5 – Custom Hook: `useAnimals` (useEffect []) <a name="paso-5"></a>

Este hook demuestra las **dos primeras variantes de useEffect** en un mismo archivo.

### useEffect con `[]` — "solo al montar"

```js
useEffect(() => {
  // Se ejecuta UNA SOLA VEZ cuando el componente que usa este hook se monta.
  // Equivale al componentDidMount de las clases.
  setLoading(true);
  const timer = setTimeout(() => {
    setAllAnimals(MOCK_DATA.all);
    setLoading(false);
  }, 900); // simula latencia de red

  // 🔴 Función de limpieza: se ejecuta si el componente se DESMONTA antes de que termine.
  // Evita actualizar el estado de un componente ya desmontado (memory leak).
  return () => clearTimeout(timer);
}, []); // <── array vacío
```

> ❓ **¿Por qué la función de limpieza?** Si el usuario navega a otra página antes de que los 900ms terminen, el componente se desmonta. Sin limpieza, el `setTimeout` intentaría llamar a `setAllAnimals` sobre un componente inexistente. El `clearTimeout` cancela esa llamada.

### useEffect con `[species, allAnimals]` — "cuando cambia la especie"

```js
useEffect(() => {
  if (allAnimals.length === 0) return;
  if (species === "all") {
    setAnimals(allAnimals);
  } else {
    setAnimals(allAnimals.filter((a) => a.species === species));
  }
}, [species, allAnimals]); // <── se ejecuta cada vez que species o allAnimals cambien
```

> 📌 **Regla:** todo valor externo que use el efecto debe estar en el array de dependencias. Si `species` no estuviese, el efecto siempre filtraría por el valor inicial de `species` ("all"), ignorando los cambios.

> 📖 **Doc:** [useEffect](https://react.dev/reference/react/useEffect) · [Sincronización con efectos](https://react.dev/learn/synchronizing-with-effects)

---

## Paso 6 – App.jsx (useEffect sin deps + useRef) <a name="paso-6"></a>

### useEffect sin array de dependencias — "en cada render"

```jsx
const renderCount = useRef(0);
renderCount.current += 1; // incrementar sin causar re-render

useEffect(() => {
  // Sin segundo argumento: se ejecuta después de CADA render.
  // Útil para sincronizar algo que depende de la UI completa.
  document.title = `AdoptaMe 🐾 | Render #${renderCount.current}`;
}); // <── sin segundo argumento
```

> ⚠️ **Peligro habitual:** poner `setState` dentro de un `useEffect` sin deps crea un bucle infinito:
> render → efecto → setState → render → efecto → … 🔁
> Asegúrate de que el efecto sin deps no modifica el estado.

### useRef para el contador

`useRef` devuelve un objeto `{ current: valor }` que persiste entre renders. A diferencia de `useState`, **modificar `.current` no provoca un re-render**. Por eso es ideal para llevar contadores de uso interno, referencias al DOM, etc.

```jsx
const renderCount = useRef(0);
renderCount.current += 1; // no causa re-render
```

> 📖 **Doc:** [useRef](https://react.dev/reference/react/useRef)

### Estructura de App.jsx

`App` se divide en dos funciones para poder envolver todo con el `Provider`:

```jsx
function AppContent() {
  // Aquí van todos los hooks y el JSX de la aplicación
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />  {/* AppContent puede usar useGlobalContext porque está dentro del Provider */}
    </AppProvider>
  );
}
```

> ⚠️ **Error común:** llamar `useContext` en el mismo componente donde está `<Context.Provider>` no funciona. El Provider solo afecta a sus **hijos**, no a sí mismo. Por eso separamos `App` y `AppContent`.

---

## Paso 7 – Componentes de presentación <a name="paso-7"></a>

### Header — consume useContext

```jsx
export default function Header() {
  const { userName, theme, toggleTheme } = useGlobalContext();
  // Header está 1 nivel por debajo de AppProvider.
  // No necesita que App le pase userName ni theme como props.
  return (
    <header>
      <h1>AdoptaMe</h1>
      <span>👤 {userName}</span>
      <button onClick={toggleTheme}>
        {theme === "dark" ? "☀️ Modo claro" : "🌙 Modo oscuro"}
      </button>
    </header>
  );
}
```

### AnimalGrid — useEffect con dependencias

```jsx
export default function AnimalGrid({ animals, loading, favoritesHook }) {
  const [resultMsg, setResultMsg] = useState("");

  useEffect(() => {
    if (loading) return;
    setResultMsg(`${animals.length} animales disponibles`);
  }, [animals, loading]); // actualiza el mensaje cuando cambia el array filtrado

  // ...
}
```

### AnimalCard — useContext + useFavorites

Demuestra que `useContext` funciona a cualquier profundidad sin recibir props intermedias:

```jsx
// App → AnimalGrid → AnimalCard
// ↑ Provider está aquí      ↑ useContext funciona aquí sin props intermedias
export default function AnimalCard({ animal, favoritesHook }) {
  const { userName } = useGlobalContext(); // ← del contexto, no de props
  const { isFavorite, toggleFavorite } = favoritesHook; // ← del custom hook
  // ...
}
```

### FavoritesSidebar — reutiliza useFavorites

```jsx
export default function FavoritesSidebar({ animals, favoritesHook }) {
  const { userName } = useGlobalContext();
  const { favorites, removeFavorite } = favoritesHook; // mismo objeto que AnimalCard

  // Convierte IDs en objetos completos de animal
  const favoriteAnimals = favorites
    .map((id) => animals.find((a) => a.id === id))
    .filter(Boolean);
  // ...
}
```

> 💡 `favoritesHook` es el objeto que devuelve `useFavorites()` llamado en `App`. Al pasarlo por props, `AnimalCard` y `FavoritesSidebar` comparten el **mismo estado** de favoritos. Si cada uno llamase a `useFavorites()` de forma independiente, tendrían estados separados e inconsistentes.

---

## Mapa conceptual final <a name="mapa-final"></a>

```
AppProvider (AppContext: userName, theme, toggleTheme)
 │
 └── AppContent
      ├── [useState] species, renderCount (useRef)
      ├── [useEffect sin deps] → document.title en cada render
      ├── useAnimals(species)
      │    ├── [useEffect []] → carga inicial de datos
      │    └── [useEffect [species]] → filtra datos al cambiar especie
      ├── useFavorites() → instancia única, pasada por props
      │
      ├── Header
      │    └── [useContext] ← userName, theme, toggleTheme
      ├── FilterBar
      │    └── onSpeciesChange → actualiza species en App
      ├── AnimalGrid
      │    ├── [useEffect [animals]] → actualiza mensaje de resultados
      │    └── AnimalCard × N
      │         ├── [useContext] ← userName
      │         └── favoritesHook.toggleFavorite / isFavorite
      ├── FavoritesSidebar
      │    ├── [useContext] ← userName
      │    └── favoritesHook.favorites / removeFavorite
      └── RenderCounter ← recibe renderCount.current como prop
```

---

## Errores comunes <a name="errores-comunes"></a>

| Error | Causa | Solución |
|---|---|---|
| Bucle infinito en `useEffect` | Llamar a `setState` dentro de un `useEffect` sin deps, o con una dependencia que cambia en cada render | Revisar el array de dependencias; no incluir objetos/arrays creados inline |
| `useContext` devuelve `null` o `undefined` | El componente está fuera del `Provider` | Asegurarse de que `<AppProvider>` envuelve a todos los componentes que usan `useGlobalContext` |
| Los dos componentes no comparten favoritos | Cada componente llama a `useFavorites()` por separado | Llamar al hook una sola vez en el componente raíz y pasar el resultado por props |
| La función de limpieza de `useEffect` no se ejecuta | No se devuelve la función de limpieza con `return` | `return () => clearTimeout(timer)` dentro del `useEffect` |
| El `useEffect []` se ejecuta dos veces en desarrollo | React.StrictMode monta/desmonta los componentes intencionalmente para detectar efectos sin limpieza | Es comportamiento esperado en dev. En producción solo se ejecuta una vez |

---

## Para ejecutar la solución

```bash
cd solucion
npm install
npm run dev
```

La app arranca en `http://localhost:5173`. Observa:
1. La pestaña del navegador cambia de título con cada interacción → `useEffect` sin deps.
2. Al arrancar aparece el spinner durante ~900ms → `useEffect []`.
3. Al cambiar el filtro se actualiza el mensaje de resultados → `useEffect [animals]`.
4. El botón ☀️/🌙 cambia el tema sin pasar props → `useContext`.
5. Los favoritos se sincronizan entre las cards y la sidebar → custom hook con estado elevado.

---

## Recursos oficiales

- [useState](https://react.dev/reference/react/useState)
- [useEffect](https://react.dev/reference/react/useEffect)
- [useRef](https://react.dev/reference/react/useRef)
- [useContext](https://react.dev/reference/react/useContext)
- [createContext](https://react.dev/reference/react/createContext)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Sincronización con efectos](https://react.dev/learn/synchronizing-with-effects)
- [Puede que no necesites un efecto](https://react.dev/learn/you-might-not-need-an-effect)
