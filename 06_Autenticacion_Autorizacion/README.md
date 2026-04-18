# Autenticación y Autorización

## Front-end
```bash
cd front-end-supplies-11-auth
npm install
npm run dev
```

## Back-end necesario

Este proyecto requiere **toda la infraestructura back-end vista en los temas anteriores** (ver READMEs de [03_Spring_Framework](../03_Spring_Framework/README.md), [04_Asincronía_Eventos](../04_Asincronia_Eventos/Readme.md) y [05_WebSockets](../05_Asincronia_Websockets/README.md)), además de dos nuevos servicios orientados a la seguridad:

| Servicio | Repositorio |
|----------|-------------|
| Catálogo | [back-end-supplies-catalogue](https://github.com/UnirCs/back-end-supplies-catalogue) |
| Orders & Events | [back-end-supplies-orders-and-events](https://github.com/UnirCs/back-end-supplies-orders-and-events) |
| Communications | [back-end-supplies-communications](https://github.com/UnirCs/back-end-supplies-communications) |
| Eureka Server | [back-end-eureka](https://github.com/UnirCs/back-end-eureka) |
| **Gateway Secured** | [**back-end-cloud-gateway-secured**](https://github.com/UnirCs/back-end-cloud-gateway-secured) |
| **Users** | [**back-end-supplies-users**](https://github.com/UnirCs/back-end-supplies-users) |

### Nuevos servicios

- **Gateway Secured** — Un gateway que incorpora lógica de autenticación y autorización. Hace uso del microservicio de usuarios para **generar y validar tokens**, apoyándose en una instancia de **Redis** para su almacenamiento y gestión.
- **Users** — Microservicio de **gestión de usuarios** (registro, login, validación de credenciales).

> **Requisitos adicionales:**
> - Una instancia de **Redis** corriendo (puede usarse Docker) para la gestión de tokens.
> - Una instancia de **RabbitMQ** corriendo (puede usarse Docker) para los eventos.

**Orden de arranque recomendado:**
1. **Redis** y **RabbitMQ** (Docker o instalación local)
2. **Eureka Server**
3. **Users**
4. **Gateway Secured**
5. **Catalogue**, **Orders & Events** y **Communications**
6. **Front-end**

