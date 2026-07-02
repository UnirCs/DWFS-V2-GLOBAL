# Preguntas de Examen - WebSocket

## Pregunta 1: WebSocket vs Webhook

**Un equipo de desarrollo necesita que su backend notifique a múltiples clientes web sobre cambios en tiempo real en el precio de un producto. ¿Qué tecnología o patrón es más adecuado para este requisito?**

**Opciones:**

- a) WebSocket, porque mantiene un canal de comunicación bidireccional y persistente entre cliente y servidor.
- b) Webhook, porque el servidor puede enviar notificaciones unidireccionales a una URL preconfigurada del cliente tan pronto ocurre el cambio.
- c) WebSocket, porque solo requiere HTTP y no necesita mantener conexiones abiertas.
- d) Webhook, porque permite al cliente recibir actualizaciones sin necesidad de exponer una URL pública.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: a) WebSocket, porque mantiene un canal de comunicación bidireccional y persistente entre cliente y servidor.**

**Explicación:**

La clave del enunciado es **"múltiples clientes web"** que necesitan recibir cambios **en tiempo real**. Los WebSockets están diseñados exactamente para este escenario: abren una conexión TCP persistente (iniciada mediante un handshake HTTP) que permite al servidor enviar datos a los clientes en cualquier momento sin que estos tengan que solicitarlos.

| Característica | WebSocket | Webhook |
|----------------|-----------|---------|
| Dirección de la comunicación | **Bidireccional** | **Unidireccional** (servidor → cliente) |
| Tipo de conexión | **Persistente** (una sola conexión) | **Puntual** (una petición HTTP por evento) |
| Requisito del cliente | Conectarse al servidor | **Exponer una URL pública** para recibir callbacks |
| Caso de uso ideal | Tiempo real, streaming, chat, tickers de precios | Notificaciones puntuales entre servidores (p. ej., pasarela de pagos → mi API) |

**Análisis de cada opción:**

- **a) WebSocket** → ✅ Correcto. El escenario describe "múltiples clientes web" (navegadores) que necesitan recibir datos en tiempo real. WebSocket es la tecnología estándar para esto.

- **b) Webhook** → ❌ Incorrecto. Aunque los webhooks envían notificaciones unidireccionales, están pensados para que un **servidor** notifique a otro **servidor** mediante una URL pública. Un navegador web no puede exponer fácilmente una URL pública para recibir webhooks.

- **c) WebSocket** → ❌ Incorrecto como justificación. WebSocket **sí** necesita mantener una conexión abierta (eso es precisamente su ventaja). Además, aunque el handshake inicial usa HTTP, la comunicación posterior se realiza sobre el protocolo WebSocket (`ws://` o `wss://`), no sobre HTTP convencional.

- **d) Webhook** → ❌ Incorrecto. Es exactamente al revés: el webhook requiere que el cliente (quien recibe) **exponga una URL pública** para que el servidor pueda enviarle la notificación. Los WebSockets no requieren que el cliente exponga nada; es el cliente quien inicia la conexión hacia el servidor.

> 💡 **Regla práctica:**
> - ¿Necesitas **tiempo real** con clientes (navegadores, apps) que se conectan a un servidor? → **WebSocket**.
> - ¿Necesitas que un **servicio externo** te avise de eventos en tu backend? → **Webhook**.

</details>

---

## Pregunta 2: Escenarios de uso de WebSocket

**¿Cuál de los siguientes escenarios es el más adecuado para utilizar WebSocket?**

**Opciones:**

- a) Un servicio de procesamiento de pagos que necesita confirmar una transacción a un comercio horas después de que el usuario abandonó la página.
- b) Una aplicación de chat en la que los mensajes deben aparecer instantáneamente en la pantalla del destinatario sin que este refresque el navegador.
- c) Un sistema de generación de informes mensuales que envía un correo electrónico al usuario cuando el PDF está listo.
- d) Una API REST que expone un catálogo de productos con operaciones CRUD estándar.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) Una aplicación de chat en la que los mensajes deben aparecer instantáneamente en la pantalla del destinatario sin que este refresque el navegador.**

**Explicación:**

WebSocket brilla en escenarios que requieren **baja latencia**, **comunicación bidireccional continua** y **actualizaciones en tiempo real** mientras el usuario permanece en la página.

**Análisis de cada opción:**

- **a) Procesamiento de pagos con confirmación diferida** → ❌ Incorrecto. Si el usuario ya abandonó la página, no hay conexión WebSocket activa. Este escenario es ideal para **webhooks** (el servicio de pagos llama a una URL del comercio) o para que el comercio consulte el estado vía polling/REST más tarde.

- **b) Aplicación de chat** → ✅ Correcto. El chat es el caso de uso paradigmático de WebSocket: el servidor necesita "empujar" mensajes al cliente en el instante en que llegan, y el cliente necesita enviar mensajes al servidor sin reconstruir una conexión HTTP en cada mensaje.

- **c) Generación de informes mensuales** → ❌ Incorrecto. Se trata de un proceso **asíncrono y diferido**; no requiere que el usuario esté conectado en tiempo real. Un email, una notificación push o un webhook son mucho más apropiados. WebSocket aportaría complejidad innecesaria.

- **d) API REST de catálogo de productos** → ❌ Incorrecto. Las operaciones CRUD sin requisitos de tiempo real se implementan perfectamente con HTTP/REST. Usar WebSocket aquí no aportaría ventaja alguna; al contrario, complicaría el diseño (manejo de frames, ausencia de verbos HTTP, necesidad de reimplementar semántica de errores).

> 💡 **Cuándo usar WebSocket:**
> - Chat, notificaciones en vivo, colaboración en tiempo real (Google Docs), juegos online, dashboards con métricas en streaming, tickers de bolsa.
> - **No** usarlo para: descargas puntuales de archivos, procesos batch, notificaciones offline, o APIs CRUD sin requisito de tiempo real.

</details>

---

## Pregunta 3: Tramas (frames) en WebSocket

**En una conexión WebSocket, ¿qué tipos de trama (frame) pueden intercambiarse el cliente y el servidor tras completarse el handshake?**

**Opciones:**

- a) Solo tramas de texto (`text frame`) y tramas de datos binarios (`binary frame`).
- b) Tramas de texto, tramas binarias, tramas de cierre (`close frame`) y tramas de ping/pong.
- c) Tramas de texto, tramas binarias, y tramas de error HTTP (`HTTP error frame`).
- d) Tramas de texto, tramas binarias, y tramas de reconexión automática (`reconnect frame`).

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) Tramas de texto, tramas binarias, tramas de cierre (`close frame`) y tramas de ping/pong.**

**Explicación:**

El protocolo WebSocket (RFC 6455) define un conjunto específico de tramas (frames) que se intercambian sobre la conexión persistente una vez establecida.

| Tipo de trama | Opcode | Propósito |
|---------------|--------|-----------|
| **Continuación** | `0x0` | Continuación de un mensaje fragmentado |
| **Texto** | `0x1` | Transmite datos en formato UTF-8 |
| **Binario** | `0x2` | Transmite datos binarios opacos (blobs, imágenes, etc.) |
| **Cierre** | `0x8` | Inicia el cierre ordenado de la conexión (puede incluir código y razón) |
| **Ping** | `0x9` | Enviado por cualquiera de los dos extremos para verificar que la conexión sigue viva |
| **Pong** | `0xA` | Respuesta obligatoria a un ping; también puede enviarse espontáneamente |

**Análisis de cada opción:**

- **a)** → ❌ Incorrecto. Omite las tramas de control (`close`, `ping`, `pong`) que son parte esencial del protocolo para gestionar la vida útil de la conexión.

- **b)** → ✅ Correcto. Incluye los dos tipos de trama de datos (texto y binario) y los dos tipos de trama de control fundamentales: `close` para cerrar la conexión de forma ordenada, y `ping/pong` para mantener vivo el canal (keepalive) y detectar conexiones zombis.

- **c)** → ❌ Incorrecto. No existe una "trama de error HTTP" en el protocolo WebSocket. Una vez el handshake HTTP 101 (Switching Protocols) se completa, la comunicación ya no usa HTTP. Los errores de aplicación se gestionan enviando mensajes de texto/binario con un formato acordado (JSON de error, por ejemplo), no mediante frames nativos del protocolo.

- **d)** → ❌ Incorrecto. No existe una "trama de reconexión automática" en el RFC 6455. La reconexión es una responsabilidad de la **aplicación** (o de la librería cliente como Socket.IO), no del protocolo WebSocket en sí. El protocolo nativo no tiene un opcode para reconectar; si la conexión se cae, hay que iniciar un nuevo handshake HTTP.

> 💡 **Nota:** Las tramas de **ping/pong** son transparentes para la aplicación en la mayoría de navegadores (el navegador responde automáticamente a los pings del servidor), pero son vitales para evitar que proxies o firewalls cierren conexiones inactivas por timeout.

</details>

---

## Pregunta 4: Handshake y estado de la conexión

**Observa el siguiente flujo de comunicación entre un cliente y un servidor. ¿Qué secuencia describe correctamente el establecimiento de una conexión WebSocket válida?**

| Paso | Cliente | Servidor |
|------|---------|----------|
| 1 | `GET /chat HTTP/1.1` | |
| 2 | `Upgrade: websocket` | |
| 3 | `Connection: Upgrade` | |
| 4 | `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==` | |
| 5 | | `HTTP/1.1 101 Switching Protocols` |
| 6 | | `Upgrade: websocket` |
| 7 | | `Connection: Upgrade` |
| 8 | | `Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=` |

**Opciones:**

- a) La secuencia es válida, pero la cabecera `Sec-WebSocket-Accept` del servidor es un valor aleatorio sin relación con la petición.
- b) La secuencia es válida; tras el paso 8, la conexión TCP subyacente se reutiliza para el protocolo WebSocket.
- c) La secuencia es inválida porque falta la cabecera `Sec-WebSocket-Version` en la petición del cliente.
- d) La secuencia es inválida porque el servidor debería responder con `200 OK` en lugar de `101 Switching Protocols`.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) La secuencia es válida; tras el paso 8, la conexión TCP subyacente se reutiliza para el protocolo WebSocket.**

**Explicación:**

El handshake de WebSocket es un mecanismo de **actualización de protocolo** sobre HTTP. No se trata de una nueva conexión, sino de reutilizar la misma conexión TCP ya establecida.

**Análisis del handshake:**

| Cabecera | Quién la envía | Propósito |
|----------|---------------|-----------|
| `Upgrade: websocket` | Cliente | Solicita cambiar a WebSocket |
| `Connection: Upgrade` | Cliente | Indica que la conexión actual debe actualizarse |
| `Sec-WebSocket-Key` | Cliente | Nonce base64 de 16 bytes aleatorios |
| `HTTP/1.1 101 Switching Protocols` | Servidor | Acepta el cambio de protocolo |
| `Sec-WebSocket-Accept` | Servidor | Hash SHA-1 de la `Key` del cliente + GUID mágico (`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`), codificado en base64. Demuestra que el servidor entiende el protocolo WebSocket |

**Análisis de cada opción:**

- **a)** → ❌ Incorrecto. `Sec-WebSocket-Accept` **no** es aleatorio; está criptográficamente derivado de la `Sec-WebSocket-Key` del cliente mediante un hash SHA-1 con un GUID fijo. Este mecanismo evita que servidores que no entienden WebSocket acepten conexiones por error.

- **b)** → ✅ Correcto. Tras el `101 Switching Protocols`, la misma conexión TCP se mantiene abierta y deja de hablar HTTP para hablar el protocolo frameado de WebSocket. El handshake es una **actualización**, no una nueva conexión.

- **c)** → ❌ Incorrecto. Aunque `Sec-WebSocket-Version: 13` es habitual en peticiones reales, su ausencia no invalida el handshake mostrado. El servidor puede asumir la versión por defecto. Lo esencial (`Upgrade`, `Connection`, `Sec-WebSocket-Key` / `Sec-WebSocket-Accept`) está presente.

- **d)** → ❌ Incorrecto. `101 Switching Protocols` es el **único** código HTTP válido para aceptar un upgrade de protocolo. Un `200 OK` indicaría que la petición HTTP se procesó con éxito pero el protocolo **no cambió**, lo cual rompería WebSocket.

> 💡 **Puntos clave del handshake:**
> - El cliente inicia con una petición HTTP normal con cabeceras especiales.
> - El servidor responde `101`, no `200`.
> - La misma conexión TCP se reutiliza; no hay nueva conexión.
> - `Sec-WebSocket-Accept` demuestra que el servidor es realmente un servidor WebSocket.

</details>

---

## Pregunta 5: Escalabilidad y consideraciones de arquitectura

**Una aplicación usa WebSocket para notificaciones en tiempo real a miles de usuarios concurrentes. ¿Cuál es la principal consideración de arquitectura que debe tenerse en cuenta?**

**Opciones:**

- a) WebSocket es stateless, por lo que cualquier servidor puede responder a cualquier cliente sin necesidad de afinidad de sesión.
- b) Cada conexión WebSocket consume recursos del servidor (memoria, hilos/descriptores) de forma persistente, por lo que el escalado horizontal requiere estrategias como sticky sessions o un bus de mensajes compartido.
- c) WebSocket consume menos recursos que HTTP/REST porque reutiliza el handshake sin mantener estado.
- d) El protocolo WebSocket incluye balanceo de carga nativo, distribuyendo automáticamente los mensajes entre instancias del servidor.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) Cada conexión WebSocket consume recursos del servidor (memoria, hilos/descriptores) de forma persistente, por lo que el escalado horizontal requiere estrategias como sticky sessions o un bus de mensajes compartido.**

**Explicación:**

A diferencia de HTTP, que es **stateless** y libera recursos inmediatamente tras responder, una conexión WebSocket es **stateful** y **persistente**: el servidor debe mantener el estado de cada socket abierto en memoria para poder enviarle mensajes en cualquier momento.

**Análisis de cada opción:**

- **a)** → ❌ Incorrecto. WebSocket es **stateful** por definición. El servidor debe recordar qué conexión corresponde a qué cliente. Si hay múltiples instancias del servidor, una petición de un cliente conectado a la instancia A no puede ser atendida por la instancia B, a menos que exista un mecanismo de redirección o un bus de mensajes.

- **b)** → ✅ Correcto. Cada conexión WebSocket abierta reserva recursos: un descriptor de archivo/socket, buffers de kernel, y memoria de aplicación para el objeto de conexión. Con miles de usuarios, esto escala verticalmente hasta un límite. Para escalar horizontalmente se usan:
  - **Sticky sessions** (afinidad de sesión): el balanceador redirige siempre al mismo servidor.
  - **Redis / RabbitMQ / Kafka** como bus de mensajes compartido: el servidor que recibe el evento publica en el bus, y todas las instancias reenvían a sus clientes conectados.
  - **Sharding por sala/topic**: dividir los clientes en grupos gestionados por servidores distintos.

- **c)** → ❌ Incorrecto. Es exactamente al revés: WebSocket **sí** mantiene estado (la conexión abierta) y consume **más** recursos por cliente a largo plazo que HTTP, que es efímero. El beneficio de WebSocket no es el ahorro de recursos, sino la **baja latencia** y la **capacidad de push**.

- **d)** → ❌ Incorrecto. El protocolo WebSocket (RFC 6455) no define ningún mecanismo de balanceo de carga. El balanceo debe implementarse a nivel de infraestructura (balanceador L4/L7, Kubernetes Ingress) o de aplicación (Redis Pub/Sub, etc.).

> 💡 **Regla práctica:**
> - Antes de adoptar WebSocket, calcula el coste de memoria por conexión y multiplica por el pico de usuarios concurrentes esperados.
> - Si escalas horizontalmente, **nunca** asumas que todos los clientes de un mismo "room" o "topic" están en la misma instancia; usa un backplane (Redis, RabbitMQ) para sincronizar mensajes entre nodos.

</details>

