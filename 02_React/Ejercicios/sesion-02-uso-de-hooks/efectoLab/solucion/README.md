# 🧪 EfectoLab — solución de referencia

Laboratorio interactivo sobre `useEffect` (efecto incondicional, de montaje y
condicional), re-render vs re-montaje, `localStorage` y Context API.

## Arranque

```bash
npm install
npm run dev     # http://localhost:5173
npm run lint
npm run build
```

## Mapa rápido del código

| Archivo | Qué demuestra |
|---|---|
| `src/App.jsx` | Efecto **incondicional** (sin array), `useRef` como contador de renders, `key` para forzar re-montajes |
| `src/context/sesion/SesionProvider.jsx` | Estado compartido que sobrevive al desmontaje de los paneles, efectos **condicionales** con y sin limpieza |
| `src/hooks/useEstadoPersistente.js` | `useState` + `localStorage`: hidratación perezosa, guardado condicional y evento `storage` |
| `src/hooks/useCicloDeVida.js` | Efecto de **montaje** con limpieza; identidad de instancia vs número de render |
| `src/components/PanelTemporizador.jsx` | Contador global (contexto) frente a contador local (`useState`) |
| `src/components/PanelNotas.jsx` | Autoguardado con *debounce*: efecto condicional cuya limpieza cancela el guardado anterior |
| `src/components/PanelEstadisticas.jsx` | Qué hay realmente guardado en el navegador y qué sobrevive a qué |

> `StrictMode` está activado a propósito: en desarrollo verás cada montaje
> duplicado en la bitácora. Es la forma que tiene React de delatar efectos sin
> función de limpieza.
