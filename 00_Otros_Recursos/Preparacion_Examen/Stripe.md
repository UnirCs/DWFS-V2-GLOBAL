# Preguntas de Examen - Stripe: Webhooks, Firmas y Entornos

## Pregunta 1: Verificación de la firma del webhook (Stripe-Signature)

**Stripe envía eventos a tu endpoint de webhook con el header `Stripe-Signature`. ¿Cuál es la forma correcta de verificar que la petición realmente proviene de Stripe?**

**Opciones:**

- a) Comparar directamente el valor del header `Stripe-Signature` con la API Key secreta del servidor
- b) Construir un HMAC-SHA256 a partir del payload y el webhook secret (`whsec_...`), comparándolo con el valor del header
- c) Verificar que la IP de origen esté en la lista `api.stripe.com` mediante DNS inverso
- d) Enviar una petición de confirmación a Stripe preguntando si el evento con ese `id` existe

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) Construir un HMAC-SHA256 a partir del payload y el webhook secret (`whsec_...`), comparándolo con el valor del header**

**Explicación:**
Stripe firma cada webhook con un **webhook endpoint secret** (un secreto compartido que empieza por `whsec_`). El header `Stripe-Signature` contiene una firma criptográfica construida con el cuerpo de la petición y ese secreto. El servidor debe reconstruir el HMAC-SHA256 usando el payload recibido y su `webhook_secret`, y compararlo con la firma enviada por Stripe.

Los SDKs oficiales de Stripe exponen un método de conveniencia para esto (p. ej. en Java):
```java
Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
```

Esto además deserializa el payload en el objeto `Event` correspondiente, validando tanto la firma como la integridad de los datos.

**Análisis de cada opción:**

- **a) Comparar con la API Key secreta** → ❌ Incorrecto. La API Key secreta (`sk_...`) sirve para autenticar las peticiones que *tú* haces *a* Stripe, no para verificar las que Stripe te envía. Usar la API Key como secreto de firma expone información crítica innecesariamente y no funciona.

- **b) Construir un HMAC-SHA256 con el webhook secret** → ✅ Correcto. Es el mecanismo oficial documentado por Stripe. El `webhook_secret` es un secreto único por endpoint de webhook y se usa para validar la autenticidad del remitente.

- **c) Verificar la IP de origen** → ❌ Incorrecto. Stripe no garantiza un rango fijo de IPs para los webhooks (aunque sí publica rangos para APIs de conectividad). Depender del DNS inverso es frágil y no es un método de validación soportado oficialmente.

- **d) Enviar una petición de confirmación a Stripe** → ❌ Incorrecto. Aunque es posible consultar un evento por su `id` usando la API REST (`GET /v1/events/{id}`), esto no verifica que la petición original no haya sido manipulada ni evita la exposición a peticiones de terceros. Es un anti-patrón que introduce latencia y no es un mecanismo de seguridad.

> 💡 **Regla práctica:**
> - Nunca uses la API Key (`sk_...`) para validar webhooks.
> - Usa siempre el `webhook_secret` (`whsec_...`) proporcionado al configurar el endpoint en el Dashboard de Stripe o con la CLI.

</details>

---

## Pregunta 2: Versión de API vs. versión del SDK de Java

**Un microservicio Java que procesa eventos de Stripe define el evento `payment_intent.succeeded` como una instancia de `PaymentIntent`. Tras una actualización de la API de Stripe, el campo `charges` pasa a llamarse `latest_charge` en la versión más reciente de la API. El servicio comienza a fallar al procesar webhooks. ¿Cuál es la causa más probable del error?**

**Opciones:**

- a) El webhook secret ha caducado y Stripe ha dejado de enviar eventos al endpoint
- b) La versión de la API de Stripe configurada en el Dashboard difiere de la versión esperada por el SDK de Java del servidor
- c) El endpoint de webhook no está respondiendo con un código HTTP 200 dentro del tiempo máximo permitido
- d) Stripe ha revocado la API Key del servidor por inactividad

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) La versión de la API de Stripe configurada en el Dashboard difiere de la versión esperada por el SDK de Java del servidor**

**Explicación:**
Stripe versiona su API explícitamente. Cada cuenta de Stripe tiene una **versión de API por defecto** configurada en el Dashboard, y los eventos de webhook se envían serializados según esa versión. Si la versión de la API en el Dashboard (ej. `2024-10-28`) es más reciente que la que el SDK de Java espera (ej. `23.0.0` basado en la API `2023-10-16`), los campos del JSON del evento pueden haber cambiado de nombre, estructura o tipado.

En el ejemplo del enunciado:
- API antigua: el objeto `PaymentIntent` tiene un campo `charges` (objeto anidado).
- API nueva: el campo se simplifica a `latest_charge` (string con un ID).
- El SDK de Java antiguo intenta deserializar `charges` y no encuentra la estructura esperada → excepción de parsing o campos nulos.

**Análisis de cada opción:**

- **a) Webhook secret caducado** → ❌ Incorrecto. Los webhook secrets (`whsec_...`) no caducan. Si fallara, el error ocurriría en la validación de la firma, no en la deserialización del evento.

- **b) Mismatch entre versión de API y versión del SDK** → ✅ Correcto. Es el escenario clásico de "API version mismatch". Stripe recomienda fijar la versión de la API a nivel de petición (`Stripe-Version` header) o mantener el SDK actualizado para que sus clases Java reflejen la estructura de la API actual.

- **c) Timeout en la respuesta del endpoint** → ❌ Incorrecto. Si el endpoint tardara demasiado, Stripe marcaría el webhook como fallido y reintentaría. El error descrito es de parsing/deserialización del payload, no de tiempo de respuesta.

- **d) API Key revocada por inactividad** → ❌ Incorrecto. Stripe no revoca API Keys por inactividad. Además, el procesamiento de webhooks no requiere la API Key del servidor para recibir el evento (solo el webhook secret para validarlo). El fallo ocurriría al intentar llamar a la API de Stripe, no al recibir el webhook.

> 💡 **Regla práctica:**
> - Fija la versión de la API en las peticiones: `Stripe.apiVersion = "2023-10-16";`
> - Mantén el SDK de Stripe actualizado para que los modelos Java coincidan con la API que consumes.
> - Revisa el log de eventos en el Dashboard de Stripe para ver la representación exacta del JSON enviado.

</details>

---

## Pregunta 3: Definición de webhook en el contexto de Stripe

**¿Qué es un webhook en el contexto de Stripe y qué función cumple en el flujo de pagos?**

**Opciones:**

- a) Un endpoint REST del cliente que Stripe consulta periódicamente para sincronizar el estado de las órdenes
- b) Un mecanismo por el cual Stripe envía notificaciones HTTP asíncronas a un endpoint del servidor del cliente cuando ocurre un evento relevante
- c) Un script que se ejecuta en el navegador del cliente para validar la tarjeta de crédito en tiempo real
- d) Una conexión persistente de tipo WebSocket entre Stripe y el servidor del cliente para streaming de eventos

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) Un mecanismo por el cual Stripe envía notificaciones HTTP asíncronas a un endpoint del servidor del cliente cuando ocurre un evento relevante**

**Explicación:**
En Stripe, un **webhook** es un mecanismo de comunicación **push** basado en HTTP: cuando ocurre un evento en la plataforma de Stripe (pago completado, suscripción cancelada, disputa creada, etc.), Stripe construye un payload JSON con la información del evento y realiza una petición HTTP `POST` a un endpoint configurado previamente por el comerciante.

Esto permite al servidor del cliente reaccionar a eventos que no ha iniciado directamente (como la finalización de un pago en 3D Secure o el vencimiento de una tarjeta) sin tener que encuestar continuamente la API de Stripe.

**Análisis de cada opción:**

- **a) Endpoint que Stripe consulta periódicamente** → ❌ Incorrecto. Describe un modelo **pull/polling**, que es lo opuesto a un webhook. Stripe nunca consulta endpoints del cliente por iniciativa propia salvo el webhook push.

- **b) Notificaciones HTTP asíncronas push** → ✅ Correcto. Es la definición precisa: Stripe envía un `POST` asíncrono con el evento al endpoint configurado. El servidor recibe el evento, valida la firma, procesa la lógica de negocio y responde con un `200 OK`.

- **c) Script en el navegador para validar tarjetas** → ❌ Incorrecto. Describe una validación de front-end (posiblemente con Stripe.js o Elements), no un webhook. Los webhooks son del lado del servidor.

- **d) Conexión persistente WebSocket** → ❌ Incorrecto. Stripe no usa WebSockets para notificar eventos. Los webhooks son peticiones HTTP individuales y sin estado, no conexiones persistentes.

> 💡 **Ejemplo de flujo:**
> 1. El usuario completa un pago en el checkout de Stripe.
> 2. Stripe crea un evento `checkout.session.completed`.
> 3. Stripe envía un `POST` al webhook del servidor: `{ "type": "checkout.session.completed", ... }`.
> 4. El servidor valida la firma, actualiza la orden a "pagada" y envía un email de confirmación.

</details>

---

## Pregunta 4: Prueba de webhooks en local

**Durante el desarrollo local, tu servidor corre en `http://localhost:8080` y no es accesible públicamente desde Internet. ¿Qué herramienta o comando ofrece Stripe para probar la recepción de webhooks en este escenario?**

**Opciones:**

- a) `stripe trigger payment_intent.succeeded`
- b) `stripe webhook test --url http://localhost:8080/webhook`
- c) `stripe listen --forward-to localhost:8080/webhook`
- d) `stripe local --endpoint http://localhost:8080/webhook --event payment_intent.succeeded`

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: c) `stripe listen --forward-to localhost:8080/webhook`**

**Explicación:**
La **Stripe CLI** (Command Line Interface) proporciona el comando `stripe listen` para escuchar eventos de Stripe en tiempo real y reenviarlos a un endpoint local. Este comando establece un túnel seguro entre los servidores de Stripe y tu máquina de desarrollo, permitiendo que los webhooks reales (o simulados) lleguen a `localhost`.

El flag `--forward-to` (o `-f`) indica la URL local donde se reenviarán los eventos. Al ejecutarlo, la CLI muestra un **webhook signing secret** de prueba (`whsec_...`) que debe usarse para validar las firmas en entorno local.

**Análisis de cada opción:**

- **a) `stripe trigger payment_intent.succeeded`** → ❌ Incorrecto. El comando `stripe trigger` *sí* existe, pero **solo simula un evento** y lo envía a través del túnel que `stripe listen` haya creado. No establece por sí mismo el túnel ni reenvía a localhost; requiere que `stripe listen` esté corriendo en paralelo.

- **b) `stripe webhook test --url ...`** → ❌ Incorrecto. No existe el subcomando `stripe webhook test` en la CLI oficial.

- **c) `stripe listen --forward-to localhost:8080/webhook`** → ✅ Correcto. Es el comando oficial para crear un túnel de webhooks hacia un entorno local. Permite recibir eventos reales de Stripe (o simulados con `stripe trigger`) directamente en el servidor de desarrollo.

- **d) `stripe local --endpoint ...`** → ❌ Incorrecto. No existe el subcomando `stripe local` en la CLI oficial.

> 💡 **Flujo de trabajo típico en desarrollo:**
> ```bash
> # Terminal 1: escuchar y reenviar webhooks al servidor local
> stripe listen --forward-to localhost:8080/api/stripe/webhook
> # Devuelve un webhook secret de prueba (whsec_test_...)
>
> # Terminal 2: simular un evento concreto
> stripe trigger payment_intent.succeeded
> ```

</details>

---

## Pregunta 5: Entornos y API Keys en Stripe

**Stripe no ofrece el concepto tradicional de "entornos" (sandbox / producción) como plataformas como PayPal. ¿Cómo se gestionan el entorno de pruebas y el entorno productivo en Stripe?**

**Opciones:**

- a) Mediante el uso de la misma cuenta y activando un "modo sandbox" en la configuración del Dashboard
- b) Mediante claves de API completamente separadas: las claves de prueba (`pk_test_...`, `sk_test_...`) para el entorno de desarrollo y las de producción (`pk_live_...`, `sk_live_...`) para el entorno real
- c) Mediante subdominios distintos de la API (`https://test-api.stripe.com` y `https://api.stripe.com`)
- d) Stripe no permite realizar pagos de prueba; todos los pagos procesados son reales

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) Mediante claves de API completamente separadas: las claves de prueba (`pk_test_...`, `sk_test_...`) para el entorno de desarrollo y las de producción (`pk_live_...`, `sk_live_...`) para el entorno real**

**Explicación:**
Stripe utiliza un modelo de **dos cuentas lógicas** dentro del mismo Dashboard: un modo **Test** (pruebas) y un modo **Live** (producción). No existen URLs de API separadas ni un interruptor de "sandbox"; la separación de entornos se realiza exclusivamente a través de las claves de API.

| Entorno | Publishable Key | Secret Key | Comportamiento |
|---------|----------------|------------|----------------|
| **Test** | `pk_test_...` | `sk_test_...` | No se procesan pagos reales. Se pueden usar tarjetas de prueba (ej. `4242 4242 4242 4242`). |
| **Live** | `pk_live_...` | `sk_live_...` | Se procesan pagos reales con tarjetas reales. |

El Dashboard de Stripe permite alternar entre modos Test y Live, y cada modo tiene sus propios datos, eventos y webhooks independientes.

**Análisis de cada opción:**

- **a) Misma cuenta con "modo sandbox"** → ❌ Incorrecto. Stripe no tiene un único "modo sandbox" que se active/desactive. Hay dos modos dentro del mismo Dashboard, pero la separación real ocurre por claves de API, no por un flag de configuración.

- **b) Claves de API separadas (`test` vs `live`)** → ✅ Correcto. Es el mecanismo oficial de Stripe. El prefijo de la clave (`pk_test_`, `sk_test_`, `pk_live_`, `sk_live_`) determina si la operación afecta a datos de prueba o reales. Usar `sk_test_` en producción es un error común que provoca que los pagos no se procesen realmente.

- **c) Subdominios distintos de la API** → ❌ Incorrecto. La URL de la API de Stripe es única: `https://api.stripe.com`. No hay un endpoint `test-api.stripe.com`. La distinción de entorno se hace mediante la clave enviada en el header `Authorization`.

- **d) Stripe no permite pagos de prueba** → ❌ Incorrecto. Stripe permite y fomenta el uso de tarjetas de prueba en el modo Test. Existe una lista oficial de números de tarjeta de prueba (Visa, Mastercard, 3D Secure, etc.) que simulan distintos escenarios (éxito, rechazo, autenticación requerida).

> 💡 **Regla práctica:**
> - Nunca commitees claves `live` en el repositorio.
> - Usa variables de entorno para distinguir `STRIPE_SECRET_KEY_TEST` y `STRIPE_SECRET_KEY_LIVE`.
> - Los webhook secrets también son distintos por modo (`whsec_test_...` vs `whsec_live_...`).

</details>

