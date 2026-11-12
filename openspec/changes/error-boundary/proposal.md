# Proposal

## Why

Hoy, si un módulo lanza un error al renderizar o falla la descarga de su chunk (el `import()` de `lazy` rechaza), React desmonta todo el árbol y el usuario se queda con una pantalla en blanco, sin header ni forma de saber qué pasó. `docs/architecture.md` deja esta decisión abierta y exige cerrarla antes del primer deploy, que es cuando una descarga fallida (por ejemplo, porque un despliegue nuevo cambió el hash de un chunk) deja de ser teórica.

## What Changes

- Instalar `react-error-boundary` como dependencia de producción. Se elige la librería y no una clase propia: una clase rompería la convención 1 de `docs/conventions.md` (componentes como `const X: FC`) y obligaría a abrir una excepción, y la librería ya trae `resetKeys`.
- Crear `src/shared/components/ErrorFallback/ErrorFallback.tsx`: sin props, muestra un mensaje fijo en español (sin `error.message` ni stack) y un único botón «Recargar página» que llama a `window.location.reload()`. Reutiliza `ErrorMessage`. Con su test.
- En `App.tsx`, envolver el `Suspense` con el `ErrorBoundary`, dentro de `RootLayout`, de modo que el header y la navegación sigan visibles. El boundary se limpia al cambiar de ruta (`resetKeys` con el `pathname` de `useLocation`). Se amplía su test con tres casos: un módulo que lanza al renderizar, un `import()` que rechaza (en un archivo de test aparte) y el reset al hacer clic en un enlace del header.
- Actualizar `docs/architecture.md`: quitar el error boundary de las decisiones abiertas y reflejarlo en la regla 15, que describe el árbol de `App`.
- Actualizar `docs/conventions.md`: añadir a la convención 7 («Mocks») el uso de `vi.stubGlobal` para APIs del navegador que no se pueden espiar.
- Fuera de alcance:
  - Errores de handlers y de código asíncrono, y de consultas y mutaciones de Query (`throwOnError`): van en el change `error-handling`.
  - Logging o reporte remoto de errores.
  - Un boundary adicional en `main.tsx`: ahí no hay router y el fallback no podría tener enlaces; la capa más externa que se cubre es la de `App`.
  - La configuración del servidor para el `BrowserRouter`, que sigue como decisión abierta antes del primer deploy.
  - Un botón «Reintentar»: no sirve para un chunk que falló (`lazy` cachea el rechazo) y casi nunca para un fallo de render; se sumará si aparece un error transitorio real.

## Capabilities

### New Capabilities

<!-- Ninguna: es comportamiento de la navegación y la carga de módulos que ya cubre `app-navigation`. -->

### Modified Capabilities

- `app-navigation`: nuevo requisito: un fallo al renderizar o al descargar un módulo muestra un aviso con la opción de recargar, sin ocultar el header ni la navegación, y el aviso desaparece al cambiar de ruta.

## Impact

- **Archivos nuevos**: `src/shared/components/ErrorFallback/` (componente y test) y un archivo de test aparte en `src/__tests__/` para el `import()` que rechaza.
- **Archivos modificados**: `src/App.tsx`, `src/__tests__/App.test.tsx`, `docs/architecture.md`, `docs/conventions.md`, `package.json` y `package-lock.json`.
- **Dependencias**: `react-error-boundary` (peer: React 18 o 19). Entra en el bundle principal, porque `App` se carga siempre; se comprueba su tamaño en el build.
- **Estructura**: no nace ninguna carpeta global; `ErrorFallback` va en `shared/components/` porque no conoce el negocio (regla 1).
- **Verificación**: lint, formato, build y tests con cobertura (umbral 80 %). Lo que solo se ve en un navegador (el aspecto del fallback y una recarga real tras una descarga fallida) queda sin verificar y se informa como tal.
