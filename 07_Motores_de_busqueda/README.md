# Motores de Búsqueda

## Consumo de API de OpenSearch / Elasticsearch

El repositorio [`elasticsearch-operations-postman`](https://github.com/UnirCs/elasticsearch-operations-postman) es un buen recurso para familiarizarse con la API de OpenSearch sin instalaciones adicionales.

Incluye instrucciones para crear un clúster de prueba y una colección de Postman con operaciones habituales de OpenSearch / Elasticsearch.

## Consumo de Back-End desde Postman

Para probar los servicios back-end de forma directa puedes importar la colección de Postman incluida en este repositorio:

📁 [`00_Otros_Recursos/UNIR Supplies Back-End.postman_collection.json`](../00_Otros_Recursos/UNIR%20Supplies%20Back-End.postman_collection.json)

La carpeta de la colección relevante para este tema es:

### 📂 05 - Search Engine
Recoge las operaciones relacionadas con el motor de búsqueda (OpenSearch/Elasticsearch):
- **Migration**: lanza el proceso de migración/sincronización de los datos desde la base de datos relacional hacia el índice de OpenSearch, asegurando que ambas fuentes queden alineadas.
- **Obtener datos**: realiza búsquedas de suministros contra el índice, con soporte para búsqueda por texto libre (nombre) y filtrado por tipo, explotando las capacidades del motor de búsqueda.

---

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
