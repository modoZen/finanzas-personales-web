# Tasks

## 1. Fuente

- [x] 1.1 Instalar `@fontsource-variable/plus-jakarta-sans` como dependencia y verificar que aparece en `dependencies` de `package.json` y que `npm ls @fontsource-variable/plus-jakarta-sans` la resuelve sin errores.
- [x] 1.2 En `src/index.css`, tras `@import 'tailwindcss'`, importar la fuente y abrir un bloque `@theme` (sin `static`) con `--font-sans` (nombre de familia confirmado en el CSS del paquete, con `system-ui` de respaldo). Verificar con `npm run build` sin errores, con el `@font-face` en el CSS de `dist/` y con el `.woff2` emitido en `dist/assets/`.

## 2. Tokens

- [x] 2.1 Añadir los 20 colores del DS como `--color-*` con sus nombres y valores exactos. Verificar comparando uno a uno con `project/tokens.json` del DS «Yupana».
- [x] 2.2 Añadir los 5 radios (`--radius-sm/md/lg/xl/pill`) y las 4 sombras (`--shadow-card/raised/fab/modal`). Verificar comparando uno a uno con `tokens.json`.
- [x] 2.3 Añadir los 7 estilos de texto (`--text-display`… `--text-small`) con sus complementos `--line-height`, `--font-weight` y `--letter-spacing`. Verificar comparando uno a uno con `tokens.json`.
- [x] 2.4 Comprobar la compilación de todos los tokens: crear un archivo temporal dentro del proyecto con una utilidad por token (`bg-*`/`text-*` de cada color, `rounded-*`, `shadow-*`, `text-*` de cada estilo), ejecutar `npm run build`, verificar con `grep` que el CSS de `dist/` contiene cada variable con su valor y que cada estilo de texto genera tamaño, interlineado, peso e interletraje, y borrar el archivo. Verificar con `git status` que no queda ningún archivo temporal.
- [x] 2.5 Actualizar `docs/architecture.md`: añadir `index.css` a la estructura de `src/` y una regla de estilos (tokens en `@theme` de `src/index.css`, nombrados por propósito, los componentes usan sus utilidades en lugar de la paleta por defecto, que se conserva hasta migrar). Verificar leyendo el documento: la numeración sigue sin saltos y `npm run format:check` pasa.

## 3. Verificación integral

- [x] 3.1 Ejecutar `npm run lint`, `npm run format:check`, `npm test` y `npm run build` y verificar que los cuatro terminan sin errores.
- [x] 3.2 Confirmada por el usuario en el navegador: con `npm run dev`, comprobar en el navegador que el texto se muestra en Plus Jakarta Sans (DevTools, fuentes calculadas) y que `rounded-md` de `ErrorMessage` mide 14 px. La hace el usuario; Claude no la marca como hecha.

## Workflow follow-up

- Al terminar cada grupo de tareas, Claude se detiene y da el mensaje de commit propuesto; el usuario hace el commit. Claude no ejecuta `git commit` ni `git push`.
- Archivar el change con `/opsx:archive` una vez implementado.
