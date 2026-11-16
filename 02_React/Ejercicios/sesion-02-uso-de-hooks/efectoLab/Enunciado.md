# 🧪 EfectoLab – Efectos, re-montajes y persistencia en React

## Objetivo

Construir un **laboratorio interactivo** llamado **EfectoLab** en el que se pueda
*ver* lo que normalmente es invisible:

- cuándo se ejecuta cada variante de `useEffect`;
- en qué se diferencia un **re-render** de un **re-montaje**;
- qué estado sobrevive a cada uno de ellos;
- cómo usar **Context API** para que la información sobreviva al desmontaje de un
  componente, y **localStorage** para que sobreviva incluso a una recarga del
  navegador.

A diferencia de un ejercicio "de maquetar pantallas", aquí **el objeto de estudio
es el ciclo de vida**. La interfaz es solo el instrumento de medida.

---

## 1. Conceptos técnicos que necesitas

Esta sección no es relleno: sin estas ideas claras el ejercicio no se puede
resolver. Léela antes de escribir código.

### 1.1 Render, re-render, montaje y re-montaje

Cuatro palabras que se confunden constantemente:

| Término | Qué ocurre | Qué pasa con el estado |
|---|---|---|
| **Montaje** (*mount*) | React crea la instancia del componente y la inserta en el DOM. Es la primera vez que existe. | Se crea desde cero (`useState` ejecuta su valor inicial) |
| **Render / re-render** | React vuelve a **llamar a la función** del componente para saber qué debe pintar. La instancia es la misma. | **Se conserva** |
| **Desmontaje** (*unmount*) | React saca el componente del árbol. La instancia se destruye. | Se **destruye** |
| **Re-montaje** (*remount*) | Desmontaje + montaje de un componente del mismo tipo. Instancia **nueva**. | Se **pierde** y vuelve al valor inicial |

Un componente se **re-renderiza** cuando:

1. cambia su propio estado (`useState`),
2. se re-renderiza su componente padre,
3. cambia un contexto que consume.

Un componente se **desmonta** cuando deja de estar en el árbol que devuelve su
padre. Las dos formas habituales:

```jsx
{condicion && <Panel />}        // si `condicion` pasa a false → DESMONTAJE
<Panel key={clave} />           // si `clave` cambia → DESMONTAJE + MONTAJE
```

> 🔑 La `key` es la identidad de un elemento para React. Cambiarla es decirle
> "este ya no es el mismo componente": tira el viejo y construye uno nuevo. Es la
> forma canónica de **resetear** el estado de un componente.

Ocultar con CSS (`display: none`) **no** desmonta nada: el componente sigue vivo
y conserva su estado. Desmontar es sacarlo del árbol de React.

### 1.2 `useEffect`: qué es un efecto y cuándo se ejecuta

Un **efecto** es código que no sirve para calcular el JSX, sino para
**sincronizar React con algo de fuera**: el DOM, el título de la pestaña, un
`setInterval`, una API, `localStorage`, un `addEventListener`…

Durante el render un componente debe ser **puro**: calcular y devolver JSX, sin
tocar nada externo. Todo lo demás va en un efecto, que React ejecuta **después**
de pintar en pantalla.

El segundo argumento de `useEffect` (el *array de dependencias*) decide cuándo se
vuelve a ejecutar:

| Forma | Cuándo se ejecuta | Nombre habitual |
|---|---|---|
| `useEffect(fn)` | Después de **cada render**, sin excepción | Efecto **incondicional** |
| `useEffect(fn, [])` | **Solo al montar** (y su limpieza, solo al desmontar) | Efecto de **montaje** |
| `useEffect(fn, [a, b])` | Al montar y cada vez que `a` o `b` **cambien** | Efecto **condicional** |

React compara las dependencias con `Object.is` (comparación por referencia, no
por contenido). Por eso un objeto, un array o una función creados en el cuerpo
del componente son **una referencia nueva en cada render** y hacen que el efecto
se ejecute siempre, como si no tuviera array. Ese es el origen de la mitad de los
bucles infinitos del mundo:

```jsx
const filtros = { especie: "perro" };          // ❌ referencia nueva cada render
useEffect(() => { /* ... */ }, [filtros]);     // se ejecuta en TODOS los renders
```

### 1.3 La función de limpieza

Si el efecto devuelve una función, React la llama:

1. **antes de volver a ejecutar el efecto** (para deshacer el anterior), y
2. **al desmontar** el componente.

```jsx
useEffect(() => {
  const id = setInterval(tictac, 1000);
  return () => clearInterval(id);   // ← limpieza
}, []);
```

Sin limpieza se acumulan intervalos, listeners y peticiones: el clásico
*memory leak*, y contadores que corren el doble de rápido tras cambiar de
pestaña dos veces.

> ⚠️ **`StrictMode` en desarrollo** monta cada componente, lo desmonta y lo
> vuelve a montar a propósito. Si ves los efectos ejecutándose **dos veces** no
> es un bug tuyo: es React avisándote de que tu efecto debe poder ejecutarse,
> limpiarse y volver a ejecutarse sin romperse. En producción pasa una sola vez.

### 1.4 El bucle infinito (y cómo evitarlo)

```jsx
useEffect(() => {
  setContador(contador + 1);   // 💀 render → efecto → setState → render → efecto → …
});                            // sin array = en cada render
```

Reglas de supervivencia:

- Un efecto **incondicional nunca debe llamar a un `setState`** (ni directo, ni a
  través de una función del contexto que lo haga).
- Si una función viaja en el array de dependencias, debe ser **estable**:
  envuélvela en `useCallback`.
- Para contar renders usa **`useRef`**, no `useState`: modificar `ref.current`
  **no** provoca un re-render.

### 1.5 `useRef` frente a `useState`

| | `useState` | `useRef` |
|---|---|---|
| Sobrevive a los re-renders | ✅ | ✅ |
| Al cambiar, re-renderiza | ✅ | ❌ |
| Sobrevive al re-montaje | ❌ | ❌ |
| Para qué sirve | datos que se pintan | nodos del DOM, ids de temporizadores, contadores de diagnóstico |

### 1.6 Context API: estado que sobrevive al desmontaje

**El estado vive en el componente que lo declara y muere con él.** De ahí la idea
central del ejercicio: si el estado se declara en un componente que está **por
encima** del que se desmonta, sobrevive.

Context API resuelve dos problemas a la vez:

1. evita el *prop drilling* (pasar props por componentes que no las usan);
2. **sube el estado** a un punto del árbol que no se desmonta, con lo que la
   información persiste entre montajes de los hijos.

Tres momentos:

```jsx
const MiContexto = createContext(null);                 // 1. declarar la "caja"
<MiContexto.Provider value={...}>{children}</...>       // 2. inyectar valores
const valor = useContext(MiContexto);                   // 3. consumir desde cualquier hijo
```

> ⚠️ Un componente **no** puede consumir con `useContext` el contexto que él mismo
> provee: el `Provider` solo alcanza a sus hijos.

### 1.7 `localStorage`: persistencia entre recargas

`localStorage` es un almacén **clave → valor** del navegador, por origen
(`http://localhost:5173`), sin fecha de caducidad y de unos 5 MB.

```js
localStorage.setItem("clave", JSON.stringify(valor));   // guardar
const valor = JSON.parse(localStorage.getItem("clave")); // leer
localStorage.removeItem("clave");                        // borrar
```

Lo que hay que tener presente:

- **Solo almacena strings.** Hay que serializar con `JSON.stringify` y parsear con
  `JSON.parse`. `getItem` de una clave inexistente devuelve `null`.
- **No es reactivo.** Cambiarlo no re-renderiza nada: React no se entera.
- **Es síncrono y bloqueante**, así que no conviene escribir en él en cada
  pulsación de tecla sin más (de ahí el *debounce* del ejercicio).
- **Puede fallar**: JSON corrupto, modo privado, cuota llena. Toda lectura y
  escritura debería ir en un `try/catch`.
- El evento **`storage`** avisa a *las demás* pestañas del mismo origen cuando una
  modifica el almacén (nunca a la que hizo el cambio).

### 1.8 La idea que resume el ejercicio

| Dónde vive el estado | Sobrevive a un re-render | Sobrevive a un re-montaje | Sobrevive a <kbd>F5</kbd> |
|---|---|---|---|
| `useRef` en el componente | ✅ | ❌ | ❌ |
| `useState` en el componente | ✅ | ❌ | ❌ |
| `useState` en un Provider por encima | ✅ | ✅ | ❌ |
| `localStorage` | ✅ | ✅ | ✅ |

---

## 2. La aplicación que hay que construir

**EfectoLab** es un laboratorio con tres paneles intercambiables y una bitácora
que registra, en vivo, los efectos que se ejecutan.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🧪 EfectoLab        ⏱️ 02:14   🎯 6 ciclos   🔄 37 renders   ☀️ Tema claro   │ Cabecera
├──────────────────────────────────────────────────────────┬───────────────────┤
│ [⏱️ Temporizador] [📝 Notas] [📊 Estadísticas]           │ 📜 Bitácora       │
│                                                          │  ───────────────  │
│ [🔄 Forzar re-render (3)] [♻️ Forzar re-montaje key=2]   │ 12:04:11 🟢 MONTAJE│
│                                                          │ 12:04:11 ⏱️ setInt.│
│ ┌──────────────────────────────────────────────────────┐ │ 12:04:12 🎉 Ciclo 1│
│ │ ⏱️ Temporizador de foco   instancia a9f3 · render 12 │ │ 12:04:18 💾 Borrad.│
│ ├──────────────────────────────────────────────────────┤ │ 12:04:20 🔴 DESMON.│
│ │ ┌─ Tiempo total ─────┐  ┌─ Esta instancia ────────┐  │ │ 12:04:20 🧹 clearI.│
│ │ │      02:14         │  │        00:09            │  │ │        ...        │
│ │ │ contexto+localSt.  │  │ useState local          │  │ │                   │
│ │ └────────────────────┘  └─────────────────────────┘  │ │                   │
│ │ ███████████░░░░░░░  ciclo 11s de 20s                 │ │                   │
│ │ [⏸️ Pausar]  efecto sin deps · render 12 · 12:04:19   │ │                   │
│ └──────────────────────────────────────────────────────┘ │                   │
└──────────────────────────────────────────────────────────┴───────────────────┘
```

### Panel 1 · ⏱️ Temporizador de foco

- Cronómetro con **arrancar / pausar** que acumula segundos de "foco".
- Cada **20 segundos** se completa un *ciclo*. El número de ciclos **no es
  estado**: se **deriva** de los segundos.
- Muestra **dos** contadores juntos para poder compararlos:
  - **tiempo total**, que vive en el contexto y en `localStorage`;
  - **tiempo de esta instancia**, con `useState` local, que vuelve a `00:00` en
    cada re-montaje.
- El tiempo total debe **seguir avanzando aunque el panel esté desmontado**
  (pista: entonces el `setInterval` no puede vivir en el panel).

### Panel 2 · 📝 Notas de la sesión

- Dos `textarea` idénticos en apariencia:
  - **borrador persistente**: se autoguarda en `localStorage` ~600 ms después de
    la última tecla (*debounce*);
  - **borrador volátil**: solo `useState` local, se pierde al cambiar de pestaña.
- Botón para convertir el borrador en una **nota guardada**. La lista de notas se
  persiste en `localStorage` y se puede borrar nota a nota.
- Al montar el panel, el `textarea` persistente debe recibir el **foco**.

### Panel 3 · 📊 Estadísticas y almacén

- Resumen de la sesión: segundos de foco, ciclos, número de notas.
- **Montajes por panel**: cuántas veces se ha montado cada uno.
- La **tabla "¿qué sobrevive a qué?"** del apartado 1.8.
- Un **volcado del contenido real de `localStorage`**, tal cual lo guarda el
  navegador (strings con JSON dentro), con un botón para releerlo.
- Botones para **poner los contadores a cero** y para **borrar `localStorage`**.

### Barra de control (siempre visible)

- **🔄 Forzar re-render**: cambia un estado del contenedor que el panel no usa.
  El panel se re-renderiza (sube su nº de render) pero **no** se re-monta (la
  instancia no cambia).
- **♻️ Forzar re-montaje**: cambia la `key` del panel. Instancia nueva, nº de
  render otra vez a 1 y estado local perdido.

### Bitácora de efectos

Lista de entradas con hora, coloreadas por tipo: `MONTAJE`, `DESMONTAJE`,
`efecto`, `limpieza`, `guardado`. Debe registrar como mínimo:

- montaje y desmontaje de cada panel (con un id de instancia);
- creación y cancelación del `setInterval`;
- cada ciclo completado;
- cada autoguardado del borrador.

La bitácora vive en el **contexto**: por eso no se vacía al cambiar de pestaña,
aunque las entradas las haya generado un componente que ya no existe.

---

## 3. Requisitos técnicos

- **React + Vite**, JavaScript (sin TypeScript).
- **CSS plano**, sin Tailwind ni librerías de componentes.
- Sin librerías de estado (Redux, Zustand…) ni de persistencia.
- `StrictMode` **activado**: forma parte de lo que hay que observar.
- `npm run lint` debe terminar sin errores.

### Efectos obligatorios

Cada fila tiene que existir en algún punto de tu solución:

| # | Variante | Dónde (sugerido) | Qué hace |
|---|---|---|---|
| 1 | `useEffect(fn)` **sin array** | `App` | Actualiza `document.title` con el nº de render. **No puede llamar a `setState`** |
| 2 | `useEffect(fn)` **sin array** | Panel del temporizador | Escribe una marca de tiempo en el DOM mediante un `ref` (sin tocar el estado) |
| 3 | `useEffect(fn, [])` | Custom hook de ciclo de vida | Apunta el MONTAJE y, en la limpieza, el DESMONTAJE |
| 4 | `useEffect(fn, [])` | Panel del temporizador | `setInterval` propio del panel + `clearInterval` en la limpieza |
| 5 | `useEffect(fn, [])` | Panel de notas | Pone el foco en el `textarea` |
| 6 | `useEffect(fn, [enMarcha])` | Provider | Crea/cancela el `setInterval` global del cronómetro |
| 7 | `useEffect(fn, [ciclos])` | Provider | Registra un ciclo completado: se dispara **una vez por ciclo**, aunque el componente se renderice cada segundo |
| 8 | `useEffect(fn, [tema])` | Provider | Sincroniza la clase del `<html>` con el tema |
| 9 | `useEffect(fn, [clave, valor])` | Hook de persistencia | Guarda en `localStorage` cuando el valor cambia |
| 10 | `useEffect(fn, [texto])` **con limpieza** | Panel de notas | Autoguardado con *debounce*: la limpieza cancela el `setTimeout` anterior |
| 11 | `useEffect(fn, [clave])` **con limpieza** | Hook de persistencia | `addEventListener("storage")` / `removeEventListener` |

### Hooks que hay que escribir

- **`useEstadoPersistente(clave, valorInicial)`** — se comporta como `useState`
  pero sincronizado con `localStorage`. Devuelve `[valor, setValor]`.
- **`useCicloDeVida(nombre)`** — instrumenta un componente: devuelve un id de
  **instancia** y el **nº de render**, y escribe en la bitácora al montarse y al
  desmontarse. Debe usarse en los **tres** paneles.
- **`useSesion()`** — envoltorio de `useContext` que lanza un error claro si se
  usa fuera del `Provider`.

### Estructura de carpetas sugerida

```
src/
├── main.jsx
├── index.css                        ← reset + variables de tema (:root y :root.claro)
├── constantes.js                    ← claves de localStorage, duración del ciclo…
├── App.jsx / App.css                ← efecto incondicional, useRef, key de re-montaje
├── utils/
│   └── tiempo.js                    ← formatear mm:ss
├── context/
│   └── sesion/
│       ├── SesionContext.js         ← createContext (solo la constante)
│       └── SesionProvider.jsx       ← todo el estado compartido + sus efectos
├── hooks/
│   ├── useSesion.js
│   ├── useEstadoPersistente.js
│   └── useCicloDeVida.js
└── components/
    ├── Cabecera.jsx / .css
    ├── BarraDePestanas.jsx / .css
    ├── EncabezadoDePanel.jsx        ← instancia + nº de render (común a los 3 paneles)
    ├── Panel.css                    ← estilos compartidos de los paneles
    ├── PanelTemporizador.jsx
    ├── PanelNotas.jsx
    ├── PanelEstadisticas.jsx
    └── Bitacora.jsx / .css
```

> 📌 El contexto se separa en dos archivos (`SesionContext.js` con la constante y
> `SesionProvider.jsx` con el componente) porque ESLint con `react-refresh` exige
> que un archivo que exporta componentes no exporte además otros valores. Por lo
> mismo, las constantes viven en `constantes.js`.

---

## 4. Guion de laboratorio

El ejercicio **no está terminado hasta que puedas explicar estas observaciones**.
Haz cada experimento y anota qué ocurre y por qué.

| # | Experimento | Pregunta a responder |
|---|---|---|
| 1 | Pulsa **Forzar re-render** varias veces con el panel del temporizador abierto | ¿Cambia el id de instancia? ¿Y el nº de render? ¿Se vacía el contador local? |
| 2 | Pulsa **Forzar re-montaje** | ¿Qué tres cosas cambian a la vez? ¿Por qué el tiempo total no se pierde? |
| 3 | Arranca el cronómetro y vete a **Notas** 10 segundos | Al volver, ¿cuánto marca el tiempo total? ¿Y el tiempo de la instancia? ¿Dónde vive cada intervalo? |
| 4 | Escribe en los dos borradores, espera 1 s, cambia de pestaña y vuelve | ¿Cuál sobrevive? ¿Qué pasa si cambias de pestaña **sin** esperar? |
| 5 | Recarga con <kbd>F5</kbd> | ¿Qué cuatro cosas siguen ahí? ¿Qué se ha perdido? ¿Por qué la bitácora sí y el cronómetro en marcha no? |
| 6 | Mira la bitácora justo al cargar la página | ¿Por qué cada MONTAJE aparece duplicado? ¿Qué pasaría si quitaras `StrictMode`? |
| 7 | Abre la app en **dos pestañas**, guarda una nota en una | ¿Qué ocurre en la otra? ¿Qué efecto lo hace posible? |
| 8 | Abre las DevTools → *Application* → *Local Storage* | ¿Qué tipo tienen los valores guardados? ¿Por qué hace falta `JSON.parse`? |
| 9 | Deja el cronómetro corriendo y mira la bitácora | El Provider se renderiza cada segundo: ¿por qué el efecto de los ciclos solo apunta una entrada cada 20 s? |
| 10 | Borra `localStorage` desde las DevTools y recarga | ¿De dónde salen entonces los valores iniciales? |

---

## 5. Criterios de evaluación

- ✅ Existen las **tres variantes** de `useEffect` y cada una tiene un efecto
  **observable** en la interfaz.
- ✅ Hay al menos **tres funciones de limpieza** distintas y se puede ver en la
  bitácora cuándo se ejecutan.
- ✅ Ningún efecto provoca un bucle infinito. Las funciones que viajan en arrays
  de dependencias son estables (`useCallback`).
- ✅ El contador de renders usa `useRef` y no causa renders adicionales.
- ✅ Los botones de **re-render** y **re-montaje** permiten distinguir ambos
  fenómenos sin ambigüedad (id de instancia + nº de render).
- ✅ El estado compartido vive en un **Provider** y sobrevive al desmontaje de los
  paneles; se consume con `useContext` a más de un nivel de profundidad.
- ✅ `useEstadoPersistente` hidrata desde `localStorage` en el **primer render**
  (sin parpadeo del valor por defecto), guarda solo cuando el valor cambia y
  maneja errores con `try/catch`.
- ✅ El número de ciclos se **deriva**, no se guarda en un `useState` paralelo.
- ✅ Recargar la página conserva: segundos de foco, notas, borrador y tema.
- ✅ `npm run lint` pasa sin errores y no hay `console.error` en la consola.

---

## 6. Pistas

- **Si algo se tiene que perder al re-montar, ponlo en el panel. Si tiene que
  sobrevivir, ponlo en el Provider. Si tiene que sobrevivir a <kbd>F5</kbd>,
  además en `localStorage`.** Esa frase resuelve el 90 % del ejercicio.
- Para hidratar desde `localStorage` usa el **inicializador perezoso** de
  `useState`: `useState(() => leer(clave))`. La función solo se ejecuta en el
  primer render. Si lo haces con un `useEffect([])` + `setValor`, el primer render
  pintará el valor por defecto y verás un parpadeo.
- En el `setInterval`, actualiza el estado con la forma funcional
  (`setX(x => x + 1)`). Así el efecto no depende del valor actual y no hay que
  recrear el intervalo cada segundo.
- Para el *debounce*: `setTimeout` dentro del efecto y `clearTimeout` en la
  limpieza. La limpieza se ejecuta **antes** de la siguiente ejecución del efecto,
  así que cada tecla cancela el guardado pendiente.
- Un id de instancia estable se consigue con `useState(() => Math.random().toString(36).slice(2, 7))`:
  se calcula una vez por instancia y cambia solo al re-montar.
- Si un efecto se ejecuta más de lo que esperas, imprime sus dependencias: casi
  siempre hay un objeto, un array o una función creados en línea.
- `document.title` y `document.documentElement.classList` están **fuera** de
  React: tocarlos desde un efecto incondicional es seguro porque no disparan
  renders.

---

## 7. Retos extra (opcionales)

1. **Persistir la pestaña activa** para que una recarga te devuelva al mismo panel.
2. **Guardar el borrador al desmontar**: aprovecha la función de limpieza del
   efecto de *debounce* para que no se pierdan las últimas letras.
3. **Versionar el almacén**: guarda una clave `efectolab:version` y descarta los
   datos si el formato ha cambiado (lo que harías en una app real al cambiar el
   modelo de datos).
4. **Caducidad**: guarda junto a los segundos una marca de tiempo y descártalos si
   han pasado más de 24 h.
5. **Comparar con `sessionStorage`**: cambia el almacén y explica qué cambia al
   abrir una pestaña nueva.
6. **Registro sin estado de React**: mueve la bitácora a un *store* externo con
   `useSyncExternalStore`, como en `../ejemplo-rerender-y-remontaje/src/registro.js`,
   y explica qué problema del `setState` dentro de efectos desaparece.

---

## 8. Recursos oficiales

- [Sincronizar con efectos](https://react.dev/learn/synchronizing-with-effects)
- [Ciclo de vida de los efectos reactivos](https://react.dev/learn/lifecycle-of-reactive-effects)
- [Puede que no necesites un efecto](https://react.dev/learn/you-might-not-need-an-effect)
- [`useEffect`](https://react.dev/reference/react/useEffect) · [`useRef`](https://react.dev/reference/react/useRef) · [`useContext`](https://react.dev/reference/react/useContext) · [`createContext`](https://react.dev/reference/react/createContext) · [`useCallback`](https://react.dev/reference/react/useCallback)
- [Preservar y resetear el estado (la `key`)](https://react.dev/learn/preserving-and-resetting-state)
- [Reutilizar lógica con Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [`StrictMode`](https://react.dev/reference/react/StrictMode)
- [`Window.localStorage` (MDN)](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [Evento `storage` (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
