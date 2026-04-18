# Plataformas de Pago

## Front-end
```bash
cd front-end-supplies-13-stripe
npm install
npm run dev
```

## Back-end necesario

Este proyecto requiere toda la infraestructura back-end de temas anteriores, pero con **dos microservicios evolucionados** que integran **Stripe** como plataforma de pago:

| Servicio | Repositorio |
|----------|-------------|
| **Catalogue Elasticsearch + Stripe** | [**back-end-supplies-catalogue-elasticsearch-stripe**](https://github.com/UnirCs/back-end-supplies-catalogue-elasticsearch-stripe) |
| **Orders & Events + Stripe** | [**back-end-supplies-orders-and-events-stripe**](https://github.com/UnirCs/back-end-supplies-orders-and-events-stripe) |
| Communications | [back-end-supplies-communications](https://github.com/UnirCs/back-end-supplies-communications) |
| Users | [back-end-supplies-users](https://github.com/UnirCs/back-end-supplies-users) |
| Eureka Server | [back-end-eureka](https://github.com/UnirCs/back-end-eureka) |
| Gateway Secured | [back-end-cloud-gateway-secured](https://github.com/UnirCs/back-end-cloud-gateway-secured) |

### Catalogue Elasticsearch + Stripe

Evolución de `back-end-supplies-catalogue-elasticsearch` que incorpora integración con Stripe:

- **Envía a Stripe toda la información de los productos** del catálogo.
- Garantiza que todos los elementos en base de datos y en el índice de OpenSearch tengan un campo **`stripePrice`** que permite relacionarlos con los precios registrados en Stripe.

### Orders & Events + Stripe

Evolución de `back-end-supplies-orders-and-events` que incorpora integración con Stripe:

- Al crear una orden de suministros, se genera una **sesión de checkout de Stripe** (embed o delegated).
- Cuando el usuario completa el pago, **Stripe envía de forma asíncrona una petición a un webhook** del microservicio donde se resuelve por completo la compra.

> **🔑 Configuración necesaria:**  
> Es necesario configurar las claves de API de Stripe (publishable key y secret key) tanto en el front-end como en los microservicios. Consulta la documentación de cada repositorio para más detalles.

**Orden de arranque recomendado:**
1. **Redis** y **RabbitMQ** (Docker o instalación local)
2. **Eureka Server**
3. **Users**
4. **Gateway Secured**
5. **Catalogue Elasticsearch Stripe**, **Orders & Events Stripe** y **Communications**
6. **Front-end**

