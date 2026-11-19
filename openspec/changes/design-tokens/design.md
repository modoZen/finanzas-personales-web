# Design

## Context

- Tailwind v4 ya está instalado (`tailwindcss`, `@tailwindcss/vite`), sin `tailwind.config`. `src/index.css` solo contiene `@import 'tailwindcss'` y `main.tsx` lo importa.
- `prettier.config.ts` apunta `tailwindStylesheet` a `./src/index.css`, así que el plugin conocerá los tokens sin tocar su configuración.
- El código existente usa la paleta por defecto (19 usos de `sky-*`, `red-*`…) y `rounded-md` en 8 sitios (ver proposal.md, Impact).
- Los valores exactos están en `tokens.json` del Design System «Yupana» (versión 1, tema «Claro»). El repo no versiona el DS: copia los valores y pasa a ser la fuente de verdad.

## Goals / Non-Goals

**Goals:**

- Que cada token del DS sea una utilidad de Tailwind con el mismo nombre (`bg-surface`, `text-ink`, `rounded-xl`, `shadow-card`, `text-heading`).
- Que la tipografía se sirva desde el propio dominio.

**Non-Goals:**

- Migrar los componentes existentes a los tokens.
- Cualquier cosa que cambie comportamiento: no hay specs en este change.

## Decisions

### Los tokens viven en `@theme` dentro de `src/index.css`

Un solo archivo, sin `tailwind.config.js` ni carpeta `styles/`. `index.css` ya es el único CSS global, y una carpeta de primer nivel con un archivo iría contra la regla 3 de `architecture.md`. Cuando aparezca otro CSS global (reset, animaciones) se separa con su propio change.

Orden del archivo: `@import 'tailwindcss'`, el import de la fuente y el bloque `@theme`.

*Alternativas:* `src/theme.css` o `src/styles/theme.css` importado desde `index.css` (descartadas por lo anterior); `tailwind.config.js` con `@config` (modo heredado de v3).

### Nombres exactos del DS, por propósito

Los tokens conservan el nombre del DS (`--color-bg`, `--color-primary-soft`, `--color-control-border`…). Se nombran por lo que significan, no por su valor. Así, cambiar el azul no obliga a renombrar nada. La regla pasa a `architecture.md`.

### `@theme` normal, sin `static`

Tailwind v4 solo emite en el CSS final las variables que alguna clase usa. Hoy nada usa los tokens con `var()` fuera de las clases, así que no hace falta `static`. Cuando aparezca ese uso (por ejemplo, colores para los gráficos de Análisis), se añade `static` en su propio change, con su motivo.

Consecuencia: un token que ninguna clase usa todavía no aparece en el CSS compilado. Por eso la verificación contra el DS se hace con un archivo temporal que lista las utilidades de todos los tokens (ver tasks.md), y no con una búsqueda en `dist/`.

*Alternativa:* `@theme static`, que emite todas las variables (unas 90 líneas) y permite usar `var(--color-primary)` sin utilidad. Descartada hasta que haya ese uso.

### Espaciado: no se define

`space-1…8` del DS (4, 8, 12, 16, 20, 24, 32 px) coinciden con la escala nativa (`p-N` = N × 4 px). Redefinirlos duplicaría la fuente de verdad sin cambiar nada.

### Los radios del DS pisan los de Tailwind

El DS llama `radius-sm/md/lg/xl` a 8, 14, 16 y 24 px, y Tailwind ya define esos nombres con otros valores. Se respetan los nombres del DS para que `rounded-xl` sea la tarjeta de 24 px. `--radius-pill` es nuevo (`rounded-pill`).

### Estilos de texto como `--text-*`

Cada estilo declara `--text-<nombre>` (tamaño) y los complementos `--text-<nombre>--line-height`, `--font-weight` y `--letter-spacing`. Resultan las utilidades `text-display`, `text-title`, `text-heading`, `text-body-strong`, `text-body`, `text-caption` y `text-small`. Las cifras tabulares no son un token: se usa la utilidad `tabular-nums` donde haya montos.

### Fuente con `@fontsource-variable/plus-jakarta-sans`

Se importa desde `index.css`, y `--font-sans` apunta a `'Plus Jakarta Sans Variable'` con `system-ui` de respaldo. Es una fuente variable: un archivo cubre 500 a 800 y el navegador solo baja el subset que usa. El nombre exacto de la familia se confirma al instalar.

*Alternativas:* Google Fonts por CDN (dos peticiones externas, no funciona sin conexión y comparte las visitas con un tercero); `@font-face` a mano (mismo resultado con mantenimiento manual).

### La paleta por defecto se conserva

No se escribe `--color-*: initial`. Los 19 usos actuales de `sky-*`/`red-*` siguen compilando, y desaparecerán cuando los componentes se migren. Reiniciar la paleta ahora rompería esas clases sin que ningún componente nuevo las sustituya.

## Risks / Trade-offs

- [Los componentes actuales cambian de aspecto: `rounded-md` de 6 a 14 px y la nueva fuente] → Es un efecto aceptado y está en el proposal. `ErrorMessage`, `ErrorFallback` y `example/` se corrigen en los changes siguientes; ningún test comprueba estilos.
- [Un valor mal copiado del DS, sin test que lo detecte] → Los tokens se verifican contra `tokens.json` del DS al aplicar (comprobación 1 a 1) y compilando un archivo temporal con las utilidades de todos los tokens; el aspecto lo confirma el usuario en el navegador.
- [`dist` crece por los archivos de otros subsets de la fuente] → El navegador no los descarga; si molesta, se importa solo el subset `latin` (ver Open Questions).
- [Duplicar valores del DS: si el DS cambia, el repo no se entera] → Aceptado: el repo es la fuente de verdad y los cambios de diseño entran con su propio change.

## Open Questions

- Especificador exacto del import de la fuente (paquete completo o solo el subset `latin`) y nombre final de la familia. Se resuelve al instalar y no cambia el enfoque ni las tareas.
