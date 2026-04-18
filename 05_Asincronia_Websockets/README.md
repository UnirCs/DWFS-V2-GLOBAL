# Asincronía - WebSockets

## Front-end
```bash
cd front-end-supplies-10-websocket
npm install
npm run dev
```

## Back-end necesario

Este proyecto requiere **toda la infraestructura back-end vista en los temas anteriores** (ver READMEs de [03_Spring_Framework](../03_Spring_Framework/README.md) y [04_Asincronía_Eventos](../04_Asincronia_Eventos/Readme.md)):

| Servicio | Repositorio |
|----------|-------------|
| Catálogo | [back-end-supplies-catalogue](https://github.com/UnirCs/back-end-supplies-catalogue) |
| Orders & Events | [back-end-supplies-orders-and-events](https://github.com/UnirCs/back-end-supplies-orders-and-events) |
| Eureka Server | [back-end-eureka](https://github.com/UnirCs/back-end-eureka) |
| Cloud Gateway | [back-end-cloud-gateway](https://github.com/UnirCs/back-end-cloud-gateway) |
| **Communications** | [**back-end-supplies-communications**](https://github.com/UnirCs/back-end-supplies-communications) |

> **🔌 Importante:**  
> El servicio de **Communications** es especialmente relevante en este tema, ya que es contra quien el front-end **establece la conexión WebSocket**. La conexión pasa a través del Gateway, pero el endpoint WebSocket reside en Communications. Asegúrate de que este servicio esté arrancado y correctamente registrado en Eureka antes de probar la funcionalidad.

**Orden de arranque recomendado:**
1. **RabbitMQ** (Docker o instalación local)
2. **Eureka Server**
3. **Cloud Gateway**
4. **Catalogue**, **Orders & Events** y **Communications**
5. **Front-end**



