# Preguntas de Examen — Elasticsearch / OpenSearch y Lucene

## Pregunta 1: Índice invertido de Lucene

**¿Qué es un índice invertido en Lucene y cuál es su utilidad principal?**

**Opciones:**

- a) Una estructura de datos que almacena los documentos completos en formato binario para reducir el tamaño en disco.
- b) Un mapeo de cada término único a la lista de documentos (y posiciones) donde aparece, optimizando las búsquedas de texto.
- c) Un índice jerárquico de carpetas que organiza los segmentos físicos del disco duro donde se guardan los shards.
- d) Una tabla de hash en memoria que guarda todas las relaciones entre documentos padre e hijo.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) Un mapeo de cada término único a la lista de documentos (y posiciones) donde aparece, optimizando las búsquedas de texto.**

**Explicación:**
El índice invertido es la estructura de datos fundamental de Lucene (y por tanto de Elasticsearch/OpenSearch). En lugar de recorrer documento por documento para encontrar una palabra, construye un diccionario de términos donde cada entrada apunta a las ocurrencias (documentos, posiciones dentro del documento, frecuencias, etc.). Esto convierte la búsqueda de texto de una operación O(n) sobre documentos en una operación O(log n) sobre términos.

**Opciones incorrectas:**
- **a)** ❌ No almacena documentos completos en formato binario; almacena términos y postings lists.
- **c)** ❌ No es un índice jerárquico de carpetas; describe una estructura lógica de datos, no organización física de disco.
- **d)** ❌ No es una tabla de hash para relaciones padre-hijo; es una estructura invertida término → documentos.

</details>

---

## Pregunta 2: Tokens con el analizador/tokenizador por defecto

**Se indexa el siguiente documento en un campo de tipo `text` con el analizador y tokenizador estándar por defecto de OpenSearch/Elasticsearch:**

```json
{ "descripcion": "¡OpenSearch es genial!" }
```

**¿Qué tokens se generarán tras el análisis para este campo?**

**Opciones:**

- a) `¡OpenSearch`, `es`, `genial!`
- b) `opensearch`, `es`, `genial`
- c) `OpenSearch`, `es`, `genial`
- d) `opensearch`, `es`, `genial!`

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) `opensearch`, `es`, `genial`**

**Explicación:**
El analizador estándar por defecto de Elasticsearch/OpenSearch realiza los siguientes pasos:
1. **Tokenización:** Divide por espacios y signos de puntuación, eliminando los delimitadores. Produce: `OpenSearch`, `es`, `genial`.
2. **Lowercasing (filtro lowercase):** Convierte todos los tokens a minúsculas. Produce: `opensearch`, `es`, `genial`.
3. **Stop words:** Por defecto **no** elimina stop words en inglés (aunque el analizador `standard` no lo hace por defecto en versiones recientes; en versiones antiguas sí). En cualquier caso, `es` no es stop word en inglés.

Por tanto, los tokens finales son: `opensearch`, `es`, `genial`.

**Opciones incorrectas:**
- **a)** ❌ Incluye los signos de puntuación (`¡` y `!`) como parte del token; el tokenizador los descarta.
- **c)** ❌ Mantiene las mayúsculas; el filtro `lowercase` del analizador estándar las convierte a minúsculas.
- **d)** ❌ Mantiene el signo de exclamación en `genial!`; el tokenizador elimina puntuación.

</details>

---

## Pregunta 3: Elección de tipo de campo — caso 1

**Un equipo quiere implementar una barra de búsqueda en la página principal de una tienda online. Los usuarios deben ver sugerencias de productos a medida que escriben, incluso con caracteres parciales. ¿Qué tipo de campo es el más adecuado para la descripción/nombre del producto en este escenario?**

**Opciones:**

- a) `keyword`, porque permite búsquedas exactas y ordenación alfabética.
- b) `text`, porque permite búsquedas de full-text con análisis lingüístico.
- c) `search_as_you_type`, porque está diseñado específicamente para ofrecer autocompletado y matching por prefijo mientras el usuario escribe.
- d) `integer`, porque se puede hacer range queries sobre el identificador del producto.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: c) `search_as_you_type`, porque está diseñado específicamente para ofrecer autocompletado y matching por prefijo mientras el usuario escribe.**

**Explicación:**
El tipo `search_as_you_type` está diseñado exactamente para este caso de uso: autocompletado y búsqueda interactiva mientras se teclea. Internamente indexa los términos de forma que permiten coincidencias por prefijo, sufijo y substrings sin necesidad de wildcards costosos. Es la elección idónea para barras de búsqueda con sugerencias en tiempo real.

**Opciones incorrectas:**
- **a)** ❌ `keyword` solo permite búsquedas exactas (o prefijos con `prefix_query`, pero no está optimizado para autocompletado interactivo). No ofrece la experiencia de "search as you type".
- **b)** ❌ `text` permite full-text search, pero no está optimizado para coincidir con términos parciales (prefijos) de forma eficiente en tiempo real.
- **d)** ❌ `integer` no tiene relación con la búsqueda de texto; sirve para valores numéricos.

</details>

---

## Pregunta 4: Elección de tipo de campo — caso 2

**Un sistema de gestión de pedidos necesita filtrar órdenes por estado exacto (`"pendiente"`, `"enviado"`, `"entregado"`), permitir ordenación alfabética por ese estado y realizar agregaciones (contar cuántos pedidos hay en cada estado). ¿Qué tipo de campo es el más adecuado para el campo `estado`?**

**Opciones:**

- a) `text`, porque permite búsquedas flexibles como "enviad" y encontrar "enviado".
- b) `keyword`, porque almacena el valor exacto, sin análisis, permitiendo filtros de igualdad, ordenación y agregaciones.
- c) `search_as_you_type`, porque permite que los usuarios busquen estados sin escribir la palabra completa.
- d) `date`, porque el estado cambia a lo largo del tiempo.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) `keyword`, porque almacena el valor exacto, sin análisis, permitiendo filtros de igualdad, ordenación y agregaciones.**

**Explicación:**
El tipo `keyword` almacena el string tal cual, sin tokenizar ni analizar. Esto permite:
- Búsquedas exactas (`term` query).
- Ordenación (`sort`).
- Agregaciones (`terms` aggregation).

Los estados de un pedido son valores discretos y finitos; se necesita exactitud, no análisis lingüístico.

**Opciones incorrectas:**
- **a)** ❌ `text` tokenizaría el valor y rompería la capacidad de filtrar por valor exacto. Además, no soporta agregaciones ni ordenación directamente sobre campos `text`.
- **c)** ❌ `search_as_you_type` es excesivo para un campo con valores fijos que no requieren autocompletado.
- **d)** ❌ `date` almacena fechas, no cadenas de texto como estados.

</details>

---

## Pregunta 5: Elección de tipo de campo — caso 3

**Una plataforma de blogging quiere que los usuarios puedan buscar artículos por contenido libre ("cómo hacer paella", "mejores frameworks 2024"), donde las palabras pueden aparecer en cualquier orden y se desea relevancia basada en el análisis del texto. ¿Qué tipo de campo es el más adecuado para el contenido del artículo?**

**Opciones:**

- a) `keyword`, porque permite búsquedas exactas de frases completas.
- b) `text`, porque analiza el contenido, tokeniza, aplica stemming y permite búsquedas de full-text con scoring de relevancia.
- c) `search_as_you_type`, porque los usuarios teclean libremente y el sistema debe ir sugiriendo.
- d) `boolean`, porque la presencia de palabras clave es un valor binario.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: b) `text`, porque analiza el contenido, tokeniza, aplica stemming y permite búsquedas de full-text con scoring de relevancia.**

**Explicación:**
El tipo `text` está diseñado para contenido textual libre. El analizador tokeniza, normaliza (lowercase), elimina stop words y aplica stemming, permitiendo que una búsqueda de "frameworks" también encuentre "framework". Además, calcula un score de relevancia (TF/IDF o BM25) para ordenar los resultados por importancia.

**Opciones incorrectas:**
- **a)** ❌ `keyword` no tokeniza; una búsqueda de "cómo hacer paella" buscaría la frase exacta carácter por carácter, sin relevancia ni flexibilidad.
- **c)** ❌ `search_as_you_type` está pensado para autocompletado en campos cortos (títulos, nombres), no para contenido largo donde se busca relevancia semántica.
- **d)** ❌ `boolean` solo almacena `true`/`false`; no sirve para contenido textual.

</details>

---

## Pregunta 6: Campos adicionales de `search_as_you_type`

**Al definir un campo de tipo `search_as_you_type` en OpenSearch/Elasticsearch, ¿cuántos campos adicionales se generan por defecto además del propio campo, y qué función cumplen?**

**Opciones:**

- a) 2 campos adicionales: `._2gram` y `._3gram`, que indexan n-gramas de 2 y 3 términos para permitir búsquedas parciales.
- b) 3 campos adicionales: `._2gram`, `._3gram` y `._4gram`,  que indexan n-gramas de 2, 3 y 4 términos para permitir búsquedas parciales.
- c) 1 campo adicional: `._keyword`, que almacena el valor exacto sin tokenizar.
- d) Ninguno; `search_as_you_type` es un alias que internamente usa un campo `text` con un analyzer personalizado.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: a) 2 campos adicionales: `._2gram` y `._3gram`, que indexan n-gramas de 2 y 3 términos para permitir búsquedas parciales.**

**Explicación:**
El tipo `search_as_you_type` genera automáticamente 2 subcampos adicionales:
- `<campo>._2gram`: indexa n-gramas de tamaño 2 (shingles de 2 términos).
- `<campo>._3gram`: indexa n-gramas de tamaño 3 (shingles de 3 términos).

Estos subcampos permiten que las queries de tipo `match` o `multi_match` con `bool_prefix` encuentren documentos incluso cuando el usuario ha escrito solo parte de una palabra o frase.

**Opciones incorrectas:**
- **b)** ❌ No genera `._4gram` como subcampo adicional; solo genera `._2gram` y `._3gram`.
- **c)** ❌ No genera un subcampo `._keyword`; eso lo hace el tipo `text` por defecto (subcampo `.keyword`).
- **d)** ❌ No es un simple alias; es un tipo nativo que materializa múltiples subcampos con distintas estrategias de indexación.

</details>

---

## Pregunta 7: Identificación del tipo de campo por consulta

**Se ejecuta la siguiente consulta sobre un índice en OpenSearch:**

```json
{
  "query": {
    "multi_match": {
      "query": "laptop gam",
      "type": "bool_prefix",
      "fields": ["nombre", "nombre._2gram", "nombre._3gram"]
    }
  }
}
```

**La consulta devuelve documentos que coinciden con `"laptop gam"` usando los subcampos `._2gram` y `._3gram`. ¿Sobre qué tipo de campo está indexado `nombre`?**

**Opciones:**

- a) Es de tipo `text`, porque `multi_match` es la forma habitual de consultar campos `text`.
- b) Es de tipo `keyword`, porque `keyword` genera subcampos `._2gram` y `._3gram` por defecto.
- c) Es de tipo `search_as_you_type`, porque es el único tipo que genera automáticamente los subcampos `._2gram` y `._3gram` para soportar consultas `bool_prefix`.
- d) Es de tipo `integer`, porque `bool_prefix` solo funciona sobre campos numéricos.

<details>
<summary>🔍 Ver solución</summary>

**Respuesta correcta: c) Es de tipo `search_as_you_type`, porque es el único tipo que genera automáticamente los subcampos `._2gram` y `._3gram` para soportar consultas `bool_prefix`.**

**Explicación:**
La consulta `multi_match` con `type: "bool_prefix"` apunta explícitamente a los subcampos `._2gram` y `._3gram`. Estos subcampos son la señal inequívoca de que `nombre` es de tipo `search_as_you_type`, ya que este tipo materializa automáticamente dichos subcampos. El modo `bool_prefix` permite que la última palabra de la consulta se trate como prefijo, buscando coincidencias en los n-gramas indexados.

**Opciones incorrectas:**
- **a)** ❌ Aunque `multi_match` se puede usar sobre `text`, un campo `text` por defecto **no** genera subcampos `._2gram` ni `._3gram`. La presencia de estos subcampos descarta `text` como tipo principal.
- **b)** ❌ `keyword` no genera subcampos `._2gram` ni `._3gram`; almacena el valor exacto sin tokenizar ni crear n-gramas.
- **d)** ❌ `bool_prefix` es un modo de consulta textual, no numérico; no tiene relación con campos `integer`.

</details>

---
