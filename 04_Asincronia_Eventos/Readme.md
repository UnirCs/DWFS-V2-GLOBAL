# Asincronía y Eventos

Los proyectos del tema anterior **08-gateway** y **09-gateway-acl** sirven como base front-end para este tema.

## Back-end adicional

Para trabajar con eventos asíncronos se necesitan dos repositorios adicionales:

| Servicio | Repositorio |
|----------|-------------|
| Communications | [back-end-supplies-communications](https://github.com/UnirCs/back-end-supplies-communications) |
| Orders & Events | [back-end-supplies-orders-and-events](https://github.com/UnirCs/back-end-supplies-orders-and-events) |

- **Orders & Events** es una variación del microservicio de Orders que, además de gestionar pedidos, **publica eventos en un RabbitMQ**.
- **Communications** es un servicio que **consume esos eventos** desde RabbitMQ para procesarlos (por ejemplo, envío de notificaciones).

> **Requisito:** Es necesario tener una instancia de **RabbitMQ** corriendo (puede usarse Docker) para que la comunicación entre ambos servicios funcione.

