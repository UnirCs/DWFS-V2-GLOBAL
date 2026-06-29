# Preguntas adicionales de repaso — Desarrollo Web Full Stack

14 preguntas auto-contenidas (sin dependencia del enunciado de UnirEats) para practicar antes del examen.
Cada pregunta incluye una sección colapsable con la respuesta correcta, su justificación y el análisis de las opciones incorrectas.

---

## Pregunta 1 — JavaScript (event loop: setTimeout vs Promesas)

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

new Promise((resolve) => {
  console.log("D");
  resolve();
}).then(() => console.log("E"));

console.log("F");
```

¿Qué secuencia de letras se imprime por consola?

A) `A, B, C, D, E, F`  
B) `A, D, F, C, E, B`  
C) `A, D, F, E, C, B`  
D) `A, D, C, E, F, B`

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B) `A, D, F, C, E, B`**

Análisis paso a paso:

1. `console.log("A")` → código síncrono. Imprime `A`.
2. `setTimeout(..., 0)` → registra la callback en la cola de *macrotareas* (timers), no se ejecuta aún.
3. `Promise.resolve().then(...)` → registra la callback en la cola de *microtareas*.
4. `new Promise((resolve) => { ... })` → el *executor* de la promesa se ejecuta **síncronamente** inmediatamente, por lo que imprime `D` y resuelve. El `.then` registra la callback en la cola de *microtareas*.
5. `console.log("F")` → código síncrono. Imprime `F`.
6. La pila de llamadas (call stack) queda vacía. El event loop revisa primero las *microtareas* antes de las *macrotareas*:
   - Ejecuta la primera microtarea: imprime `C`.
   - Ejecuta la segunda microtarea: imprime `E`.
7. Finalmente, cuando no quedan microtareas, el event loop saca la macrotarea del `setTimeout`: imprime `B`.

**Opciones incorrectas:**
- **A) `A, B, C, D, E, F`** → Coloca `B` antes que el código síncrono y las promesas, ignorando que los timers siempre van a la cola de macrotareas y se ejecutan al final.
- **C) `A, D, F, E, C, B`** → Invierte el orden de resolución de las microtareas. Las microtareas se procesan en orden FIFO; `C` fue registrado antes que `E`, por lo que `C` se ejecuta primero.
- **D) `A, D, C, E, F, B`** → Coloca `C` y `E` antes que `F`, ignorando que los `.then` se ejecutan **después** de que la pila de llamadas quede vacía, es decir, tras todo el código síncrono.
</details>

---

## Pregunta 2 — JavaScript (destructuring y valores por defecto)

```js
const config = { timeout: 5000 };
const { timeout, retries = 3, host = "localhost" } = config;
console.log(timeout, retries, host);
```

¿Qué se imprime?

A) `undefined 3 localhost`  
B) `5000 3 localhost`  
C) `5000 undefined localhost`  
D) `5000 3 undefined`

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B) `5000 3 localhost`**

El destructuring extrae `timeout` del objeto (`5000`). Como `retries` y `host` no existen en el objeto, se aplican los valores por defecto (`3` y `"localhost"`).

**Opciones incorrectas:**
- **A)** → `timeout` sí existe en el objeto, por lo que no es `undefined`.
- **C)** → `retries` tiene valor por defecto `3`, no `undefined`.
- **D)** → `host` tiene valor por defecto `"localhost"`.
</details>

---

## Pregunta 3 — React (listas y `key`)

```jsx
function ItemList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li>{item.name}</li>
      ))}
    </ul>
  );
}
```

¿Qué problema presenta este componente?

A) React lanzará un error en tiempo de ejecución.  
B) No hay problema; React asigna `key` automáticamente por índice.  
C) Puede causar errores de reconciliación y pérdida de estado si la lista se reordena o muta.  
D) El componente no se renderizará porque falta la prop obligatoria `key`.

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: C**

Sin `key`, React usa el índice por defecto como clave. Si la lista se reordena, React reutiliza los nodos DOM en posiciones incorrectas, pudiendo perder el estado interno de elementos interactivos (inputs, checkboxes) o provocar renders innecesarios. Además, React muestra una advertencia en consola.

**Opciones incorrectas:**
- **A)** → No lanza un error fatal; solo muestra una advertencia en desarrollo.
- **B)** → Aunque React *sí* usa el índice como fallback, no es seguro y no significa que "no haya problema".
- **D)** → `key` no es una prop que se pase al componente; es un atributo interno de React para la reconciliación. El componente sí se renderiza.
</details>

---

## Pregunta 4 — React (`useEffect` y arrays de dependencias)

```jsx
function Tracker({ userId }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("EFFECT A: mount");
  }, []);

  useEffect(() => {
    console.log("EFFECT B: userId changed", userId);
  }, [userId]);

  useEffect(() => {
    console.log("EFFECT C: count or userId changed", count, userId);
  }, [count, userId]);

  useEffect(() => {
    console.log("EFFECT D: every render");
  });

  return (
    <div>
      <p>{userId} — {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

El componente se monta con `userId="u1"`. El usuario pulsa el botón una vez. Luego, el padre cambia la prop a `userId="u2"`. ¿Qué secuencia completa de logs se imprime?

A) `EFFECT A: mount`, `EFFECT B: userId changed u1`, `EFFECT C: 0 u1`, `EFFECT D: every render`, luego al pulsar `EFFECT D`, luego al cambiar `EFFECT B`, `EFFECT C`, `EFFECT D`

B) `EFFECT A: mount`, `EFFECT B: userId changed u1`, `EFFECT C: 0 u1`, `EFFECT D: every render`, luego al pulsar `EFFECT C: 1 u1`, `EFFECT D`, luego al cambiar `EFFECT B`, `EFFECT C`, `EFFECT D`

C) `EFFECT A: mount`, `EFFECT B`, `EFFECT C`, `EFFECT D`, luego al pulsar `EFFECT C`, `EFFECT D`, luego al cambiar `EFFECT B`, `EFFECT C`, `EFFECT D`

D) `EFFECT A: mount`, `EFFECT B`, `EFFECT C`, `EFFECT D`, luego al pulsar `EFFECT D` solo, luego al cambiar `EFFECT B`, `EFFECT C`, `EFFECT D`

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: C**

Análisis paso a paso:

**1. Montaje con `userId="u1"`:**
- React ejecuta los efectos en el orden en que aparecen en el componente.
- `EFFECT A: mount` (sin dependencias, solo en montaje).
- `EFFECT B: userId changed u1` (dependencia `userId` cambió de `undefined` a `"u1"`).
- `EFFECT C: 0 u1` (dependencias `count` y `userId` cambiaron).
- `EFFECT D: every render` (sin array de dependencias, se ejecuta tras **cada** render incluyendo el montaje).

**2. El usuario pulsa el botón (`setCount` incrementa a 1):**
- `EFFECT A` → `[]` no incluye `count`, no se ejecuta.
- `EFFECT B` → `[userId]` no cambió, no se ejecuta.
- `EFFECT C` → `[count, userId]`: `count` cambió (0 → 1), se ejecuta: `EFFECT C: 1 u1`.
- `EFFECT D` → sin array, se ejecuta siempre: `EFFECT D`.

**3. El padre cambia `userId` a `"u2"`:**
- `EFFECT A` → `[]`, no incluye `userId`, no se ejecuta.
- `EFFECT B` → `[userId]` cambió (`u1` → `u2`), se ejecuta.
- `EFFECT C` → `[count, userId]`: `userId` cambió, se ejecuta.
- `EFFECT D` → sin array, se ejecuta siempre.

**Opciones incorrectas:**
- **A)** → Tras pulsar el botón solo imprime `EFFECT D`, ignorando que `EFFECT C` también se ejecuta porque `count` cambió.
- **B)** → Correcta hasta el segundo paso, pero luego inventa que `EFFECT A` se ejecuta al cambiar `userId`; `EFFECT A` tiene `[]` así que solo corre en el montaje inicial.
- **D)** → Tras pulsar el botón solo imprime `EFFECT D`, ignorando que `EFFECT C` se ejecuta al cambiar `count`.
</details>

---

## Pregunta 5 — React (lifting state up)

Dos componentes hermanos (`<Filter />` y `<Results />`) necesitan compartir un término de búsqueda. ¿Cuál es el patrón recomendado en React?

A) Usar un contexto global para cualquier estado compartido entre hermanos.  
B) Elevar el estado al padre común más cercano y pasarlo como props a ambos.  
C) Crear una variable global fuera del árbol de componentes.  
D) Usar `useImperativeHandle` para exponer el estado de uno al otro.

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B**

El patrón "lifting state up" consiste en mover el estado al ancestro común más cercano. El padre controla el estado y lo distribuye como props. Es la solución más simple y declarativa para hermanos.

**Opciones incorrectas:**
- **A)** → Contexto está pensado para evitar *prop drilling* en árboles profundos, no para dos hermanos. Introduce complejidad innecesaria.
- **C)** → Variables globales rompen el flujo de datos unidireccional de React y hacen el comportamiento impredecible.
- **D)** → `useImperativeHandle` expone métodos imperativos de un componente hijo al padre, no para compartir estado entre hermanos.
</details>

---

## Pregunta 6 — REST API (`PATCH` vs `PUT`)

Un endpoint expone `PATCH /api/v1/users/me`. El cliente envía:

```json
{ "phone": "+34600123456" }
```

¿Cuál es la semántica esperada de `PATCH` en este caso?

A) Reemplaza todo el recurso usuario, dejando solo el campo `phone`.  
B) Actualiza únicamente el campo `phone` del recurso existente.  
C) Crea un nuevo usuario con solo el campo `phone`.  
D) Es equivalente a `PUT` pero con validaciones menos estrictas.

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B**

`PATCH` realiza una modificación parcial del recurso. Solo se actualizan los campos presentes en el payload, sin alterar el resto del documento.

**Opciones incorrectas:**
- **A)** → Eso corresponde a `PUT` sin merge, no a `PATCH`.
- **C)** → `PATCH` no crea recursos; para crear se usa `POST`.
- **D)** → `PATCH` y `PUT` tienen semánticas diferentes según RFC 5789; no es solo una cuestión de validaciones.
</details>

---

## Pregunta 7 — HTTP (códigos de estado)

Un cliente envía una petición con sintaxis JSON correcta, pero el campo `email` no tiene formato válido. ¿Qué código HTTP es más adecuado?

A) `400 Bad Request`  
B) `401 Unauthorized`  
C) `409 Conflict`  
D) `422 Unprocessable Entity`

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: D**

`422 Unprocessable Entity` (WebDAV, usado extensamente en APIs REST) indica que la sintaxis de la petición es correcta, pero la semántica de los datos (reglas de negocio o validación) falla. Es más preciso que 400 cuando el parseo fue exitoso pero los datos son inválidos.

**Opciones incorrectas:**
- **A)** → `400` es válido, pero menos específico; habitualmente indica error de sintaxis en la petición.
- **B)** → `401` indica falta de credenciales de autenticación, no errores de validación.
- **C)** → `409` indica conflicto con el estado actual del recurso (p. ej., duplicado), no formato inválido.
</details>

---

## Pregunta 8 — Spring Boot (configuración)

¿Cuál es la ventaja principal de `@ConfigurationProperties` sobre `@Value` para propiedades complejas?

A) Permite inyectar propiedades anidadas y validarlas con Bean Validation (JSR-303), mientras que `@Value` es para valores simples.  
B) `@Value` no soporta propiedades definidas en `application.yml`.  
C) `@ConfigurationProperties` recarga la configuración en caliente sin reiniciar la aplicación.  
D) `@Value` es más seguro porque no expone las propiedades en el contexto de Spring.

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: A**

`@ConfigurationProperties` mapea objetos Java directamente desde la jerarquía del YAML/Properties, soportando listas, mapas y validación con `@NotNull`, `@Min`, etc. `@Value` evalúa expresiones SpEL y es ideal para valores escalares.

**Opciones incorrectas:**
- **B)** → `@Value` sí lee de `application.yml` sin problema.
- **C)** → Spring Boot no recarga `@ConfigurationProperties` en caliente por defecto; requiere Spring Cloud Config u otra solución.
- **D)** → Ambos inyectan valores del entorno; la seguridad depende de cómo se gestionen los secrets, no de la anotación.
</details>

---

## Pregunta 9 — Microservicios (Database per Service)

¿Por qué el patrón Database-per-Service recomienda que cada microservicio tenga su propia base de datos?

A) Para reducir el número total de conexiones al cluster de bases de datos.  
B) Para garantizar el desacoplamiento y permitir que cada servicio evolucione su esquema independientemente.  
C) Porque PostgreSQL no soporta múltiples esquemas dentro de una misma instancia.  
D) Para evitar costes de licenciamiento de bases de datos adicionales.

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B**

El patrón busca acotar el *bounded context* de cada servicio. Si varios servicios comparten una misma base de datos, un cambio en el esquema puede romper a otros equipos, creando un acoplamiento fuerte.

**Opciones incorrectas:**
- **A)** → Tener múltiples bases de datos suele aumentar, no reducir, el número total de conexiones.
- **C)** → PostgreSQL sí soporta múltiples esquemas; el patrón no es por limitación técnica.
- **D)** → El patrón no tiene como objetivo reducir costes; de hecho, puede aumentarlos al requerir más instancias o clusters.
</details>

---

## Pregunta 10 — RabbitMQ (orden de mensajes)

¿Cómo garantiza RabbitMQ el orden de entrega de mensajes dentro de una cola?

A) No garantiza orden; los mensajes se entregan en orden aleatorio.  
B) Garantiza orden FIFO solo si hay un único consumidor y no hay reenvíos por fallo.  
C) Garantiza orden estricto siempre, incluso con múltiples consumidores paralelos.  
D) El orden se define mediante la cabecera `x-priority` en cada mensaje.

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B**

RabbitMQ mantiene orden FIFO en la cola, pero si hay múltiples consumidores o si un mensaje es reenviado por `nack`/`reject`/`timeout`, el orden de procesamiento observable puede romperse.

**Opciones incorrectas:**
- **A)** → Sí mantiene orden interno en la cola.
- **C)** → Múltiples consumidores procesan mensajes concurrentemente; el orden de finalización no está garantizado.
- **D)** → `x-priority` define la prioridad de entrega sobre otros mensajes, no el orden absoluto.
</details>

---

## Pregunta 11 — OpenSearch (dynamic mapping)

Se indexa un documento con un campo nuevo `price` cuyo valor es `"19.99"` (string). ¿Qué tipo de mapping asignará OpenSearch por defecto?

A) `float`  
B) `keyword`  
C) `text`  
D) `integer`

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: C)**

OpenSearch, al detectar un string en un campo desconocido, lo mapea por defecto como `text` (con un subcampo `keyword`). No infiere tipos numéricos a partir de strings.

**Opciones incorrectas:**
- **A)** / **D)** → Requieren que el JSON contenga un número literal (`19.99`), no un string.
- **B)** → `keyword` es el subcampo por defecto dentro de `text`, pero el campo principal es `text`.
</details>

---

## Pregunta 12 — Spring Cloud (Eureka: instancias registradas)

En un ecosistema Spring Cloud se tienen desplegados:
- 3 instancias de un microservicio (`order-service`)
- 1 instancia de otro microservicio (`payment-service`)
- 2 instancias de otro microservicio (`inventory-service`)
- 1 servidor Eureka
- 1 API Gateway

Todos los microservicios de negocio y el Gateway se registran en Eureka. ¿Cuántas instancias tiene registradas Eureka en total?

A) 5  
B) 6  
C) 7  
D) 8

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: C) 7**

Se deben contar todas las instancias que se registran como clientes en Eureka:
- `order-service`: 3 instancias
- `payment-service`: 1 instancia
- `inventory-service`: 2 instancias
- `gateway`: 1 instancia

Total: 3 + 1 + 2 + 1 = **7 instancias**.

El servidor Eureka propiamente dicho actúa como registro; si no se configura como cliente de sí mismo, no se cuenta como instancia registrada adicional.

**Opciones incorrectas:**
- **A)** → Suma mal los microservicios de negocio (3+1+2 = 6, no 5).
- **B)** → Suma solo los microservicios de negocio (6), pero olvida que el Gateway también se registra en Eureka.
- **D)** → Incluye al servidor Eureka como si fuera una instancia registrada, lo cual no es correcto por defecto.
</details>

---

## Pregunta 13 — Spring Cloud (Eureka: aplicaciones registradas)

En el mismo escenario del ecosistema Spring Cloud (3 instancias de `order-service`, 1 de `payment-service`, 2 de `inventory-service`, 1 Gateway, 1 servidor Eureka).

¿Cuántas aplicaciones (nombres de servicio distintos) tiene registradas Eureka en total?

A) 3  
B) 4  
C) 5  
D) 6

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B) 4**

En Eureka, una "aplicación" es un nombre de servicio distinto (`spring.application.name`), independientemente de cuántas instancias tenga desplegadas:
- `order-service`
- `payment-service`
- `inventory-service`
- `gateway`

Total: **4 aplicaciones**.

**Opciones incorrectas:**
- **A)** → Cuenta solo los microservicios de negocio (3), omitiendo el Gateway.
- **C)** → Suma erróneamente el servidor Eureka como una aplicación más.
- **D)** → Confunde aplicaciones con instancias (3+1+2+1 = 7 instancias, no aplicaciones).
</details>

---

## Pregunta 14 — Spring Cloud Gateway (tabla de aplicaciones)

En el mismo escenario del ecosistema Spring Cloud (3 instancias de `order-service`, 1 de `payment-service`, 2 de `inventory-service`, 1 Gateway, 1 servidor Eureka).

El Gateway descubre automáticamente las rutas a través de Eureka. ¿Cuántas entradas de servicios de negocio tendría la tabla de aplicaciones del Gateway?

A) 3  
B) 4  
C) 6  
D) 7

<details>
<summary>Ver respuesta y explicación</summary>

**Respuesta correcta: B) 4**

El Gateway descubre y genera rutas para todas las aplicaciones registradas en Eureka, incluyendo su propio registro. Las aplicaciones en la tabla de enrutamiento son:
- `order-service`
- `payment-service`
- `inventory-service`
- `gateway`

Total: **4 entradas**.

**Opciones incorrectas:**
- **A)** → Excluye al Gateway de su propia tabla, pero al estar registrado en Eureka también aparece como entrada enrutable.
- **C)** → Confunde entradas con el total de instancias de negocio (3+1+2 = 6).
- **D)** → Confunde entradas con el total de instancias registradas en Eureka (7).
</details>

---
