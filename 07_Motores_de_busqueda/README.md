# Motores de Búsqueda

## Front-end
```bash
cd front-end-supplies-12-elastic
npm install
npm run dev
```

## Back-end necesario

Este proyecto requiere toda la infraestructura back-end de temas anteriores, además de una **versión modificada del microservicio de catálogo** que integra un motor de búsqueda:

| Servicio | Repositorio |
|----------|-------------|
| **Catalogue (Elasticsearch)** | [**back-end-supplies-catalogue-elasticsearch**](https://github.com/UnirCs/back-end-supplies-catalogue-elasticsearch) |
| Orders & Events | [back-end-supplies-orders-and-events](https://github.com/UnirCs/back-end-supplies-orders-and-events) |
| Communications | [back-end-supplies-communications](https://github.com/UnirCs/back-end-supplies-communications) |
| Users | [back-end-supplies-users](https://github.com/UnirCs/back-end-supplies-users) |
| Eureka Server | [back-end-eureka](https://github.com/UnirCs/back-end-eureka) |
| Gateway Secured | [back-end-cloud-gateway-secured](https://github.com/UnirCs/back-end-cloud-gateway-secured) |

### Catalogue Elasticsearch

Este microservicio es una **versión modificada de `back-end-supplies-catalogue`** que sustituye las búsquedas convencionales por consultas a **OpenSearch / Elasticsearch**. Para obtener un clúster de OpenSearch gratuito se utiliza [Bonsai.io](https://bonsai.io/).

> **⚠️ Mecanismo de sincronización:**  
> Es importante prestar atención al mecanismo de sincronización implementado en este microservicio. Su objetivo es **migrar y mantener sincronizada la información entre la base de datos relacional y los índices de OpenSearch**. Cada vez que se produce un cambio en base de datos, dicho cambio se refleja en el índice correspondiente, garantizando consistencia entre ambas fuentes de datos.

**Orden de arranque recomendado:**
1. **Redis** y **RabbitMQ** (Docker o instalación local)
2. **Eureka Server**
3. **Users**
4. **Gateway Secured**
5. **Catalogue (Elasticsearch)**, **Orders & Events** y **Communications**
6. **Front-end**

