# 🧪 EfectoLab – Solución paso a paso

> Este documento recorre el **razonamiento** que lleva a la solución, no solo el
> código final. El orden de los pasos es el orden en el que conviene escribirlo:
> de dentro hacia fuera (primero dónde vive el estado, después quién lo pinta).

## Índice

1. [Racional previo: la pregunta que lo decide todo](#racional-previo)
2. [Paso 1 – Crear el proyecto y el esqueleto](#paso-1)
3. [Paso 2 – Constantes y utilidades](#paso-2)
4. [Paso 3 – `useEstadoPersistente`: el puente con localStorage](#paso-3)
5. [Paso 4 – El contexto de sesión en tres archivos](#paso-4)
6. [Paso 5 – El Provider: estado compartido y sus efectos](#paso-5)
7. [Paso 6 – `useCicloDeVida`: hacer visible el montaje](#paso-6)
8. [Paso 7 – `App`: efecto incondicional, re-render y re-montaje](#paso-7)
9. [Paso 8 – Los tres paneles](#paso-8)
10. [Paso 9 – La bitácora](#paso-9)
11. [Por qué hay `eslint-disable` en la solución](#eslint)
12. [Mapa conceptual final](#mapa-final)
13. [Respuestas al guion de laboratorio](#respuestas)
14. [Errores comunes](#errores-comunes)
15. [Para ejecutar la solución](#ejecutar)

---

## Racional previo: la pregunta que lo decide todo <a name="racional-previo"></a>

Antes de escribir una línea, por cada dato de la aplicación hay que responder a
**una sola pregunta**: *¿a qué tiene que sobrevivir?*

| Si el dato tiene que… | Entonces vive en… |
|---|---|
| …conservarse solo mientras el componente exista | `useState` del componente |
| …conservarse sin provocar renders | `useRef` del componente |
| …perderse a propósito al re-montar (para demostrarlo) | `useState` del componente |
| …sobrevivir al desmontaje del componente | `useState` de un **Provider** por encima |
| …sobrevivir a una recarga del navegador | **`localStorage`** (+ contexto para compartirlo) |

Aplicado a EfectoLab:

| Dato | Dónde | Por qué |
|---|---|---|
| Segundos de foco | contexto + `localStorage` | Es el dato "de verdad" de la app |
| Notas guardadas | contexto + `localStorage` | Idem |
| Borrador | contexto + `localStorage` | Debe sobrevivir a cambios de pestaña y a <kbd>F5</kbd> |
| Tema | contexto + `localStorage` | Preferencia del usuario |
| ¿Cronómetro en marcha? | contexto (sin persistir) | Recuperar un cronómetro corriendo tras recargar sería raro |
| Bitácora | contexto (sin persistir) | Es el registro de *esta* sesión |
| Montajes por panel | contexto (sin persistir) | Instrumentación, se reinicia al recargar |
| Tiempo de la instancia | `useState` del panel | **Queremos** que se pierda: es la demostración |
| Borrador volátil | `useState` del panel | Idem |
| Nº de render | `useRef` | Cambia en cada render; con `useState` sería un bucle |
| Id de instancia | `useState` con inicializador perezoso | Estable por instancia, nuevo en cada montaje |
| Nº de ciclos | **nada**: se deriva | `Math.floor(segundos / 20)` |

> 📌 Ese último punto importa: un `useState` para los ciclos sería **estado
> duplicado**. Dos fuentes de verdad para el mismo hecho acaban desincronizadas.
> Si un valor se puede calcular a partir de otro, se calcula.
> 📖 [Puede que no necesites un efecto](https://react.dev/learn/you-might-not-need-an-effect)

---

## Paso 1 – Crear el proyecto y el esqueleto <a name="paso-1"></a>

```bash
npm create vite@latest efecto-lab -- --template react
cd efecto-lab
npm install
mkdir -p src/context/sesion src/hooks src/components src/utils
```

Se borran los ficheros de ejemplo de Vite y se deja `main.jsx` así:

```jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`StrictMode` **se queda**. En este ejercicio no es un estorbo: es parte del
material de estudio. Montar → desmontar → montar es precisamente el ciclo que
delata los efectos sin limpieza.

---

## Paso 2 – Constantes y utilidades <a name="paso-2"></a>

Las claves de `localStorage` se centralizan en `src/constantes.js`:

```js
export const CLAVES = {
  segundos: "efectolab:segundos-de-foco",
  notas: "efectolab:notas",
  borrador: "efectolab:borrador",
  tema: "efectolab:tema",
};

export const SEGUNDOS_POR_CICLO = 20;
export const MAX_ENTRADAS_BITACORA = 40;
export const RETARDO_AUTOGUARDADO = 600;
```

Tres decisiones y su motivo:

1. **Claves con prefijo.** `localStorage` es por **origen**, no por aplicación:
   todos los proyectos que sirvas en `localhost:5173` comparten almacén. Sin
   prefijo, un ejercicio pisa los datos de otro.
2. **Un ciclo de 20 segundos** en lugar de los 25 minutos de un pomodoro real:
   un ejercicio sobre efectos tiene que poder observarse en clase.
3. **Archivo aparte.** Si estas constantes estuvieran en `SesionProvider.jsx`,
   ESLint avisaría: `react-refresh` exige que un archivo que exporta componentes
   no exporte además otros valores (si no, el *hot reload* no puede garantizar
   que el estado se conserve).

---

## Paso 3 – `useEstadoPersistente`: el puente con localStorage <a name="paso-3"></a>

Es la pieza central del ejercicio. La idea: **que usarlo se sienta exactamente
como `useState`**, pero con el valor sincronizado con el navegador.

```js
const [segundos, setSegundos] = useEstadoPersistente("clave", 0);
```

### 3.1 Hidratar: inicializador perezoso, no `useEffect`

```js
const [valor, setValor] = useState(() => leerDelAlmacen(clave, valorInicial));
```

Pasamos una **función** a `useState`, no un valor. React solo la ejecuta en el
primer render de la instancia. Dos razones:

- Si escribiéramos `useState(leerDelAlmacen(clave, valorInicial))`, la lectura se
  ejecutaría en **cada render** (aunque React descarte el resultado).
  `localStorage` es síncrono y bloqueante: no es gratis.
- La alternativa "de libro de texto" sería hidratar en un efecto de montaje:

  ```js
  // ❌ tentador, pero peor
  const [valor, setValor] = useState(valorInicial);
  useEffect(() => { setValor(leerDelAlmacen(clave, valorInicial)); }, []);
  ```

  Funciona, pero el **primer render pinta el valor por defecto** y el segundo el
  real: se ve un parpadeo (el cronómetro aparece a `00:00` y salta a `02:14`).
  Además fuerza un render extra. Es exactamente lo que avisa la regla
  `react-hooks/set-state-in-effect`.

  > 🧠 **Regla general:** si el dato se puede conocer **durante** el primer
  > render, no hace falta un efecto. Los efectos son para sincronizar con el
  > exterior **después** de pintar, no para inicializar.

La lectura va envuelta en `try/catch` y devuelve el valor por defecto si falla:

```js
function leerDelAlmacen(clave, fallback) {
  try {
    const crudo = window.localStorage.getItem(clave);
    if (crudo === null) return fallback;   // la clave no existe todavía
    return JSON.parse(crudo);
  } catch (error) {
    console.warn(`[useEstadoPersistente] No se pudo leer "${clave}"`, error);
    return fallback;
  }
}
```

`getItem` devuelve `null` cuando la clave no existe (ojo: `JSON.parse(null)`
devuelve `null`, no lanza, así que conviene comprobarlo explícitamente). El
`catch` cubre JSON corrupto —muy fácil si cambias el formato de los datos— y
navegadores con el almacén bloqueado.

### 3.2 Guardar: efecto **condicional** `[clave, valor]`

```js
useEffect(() => {
  if (esPrimeraVez.current) {      // en el montaje el valor YA viene del almacén
    esPrimeraVez.current = false;
    return;
  }
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    console.warn(`[useEstadoPersistente] No se pudo guardar "${clave}"`, error);
  }
}, [clave, valor]);
```

Por qué un efecto y no guardar dentro del `setValor`: escribir en `localStorage`
es un **efecto secundario**, y los efectos secundarios no van en el render. Aquí
se ve el patrón completo de `useEffect`: *"cuando este valor cambie, sincroniza
el mundo exterior con él"*.

El `useRef` como bandera es un detalle fino: sin él, el primer efecto escribiría
en el almacén el mismo valor que acabamos de leer. No rompe nada, pero es trabajo
inútil, y el patrón "saltarse la primera ejecución" aparece constantemente.

### 3.3 Escuchar: efecto de **montaje** `[]` con limpieza

```js
useEffect(() => {
  function alCambiarElAlmacen(evento) {
    if (evento.key !== clave) return;
    setValor(evento.newValue === null
      ? valorInicialRef.current
      : leerDelAlmacen(clave, valorInicialRef.current));
  }
  window.addEventListener("storage", alCambiarElAlmacen);
  return () => window.removeEventListener("storage", alCambiarElAlmacen);
}, [clave]);
```

Tres cosas que aprender aquí:

1. El evento `storage` lo dispara el navegador en **las demás pestañas** del
   mismo origen. La pestaña que escribe no se entera (ya lo sabe). Por eso la app
   se sincroniza entre pestañas sin escribir una línea de red.
2. La **limpieza es obligatoria**: sin `removeEventListener` cada montaje añade un
   listener nuevo y el viejo se queda apuntando a un componente muerto.
3. `valorInicial` **no está en las dependencias**, y es deliberado. Quien llama al
   hook escribe `useEstadoPersistente(CLAVES.notas, [])`: ese `[]` es un array
   nuevo en cada render del Provider, así que la dependencia cambiaría siempre y
   el efecto se desuscribiría y volvería a suscribirse en **cada render**. La
   solución es guardarlo en un `ref`:

   ```js
   const valorInicialRef = useRef(valorInicial);   // referencia congelada
   ```

   > 🔑 Esta es la trampa nº 1 de los arrays de dependencias: React compara con
   > `Object.is`, es decir **por referencia**. `[] !== []` y `{} !== {}`.

---

## Paso 4 – El contexto de sesión en tres archivos <a name="paso-4"></a>

Separar en tres archivos no es manía: cada uno exporta **una sola clase de cosa**,
que es lo que exige `react-refresh`.

**1️⃣ La caja** — `src/context/sesion/SesionContext.js`:

```js
import { createContext } from "react";
export const SesionContext = createContext(null);
```

El valor por defecto `null` es intencionado: permite **detectar** que alguien está
consumiendo el contexto fuera del Provider.

**2️⃣ El acceso** — `src/hooks/useSesion.js`:

```js
export function useSesion() {
  const contexto = useContext(SesionContext);
  if (!contexto) {
    throw new Error("useSesion() debe usarse dentro de <SesionProvider>");
  }
  return contexto;
}
```

Sin esta comprobación, el error que verías sería
`Cannot destructure property 'apuntar' of 'null'`, que no dice nada sobre la causa
real. Un buen custom hook falla con un mensaje que explica qué hacer.

**3️⃣ El Provider** — el paso siguiente.

---

## Paso 5 – El Provider: estado compartido y sus efectos <a name="paso-5"></a>

### 5.1 Los dos niveles de persistencia, uno al lado del otro

```jsx
// Sobrevive al re-montaje Y a F5
const [segundosDeFoco, setSegundosDeFoco] = useEstadoPersistente(CLAVES.segundos, 0);
const [notas, setNotas]                   = useEstadoPersistente(CLAVES.notas, []);
const [borrador, setBorrador]             = useEstadoPersistente(CLAVES.borrador, "");
const [tema, setTema]                     = useEstadoPersistente(CLAVES.tema, "oscuro");

// Sobrevive al re-montaje, pero NO a F5
const [enMarcha, setEnMarcha] = useState(false);
const [bitacora, setBitacora] = useState([]);
const [montajes, setMontajes] = useState({});
```

Esas siete líneas son el ejercicio entero. **La clave no es el hook, es la
posición en el árbol:** como el `SesionProvider` está por encima de las pestañas
y nunca se desmonta, su estado sobrevive al desmontaje de los paneles. Lo que
añade `localStorage` es un nivel más: sobrevivir a que **toda** la aplicación
muera.

### 5.2 Acciones estables con `useCallback`

```jsx
const apuntar = useCallback((texto, tipo = "info") => {
  setBitacora((previas) =>
    [{ id: crypto.randomUUID(), hora: horaActual(), texto, tipo }, ...previas]
      .slice(0, MAX_ENTRADAS_BITACORA),
  );
}, []);
```

Aquí `useCallback` **no es una optimización, es un requisito de corrección**:

- `apuntar` viaja en el array de dependencias de los efectos de los paneles.
- Sin `useCallback`, sería una función nueva en cada render del Provider.
- El efecto de montaje de cada panel se re-ejecutaría en cada render del Provider,
  apuntando un MONTAJE nuevo… que provocaría otro render… **bucle infinito**.

Dos detalles más:

- Se usa la **forma funcional** (`setBitacora(previas => …)`), así la función no
  necesita depender de `bitacora` y puede tener el array `[]` de dependencias.
- `.slice(0, 40)` acota la bitácora. Un registro que crece sin límite es una fuga
  de memoria con buena presentación.

### 5.3 Valor derivado, no estado

```jsx
const ciclosCompletados = Math.floor(segundosDeFoco / SEGUNDOS_POR_CICLO);
const segundosDelCicloActual = segundosDeFoco % SEGUNDOS_POR_CICLO;
```

Ni `useState` ni `useEffect`: se calcula en el render. Imposible que se
desincronice.

### 5.4 El cronómetro: efecto condicional `[enMarcha]` con limpieza

```jsx
useEffect(() => {
  if (!enMarcha) return;                     // salida temprana, nada que limpiar

  apuntar("⏱️ setInterval creado · efecto [enMarcha]", "efecto");
  const idIntervalo = setInterval(() => {
    setSegundosDeFoco((segundos) => segundos + 1);
  }, 1000);

  return () => {
    clearInterval(idIntervalo);
    apuntar("🧹 clearInterval · limpieza del efecto [enMarcha]", "limpieza");
  };
}, [enMarcha, apuntar, setSegundosDeFoco]);
```

Cuatro decisiones de diseño en un solo efecto:

1. **El intervalo vive en el Provider, no en el panel.** Es lo que hace que el
   tiempo siga corriendo cuando el panel del temporizador está desmontado. Si el
   `setInterval` estuviera en el panel, cambiar de pestaña lo cancelaría: la
   limpieza del efecto se ejecuta al desmontar. *El ciclo de vida de un efecto es
   el del componente que lo declara.*
2. **Forma funcional del `setState`.** Si el *callback* hiciera
   `setSegundosDeFoco(segundosDeFoco + 1)`, el efecto tendría que depender de
   `segundosDeFoco` → se destruiría y recrearía el intervalo **cada segundo**, y
   el valor capturado por el *closure* quedaría obsoleto (el clásico bug del
   contador que se queda en 1).
3. **Salida temprana sin limpieza.** Si no hay intervalo, no hay nada que
   cancelar. React acepta que un efecto no devuelva nada.
4. **Dependencias estables.** `enMarcha` es un booleano; `apuntar` está
   memorizado; `setSegundosDeFoco` viene de `useState` y React **garantiza** que
   su identidad no cambia. El efecto solo se re-ejecuta al darle al botón.

### 5.5 El efecto que demuestra para qué sirve el array

```jsx
useEffect(() => {
  if (ciclosCompletados === 0) return;
  apuntar(`🎉 Ciclo ${ciclosCompletados} completado`, "exito");
}, [ciclosCompletados, apuntar]);
```

Con el cronómetro en marcha, el Provider se re-renderiza **una vez por segundo**.
Este efecto se ejecuta **una vez cada 20 segundos**. Nada lo expresa mejor: el
array de dependencias no filtra renders, filtra **cambios de valor**.

> 🔎 **Nota honesta:** al recargar la página con 60 segundos guardados, este
> efecto apunta "Ciclo 3 completado" al montar. No es un bug: el efecto se
> ejecuta siempre en el montaje, y en esta sesión el valor acaba de pasar de
> "nada" a 3. Si quisieras evitarlo, guardarías el valor anterior en un `ref` y
> compararías.

### 5.6 El efecto que sincroniza con el DOM

```jsx
useEffect(() => {
  document.documentElement.classList.toggle("claro", tema === "claro");
}, [tema]);
```

El `<html>` está fuera del árbol de React. Tocarlo es un efecto secundario de
manual, y el tema se aplica con variables CSS (`:root` y `:root.claro`), así que
una sola clase cambia toda la paleta.

### 5.7 El valor del contexto va memorizado

```jsx
const valor = useMemo(() => ({ segundosDeFoco, /* … */ }), [segundosDeFoco, /* … */]);
return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
```

Sin `useMemo`, `value` sería un objeto nuevo en cada render; cualquier consumidor
que pusiera el valor del contexto en un array de dependencias re-ejecutaría sus
efectos siempre. (Con las dependencias actuales el objeto cambia casi en cada
render de todas formas, pero el patrón correcto es este, y evita sorpresas al
crecer la app.)

---

## Paso 6 – `useCicloDeVida`: hacer visible el montaje <a name="paso-6"></a>

Este hook es el **instrumento de medida** del laboratorio. Lo usan los tres
paneles: el caso de libro para un custom hook (misma lógica *con hooks* repetida
en varios componentes).

```js
export function useCicloDeVida(nombre) {
  const { apuntar, contarMontaje } = useSesion();

  // Nuevo en cada MONTAJE, estable entre re-renders
  const [idInstancia] = useState(() => Math.random().toString(36).slice(2, 7));

  const renders = useRef(0);
  const numeroDeRender = (renders.current += 1);

  useEffect(() => {
    apuntar(`🟢 MONTAJE de <${nombre}> · instancia ${idInstancia}`, "montaje");
    contarMontaje(nombre);
    return () => {
      apuntar(`🔴 DESMONTAJE de <${nombre}> · instancia ${idInstancia}`, "desmontaje");
    };
  }, [nombre, idInstancia, apuntar, contarMontaje]);

  return { idInstancia, renders: numeroDeRender };
}
```

### Por qué estos dos valores y no uno

Juntos permiten **diagnosticar sin ambigüedad** qué acaba de pasar:

| Observación | Diagnóstico |
|---|---|
| nº de render sube, instancia **igual** | re-render (misma instancia) |
| nº de render vuelve a 1, instancia **distinta** | re-montaje (instancia nueva) |

`idInstancia` usa el inicializador perezoso de `useState` porque debe calcularse
**una sola vez por instancia**. Si fuera `useState(Math.random()…)` sin función,
se calcularía en cada render (React lo descartaría, pero es trabajo inútil); si
fuera una variable normal del cuerpo, cambiaría en cada render y no serviría para
distinguir instancias.

`renders` usa `useRef` porque tiene que incrementarse **en cada render sin
provocar uno nuevo**. Con `useState` sería: render → `setState` → render →
`setState` → … Un `ref` es una caja mutable que React conserva entre renders y
que no está conectada al ciclo de renderizado.

### El array `[]` disfrazado

Las dependencias son `[nombre, idInstancia, apuntar, contarMontaje]`, pero las
cuatro son estables, así que **se comporta como un `[]`**: se ejecuta al montar y
limpia al desmontar. Se declaran de forma honesta (es lo que el efecto usa de
verdad) en lugar de mentirle al linter con un `[]` y un comentario de disculpa.

---

## Paso 7 – `App`: efecto incondicional, re-render y re-montaje <a name="paso-7"></a>

```jsx
function Laboratorio() {
  const [pestana, setPestana] = useState("temporizador");
  const [claveDeMontaje, setClaveDeMontaje] = useState(1);
  const [renderizadosForzados, setRenderizadosForzados] = useState(0);

  const renders = useRef(0);
  const numeroDeRender = (renders.current += 1);

  // ── Efecto INCONDICIONAL ──
  useEffect(() => {
    document.title = `🧪 EfectoLab · render #${numeroDeRender}`;
  });   // ← sin segundo argumento
  // …
}

export default function App() {
  return (
    <SesionProvider>
      <Laboratorio />
    </SesionProvider>
  );
}
```

### El efecto sin array de dependencias

Se ejecuta después de **cada** render. Para que sea seguro tiene que cumplir una
condición: **no puede provocar otro render**. Escribir en `document.title` es
perfecto, porque está fuera de React. Si en su lugar llamara a un `setState` o a
`apuntar()`, tendríamos render → efecto → `setState` → render → efecto → … y la
pestaña se cuelga.

### `App` y `Laboratorio` separados

El `Provider` solo alcanza a sus **hijos**. Si `App` montara el Provider y
llamara a `useSesion()`, recibiría `null`. De ahí los dos componentes.

### Los dos botones, que son el corazón del ejercicio

```jsx
<button onClick={() => setRenderizadosForzados((n) => n + 1)}>🔄 Forzar re-render</button>
<button onClick={() => setClaveDeMontaje((clave) => clave + 1)}>♻️ Forzar re-montaje</button>
```

- **Re-render:** `renderizadosForzados` no lo usa ningún panel, pero al cambiar un
  estado de `Laboratorio` **React vuelve a renderizar todo su subárbol**. Los
  paneles se re-renderizan: sube su nº de render, la instancia no cambia, el
  estado local se conserva.
- **Re-montaje:** `claveDeMontaje` se pasa como `key` al panel. Cambiar la `key`
  es decirle a React "este elemento ya no es el de antes": destruye la instancia
  (con su estado y ejecutando las limpiezas) y crea una nueva.

Y el cambio de pestaña con render condicional:

```jsx
{pestana === "temporizador" && <PanelTemporizador key={claveDeMontaje} />}
{pestana === "notas"        && <PanelNotas        key={claveDeMontaje} />}
{pestana === "estadisticas" && <PanelEstadisticas key={claveDeMontaje} />}
```

Cuando la condición es falsa el panel **no existe** en el árbol: se desmonta de
verdad. Es distinto de ocultarlo con CSS, donde seguiría vivo con todo su estado
y sus intervalos corriendo.

---

## Paso 8 – Los tres paneles <a name="paso-8"></a>

### 8.1 `PanelTemporizador` — la comparación lado a lado

```jsx
// Global: contexto + localStorage
const { segundosDeFoco, enMarcha, alternarMarcha } = useSesion();

// Local: se pierde en cada re-montaje
const [segundosMontado, setSegundosMontado] = useState(0);

useEffect(() => {
  const idIntervalo = setInterval(() => setSegundosMontado((s) => s + 1), 1000);
  return () => clearInterval(idIntervalo);
}, []);
```

Dos intervalos, dos sitios, dos destinos: uno muere con el panel y otro vive en
el Provider. Ver los dos números uno al lado del otro es lo que convierte el
concepto en algo evidente.

El efecto **incondicional** del panel escribe en el DOM a través de un `ref`:

```jsx
const selloRef = useRef(null);
useEffect(() => {
  if (!selloRef.current) return;
  selloRef.current.textContent =
    `efecto sin dependencias · render nº ${renders} · ${new Date().toLocaleTimeString("es-ES")}`;
});
```

Con el cronómetro corriendo, la marca de tiempo cambia cada segundo: prueba
visible de que se ejecuta en cada render, y sin tocar el estado (no hay bucle).
El `if (!selloRef.current) return;` recuerda que en el primer render el nodo del
DOM todavía no existe: `ref.current` se rellena **después** de pintar, justo antes
de ejecutar los efectos.

### 8.2 `PanelNotas` — el autoguardado con *debounce*

```jsx
const { borrador, setBorrador, apuntar } = useSesion();

// Arranca con el valor del contexto → al re-montar, el texto reaparece
const [texto, setTexto] = useState(borrador);
const [textoVolatil, setTextoVolatil] = useState("");   // el grupo de control

useEffect(() => {
  if (texto === borrador) return;             // ya está guardado

  const idTemporizador = setTimeout(() => {
    setBorrador(texto);                       // → se escribe en localStorage
    apuntar(`💾 Borrador autoguardado (${texto.length} caracteres)`, "guardado");
  }, RETARDO_AUTOGUARDADO);

  return () => clearTimeout(idTemporizador);  // cancela el guardado pendiente
}, [texto, borrador, setBorrador, apuntar]);
```

Cómo funciona, tecla a tecla:

1. Escribes `h` → render → el efecto programa un guardado para dentro de 600 ms.
2. Escribes `o` → **limpieza**: se cancela el `setTimeout` anterior → se programa
   uno nuevo.
3. … y así con cada tecla.
4. Dejas de escribir 600 ms → el `setTimeout` se dispara → se guarda **una vez**.

Es el patrón *debounce* implementado solo con `useEffect` y su limpieza. Sin ella,
cada pulsación dejaría un temporizador vivo y escribiríamos en `localStorage`
tantas veces como letras.

El `if (texto === borrador) return;` evita el ciclo: al guardar, `borrador` cambia
→ el efecto se vuelve a ejecutar → ahora son iguales → sale sin programar nada.

Y el **detalle revelador**: si cambias de pestaña antes de los 600 ms, la limpieza
del desmontaje cancela el guardado pendiente y pierdes las últimas letras. No es
un fallo de la implementación, es lo que significa "limpiar al desmontar". El
reto extra nº 2 propone arreglarlo guardando dentro de la propia limpieza.

El efecto de montaje del panel pone el foco:

```jsx
useEffect(() => { areaRef.current?.focus(); }, []);
```

Tocar el foco es manipular el DOM: no se puede hacer durante el render porque el
nodo aún no existe.

### 8.3 `PanelEstadisticas` — mirar el almacén de frente

```jsx
const [crudo, setCrudo] = useState(leerAlmacen);   // inicializador perezoso

function releerAlmacen() {
  setCrudo(leerAlmacen());
}
```

Aquí hay una lección que suele pasar desapercibida: **`localStorage` no es
reactivo**. No existe ningún mecanismo que avise a React de que ha cambiado. Por
eso esta vista se lee al montar y se refresca a mano con un botón; si fuera
mágicamente reactiva, el alumno no vería la diferencia entre "el estado de React"
y "lo que hay en el navegador".

El volcado muestra los valores **sin parsear**:

```
efectolab:segundos-de-foco = 134
efectolab:notas = [{"id":"8f…","texto":"probar la limpieza","hora":"12:04:31"}]
efectolab:borrador = "a medio escribir"
efectolab:tema = "claro"
```

Todo son strings, incluido `"claro"` con sus comillas: eso es `JSON.stringify` en
acción, y es la razón de `JSON.parse` al leer.

El panel también muestra los **montajes por panel** con una advertencia
importante: en desarrollo cuentan **el doble** por `StrictMode`. Antes que
esconderlo, se explica en pantalla.

Los dos botones de limpieza enseñan algo distinto cada uno:

```jsx
// Reiniciar: el estado vuelve a cero y los efectos REESCRIBEN las claves con los
// valores por defecto. Las claves siguen existiendo.
const reiniciarContadores = useCallback(() => { /* setters a su valor inicial */ }, [...]);

// Borrar de verdad: eliminar las claves y recargar. Si solo eliminásemos las
// claves, el efecto de guardado las recrearía al siguiente cambio de estado.
const borrarAlmacenYRecargar = useCallback(() => {
  Object.values(CLAVES).forEach((clave) => window.localStorage.removeItem(clave));
  window.location.reload();
}, []);
```

---

## Paso 9 – La bitácora <a name="paso-9"></a>

```jsx
const { bitacora, limpiarBitacora } = useSesion();
```

Un componente de solo lectura. Lo interesante es **dónde vive el array**: en el
Provider. De ahí que puedas ver el `🔴 DESMONTAJE de <PanelNotas>` **después** de
que `PanelNotas` haya dejado de existir. La entrada la escribió un componente
muerto, pero el array sobrevive porque no era suyo.

Las entradas se guardan con la más reciente primero y se colorean por tipo
(montaje, desmontaje, efecto, limpieza, guardado), de modo que el patrón
`🟢 MONTAJE → 🔴 DESMONTAJE → 🟢 MONTAJE` de `StrictMode` salta a la vista al
cargar la página.

---

## Por qué hay `eslint-disable` en la solución <a name="eslint"></a>

`eslint-plugin-react-hooks` v7 incluye reglas nuevas, basadas en el análisis del
React Compiler, que detectan dos cosas que la solución hace **a propósito**:

| Regla | Qué prohíbe | Por qué la saltamos aquí |
|---|---|---|
| `react-hooks/refs` | Leer o escribir `ref.current` durante el render | El contador de renders es **instrumentación de diagnóstico**, no un dato del que dependa la corrección de la UI. Es el idioma estándar para contar renders, y no hay otra forma de pintar el número en pantalla |
| `react-hooks/set-state-in-effect` | Llamar a un `setState` de forma síncrona dentro de un efecto | `apuntar()` escribe en la bitácora desde los efectos: es justamente lo que queremos observar. Las dependencias son estables, así que la cascada se detiene en un render extra |

Las dos reglas tienen razón y conviene conocerlas: son avisos de las dos causas
más frecuentes de renders en cascada y bucles infinitos. Lo que se aprende aquí es
que **saltarse una regla se hace de forma explícita, localizada y comentada**, no
desactivándola en el `eslint.config.js`.

La alternativa sin `disable` para la bitácora es sacar el registro del estado de
React y ponerlo en un *store* externo leído con `useSyncExternalStore`, como en
[`../ejemplo-rerender-y-remontaje/src/registro.js`](../ejemplo-rerender-y-remontaje/src/registro.js).
Es el reto extra nº 6.

---

## Mapa conceptual final <a name="mapa-final"></a>

```
<StrictMode>                       ← en dev: monta, desmonta y remonta (efectos ×2)
 └── App
      └── SesionProvider ─────────── NUNCA se desmonta → su estado sobrevive a todo
           │  [useEstadoPersistente] segundos · notas · borrador · tema   → localStorage
           │  [useState]             enMarcha · bitacora · montajes       → solo memoria
           │  [derivado]             ciclos = ⌊segundos / 20⌋
           │  [useEffect [enMarcha]]  setInterval global + clearInterval
           │  [useEffect [ciclos]]    apunta 1 vez cada 20 s (¡no cada segundo!)
           │  [useEffect [tema]]      clase en <html>
           │  [useCallback]           apuntar · contarMontaje (identidad estable)
           │
           └── Laboratorio
                ├── [useRef]            nº de render de App
                ├── [useEffect sin []]  document.title   ← incondicional, sin setState
                ├── [useState]          pestana · claveDeMontaje · renderizadosForzados
                │
                ├── Cabecera             [useContext] tiempo, ciclos, tema
                ├── BarraDePestanas      cambia de pestaña → DESMONTA el panel anterior
                │
                ├── PanelTemporizador  key={claveDeMontaje}
                │    ├── useCicloDeVida  [useEffect []] MONTAJE/DESMONTAJE
                │    ├── [useState]      segundosMontado  ← se pierde al re-montar
                │    ├── [useEffect []]  setInterval local + clearInterval
                │    └── [useEffect sin []] sello en el DOM vía ref
                │
                ├── PanelNotas         key={claveDeMontaje}
                │    ├── useCicloDeVida
                │    ├── [useState]      texto (inicializado desde el contexto)
                │    ├── [useState]      textoVolatil ← grupo de control
                │    ├── [useEffect []]  foco en el textarea
                │    └── [useEffect [texto]] debounce + clearTimeout en la limpieza
                │
                ├── PanelEstadisticas  key={claveDeMontaje}
                │    ├── useCicloDeVida
                │    └── [useState perezoso] volcado de localStorage (no es reactivo)
                │
                └── Bitacora             [useContext] registro que sobrevive a los paneles
```

---

## Respuestas al guion de laboratorio <a name="respuestas"></a>

1. **Forzar re-render:** el nº de render sube, la instancia **no** cambia y el
   contador local **no** se reinicia. Cambiar el estado de `Laboratorio`
   re-renderiza su subárbol, pero no destruye nada.
2. **Forzar re-montaje:** cambian la `key`, el id de instancia y el nº de render
   (vuelve a 1), y el contador local vuelve a `00:00`. El tiempo total no se
   pierde porque no es del panel: es del Provider, que no se ha tocado.
3. **Irse a Notas 10 s:** el tiempo total ha avanzado 10 segundos; el de la
   instancia está en `00:00`. El intervalo global vive en el Provider (sigue), el
   local vivía en el panel (se canceló en la limpieza del desmontaje).
4. **Los dos borradores:** sobrevive el persistente. Sin esperar los 600 ms, la
   limpieza del efecto cancela el `setTimeout` y las últimas letras no se guardan.
5. **F5:** sobreviven segundos de foco, notas, borrador y tema (están en
   `localStorage`). Se pierden la bitácora, los montajes y `enMarcha`, que son
   `useState` del Provider: una recarga destruye **toda** la aplicación, contextos
   incluidos. El contexto protege del desmontaje de un hijo, no de una recarga.
6. **MONTAJE duplicado:** `StrictMode` monta, desmonta y vuelve a montar en
   desarrollo para delatar efectos sin limpieza. Sin `StrictMode` verías un solo
   montaje… y también se te escaparían los intervalos sin cancelar.
7. **Dos pestañas:** la otra pestaña se actualiza sola gracias al efecto que
   escucha el evento `storage`. La pestaña que escribe no recibe el evento.
8. **DevTools:** todos los valores son **strings**; los objetos y arrays están
   serializados como JSON. Por eso al leer hace falta `JSON.parse`, y por eso un
   JSON corrupto hay que capturarlo con `try/catch`.
9. **Un apunte cada 20 s:** el array `[ciclosCompletados]` no filtra renders,
   filtra **cambios de valor**. `Math.floor(segundos / 20)` solo cambia una vez
   cada 20 segundos.
10. **Almacén vacío:** `getItem` devuelve `null`, el hook detecta ese caso y usa
    el `valorInicial` que le pasó el Provider (`0`, `[]`, `""`, `"oscuro"`).

---

## Errores comunes <a name="errores-comunes"></a>

| Síntoma | Causa | Solución |
|---|---|---|
| La pestaña se cuelga al cargar | `setState` (o `apuntar()`) dentro de un efecto **sin** array de dependencias | El efecto incondicional solo puede tocar cosas externas a React (`document.title`, el DOM vía `ref`) |
| Un efecto `[]` se ejecuta en cada render | Una función o un objeto en las dependencias que se recrea cada render | `useCallback` / `useMemo`, o guardarlo en un `ref` |
| El cronómetro va más rápido tras cambiar de pestaña | Falta el `clearInterval` en la limpieza: se acumulan intervalos | `return () => clearInterval(id)` |
| El contador se queda en 1 | El `setInterval` captura el valor del *closure*: `setX(x + 1)` con `x` obsoleto | Forma funcional: `setX((x) => x + 1)` |
| El valor guardado aparece un instante después (parpadeo) | Hidratación en un `useEffect([])` en lugar del inicializador perezoso | `useState(() => leer(clave))` |
| `localStorage` se llena de `[object Object]` | Se guardó sin serializar | `JSON.stringify` al guardar, `JSON.parse` al leer |
| `SyntaxError: Unexpected token o in JSON` | Se parsea algo que no es JSON (o se cambió el formato de los datos) | `try/catch` y devolver el valor por defecto |
| Cambiar de pestaña borra el estado y no debería | El estado está declarado en el panel, que se desmonta | Súbelo al Provider (*lifting state up*) |
| `useContext` devuelve `null` | El componente está fuera del `Provider`, o es el propio componente que lo provee | Envuelve el árbol; separa `App` (Provider) de `Laboratorio` (consumidor) |
| Todo se pierde al recargar aunque haya contexto | Un contexto es memoria del proceso: muere con la página | Añade `localStorage` al Provider |
| Los montajes se cuentan de dos en dos | `StrictMode` en desarrollo | Comportamiento esperado; en producción cuenta una vez |
| El panel se oculta pero su intervalo sigue corriendo | Se ocultó con CSS en vez de desmontarlo | Render condicional (`{condicion && <Panel />}`) |

---

## Para ejecutar la solución <a name="ejecutar"></a>

```bash
cd solucion
npm install
npm run dev
```

Arranca en `http://localhost:5173`. Recorrido recomendado para una demostración
en clase, de tres minutos:

1. **Mira la bitácora al cargar**: montajes duplicados → `StrictMode`.
2. **Arranca el cronómetro** y observa el título de la pestaña del navegador
   cambiando de número → efecto incondicional.
3. **Pulsa 🔄 Forzar re-render**: sube el nº de render, la instancia no cambia.
4. **Pulsa ♻️ Forzar re-montaje**: instancia nueva, nº de render a 1, contador
   local a cero… y el tiempo total intacto → el contexto por encima sobrevive.
5. **Vete a Notas 10 segundos y vuelve**: el tiempo total ha seguido subiendo
   (intervalo en el Provider), el de la instancia está a cero (intervalo en el
   panel, cancelado al desmontar).
6. **Escribe en los dos borradores**, espera un segundo, cambia de pestaña y
   vuelve: solo sobrevive el persistido.
7. **Pulsa F5**: sobreviven tiempo, notas, borrador y tema; desaparecen la
   bitácora y el estado de marcha.
8. **Abre una segunda pestaña** y guarda una nota: la primera se actualiza sola →
   evento `storage`.
