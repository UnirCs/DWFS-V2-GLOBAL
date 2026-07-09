# Preguntas de Examen - Asincronía con Eventos
---

## Pregunta 1 — Evolución de contratos de eventos

Respecto a la evolución del contrato de un evento JSON `PedidoCreado`, ¿qué cambio es compatible hacia atrás sin romper consumidores tolerantes?

Seleccione una:

A. Renombrar `idPedido` a `pedidoId` y eliminar `idPedido` en la misma versión.  
B. Cambiar `total` de número a cadena para incluir el símbolo de moneda.  
C. Añadir `clienteEmail` como campo opcional manteniendo todos los campos existentes.  
D. Convertir `lineasPedido` de array a objeto sin versionar el evento.

**Respuesta correcta:** C

**Feedback:**  
Añadir campos opcionales suele ser compatible hacia atrás si los consumidores ignoran los campos desconocidos. Renombrar, eliminar o cambiar el tipo de un campo existente puede romper consumidores que ya dependían de ese contrato.

---

## Pregunta 2 — Idempotencia en consumidores de eventos

En una arquitectura orientada a eventos, un consumidor recibe dos veces el mismo evento `PagoConfirmado` debido a un reintento del broker. ¿Cuál es la mejor práctica para evitar efectos duplicados?

Seleccione una:

A. Confiar en que el broker nunca entregará eventos duplicados.  
B. Hacer que el consumidor sea idempotente usando un identificador único del evento o de la operación.  
C. Desactivar los reintentos para evitar duplicados.  
D. Procesar siempre el evento porque cada recepción representa una nueva operación de negocio.

**Respuesta correcta:** B

**Feedback:**  
En sistemas distribuidos es habitual trabajar con garantías como *at-least-once delivery*, donde un evento puede llegar más de una vez. Por eso, los consumidores deben ser idempotentes: procesar el mismo evento una o varias veces debe producir el mismo resultado final.

---

## Pregunta 3 — Patrón editor/suscriptor

En el patrón editor/suscriptor, ¿cuál de las siguientes afirmaciones describe correctamente el papel de cada figura?

Seleccione una:

A. El editor conoce directamente a todos los suscriptores y les invoca mediante llamadas síncronas.  
B. El suscriptor publica eventos y el editor decide cuáles consumir.  
C. El editor publica eventos en un canal, tópico o broker, y los suscriptores interesados los reciben sin acoplamiento directo entre ellos.  
D. El broker ejecuta siempre la lógica de negocio principal y los servicios solo almacenan datos.

**Respuesta correcta:** C

**Feedback:**  
En el patrón **publish/subscribe**, el editor publica eventos sin conocer directamente a los consumidores. Los suscriptores se registran o escuchan determinados tópicos, canales o tipos de evento. El broker facilita la comunicación y desacopla emisores y receptores.

---

## Pregunta 4 — ¿Quién puede ser editor o suscriptor?

En una arquitectura orientada a eventos, ¿quién puede actuar como editor o suscriptor de eventos?

Seleccione una:

A. Solo los microservicios backend pueden publicar y consumir eventos.  
B. Solo el API Gateway puede actuar como editor, porque centraliza todas las peticiones.  
C. Cualquier componente autorizado, como microservicios, procesos batch, aplicaciones externas o adaptadores de integración, puede publicar o consumir eventos.  
D. Solo la base de datos puede publicar eventos porque es la fuente de verdad del sistema.

**Respuesta correcta:** C

**Feedback:**  
Un editor o suscriptor puede ser cualquier componente autorizado dentro de la arquitectura: microservicios, procesos asíncronos, integraciones externas, conectores, funciones serverless, sistemas legacy o adaptadores. Lo importante es que respeten el contrato del evento y las reglas de seguridad del sistema.

---

## Pregunta 5 — Eventos frente a comandos

¿Cuál de las siguientes opciones representa mejor la diferencia entre un comando y un evento?

Seleccione una:

A. Un comando expresa algo que ya ha ocurrido; un evento solicita que algo ocurra.  
B. Un comando solicita una acción; un evento comunica un hecho que ya ha ocurrido.  
C. Un comando siempre se envía a muchos consumidores; un evento siempre se envía a uno solo.  
D. No existe diferencia práctica entre comando y evento en arquitecturas distribuidas.

**Respuesta correcta:** B

**Feedback:**  
Un **comando** expresa una intención: “crear pedido”, “cancelar reserva”, “enviar factura”. Un **evento** comunica un hecho ya sucedido: `PedidoCreado`, `ReservaCancelada`, `FacturaEmitida`. Esta diferencia es importante para diseñar correctamente el flujo de negocio.

---

## Pregunta 6 — Consistencia eventual

En una arquitectura orientada a eventos, el servicio de pedidos publica `PedidoCreado` y, unos segundos después, el servicio de facturación genera la factura. Durante ese intervalo, la factura aún no existe. ¿Qué concepto describe mejor esta situación?

Seleccione una:

A. Consistencia eventual.  
B. Bloqueo pesimista distribuido.  
C. Acoplamiento fuerte entre servicios.  
D. Transacción síncrona obligatoria.

**Respuesta correcta:** A

**Feedback:**  
En arquitecturas orientadas a eventos es habitual que distintos servicios actualicen su estado de forma asíncrona. Esto implica que el sistema puede estar temporalmente desincronizado, pero alcanzará un estado consistente con el tiempo. A esto se le llama **consistencia eventual**.

---

## Resumen de conceptos trabajados

| Concepto | Idea principal |
|---|---|
| Evolución de contratos | Añadir campos opcionales suele ser compatible; eliminar, renombrar o cambiar tipos puede romper consumidores. |
| Consumidores tolerantes | Deben ignorar campos desconocidos y no depender de una estructura más estricta de lo necesario. |
| Idempotencia | Procesar varias veces el mismo evento no debe provocar efectos duplicados. |
| Editor/suscriptor | El editor publica eventos sin conocer directamente a los suscriptores. |
| Broker | Desacopla la comunicación entre productores y consumidores de eventos. |
| Comandos vs eventos | El comando solicita una acción; el evento comunica un hecho ya ocurrido. |
| Consistencia eventual | El sistema puede estar temporalmente desincronizado, pero acabará alcanzando un estado coherente. |
