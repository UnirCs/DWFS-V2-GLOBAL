# Spring Framework - Guía de arranque

En esta sección se trabaja con aplicaciones **front-end** (React + Vite) que se comunican con **microservicios back-end** alojados en repositorios independientes. A continuación se detalla cómo arrancar cada proyecto y qué repositorios back-end son necesarios.

---

## Proyecto 07 - Carrito de pedidos

### Front-end
```bash
cd "Codigo de apoyo/front-end-supplies-07-carrito-pedidos"
npm install
npm run dev
```

### Back-end (repositorios externos)

| Servicio | Repositorio |
|----------|-------------|
| Catálogo | [back-end-supplies-catalogue](https://github.com/UnirCs/back-end-supplies-catalogue) |
| Pedidos  | [back-end-supplies-orders](https://github.com/UnirCs/back-end-supplies-orders) |

Clona ambos repositorios y arráncalos siguiendo las instrucciones de cada uno.

> **⚠️ Nota importante sobre CORS:**  
> El servicio de **Catalogue** incluye la anotación `@CrossOrigin` en su controlador, lo que permite que el front-end (en un puerto distinto) realice peticiones sin problemas.  
> Sin embargo, el servicio de **Orders NO tiene dicha anotación**, por lo que las operaciones de compra y la consulta de órdenes recientes en el perfil **fallarán por política de CORS** del navegador. Esto es intencionado para que se comprenda el problema y se aborde en los siguientes proyectos.

---

## Proyecto 08 - Gateway

### Front-end
```bash
cd "Codigo de apoyo/front-end-supplies-08-gateway"
npm install
npm run dev
```

### Back-end (repositorios externos)

Además de los servicios del proyecto 07, se necesitan dos componentes de infraestructura:

| Servicio | Repositorio |
|----------|-------------|
| Catálogo | [back-end-supplies-catalogue](https://github.com/UnirCs/back-end-supplies-catalogue) |
| Pedidos  | [back-end-supplies-orders](https://github.com/UnirCs/back-end-supplies-orders) |
| Eureka Server | [back-end-eureka](https://github.com/UnirCs/back-end-eureka) |
| Cloud Gateway | [back-end-cloud-gateway](https://github.com/UnirCs/back-end-cloud-gateway) |

**Orden de arranque recomendado:**
1. **Eureka Server** — Registro y descubrimiento de servicios (Netflix Eureka).
2. **Cloud Gateway** — API Gateway (Spring Cloud Gateway) que enruta las peticiones a los microservicios registrados en Eureka.
3. **Catalogue** y **Orders** — Microservicios de negocio.
4. **Front-end**.

Con el Gateway como punto de entrada único, el front-end realiza todas las peticiones a través de él, evitando los problemas de CORS del proyecto anterior.

---

## Proyecto 09 - Gateway ACL (Anti-Corruption Layer)

### Front-end
```bash
cd "Codigo de apoyo/front-end-supplies-09-gateway-acl"
npm install
npm run dev
```

### Back-end (repositorios externos)

Se utilizan los mismos microservicios y Eureka Server que en el proyecto 08, pero con un **gateway distinto** que actúa como **Anti-Corruption Layer (ACL)**:

| Servicio | Repositorio |
|----------|-------------|
| Catálogo | [back-end-supplies-catalogue](https://github.com/UnirCs/back-end-supplies-catalogue) |
| Pedidos  | [back-end-supplies-orders](https://github.com/UnirCs/back-end-supplies-orders) |
| Eureka Server | [back-end-eureka](https://github.com/UnirCs/back-end-eureka) |
| Cloud Gateway ACL | [back-end-cloud-gateway-filters](https://github.com/UnirCs/back-end-cloud-gateway-filters) |

**Orden de arranque recomendado:**
1. **Eureka Server**
2. **Cloud Gateway Filters (ACL)**
3. **Catalogue** y **Orders**
4. **Front-end**

> **🔒 ¿Qué cambia respecto al proyecto 08?**  
> Este gateway incorpora **filtros** que restringen la comunicación desde el front-end: únicamente se permiten peticiones **POST**. De esta forma, toda la información viaja dentro del **body** de la petición, lo que facilita su cifrado mediante un posible certificado SSL. Cualquier otro verbo HTTP (GET, PUT, DELETE…) será rechazado por el gateway, asegurando que la capa de presentación no pueda interactuar directamente con los endpoints REST estándar de los microservicios.

