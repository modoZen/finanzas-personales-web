# Proposal

## Why

La app es hoy un único `<h1>` sin rutas: no hay forma de navegar, ni de cargar módulos bajo demanda, ni de mostrar un 404. Las reglas 12, 15 y 16 de `docs/architecture.md` quedaron provisionales a la espera de este change, y los próximos changes de negocio necesitan un router sobre el que colgar sus módulos. Conviene fijar ahora el patrón (router, layout, carga diferida) y probarlo con un módulo real, aunque sea de relleno, antes de que haya código de negocio que lo dependa.

## What Changes

- Instalar `react-router` (v7) y usarlo en **modo declarativo**: `BrowserRouter` en `main.tsx`, `<Routes>` en `App.tsx`.
- Crear `src/routes.ts` con las rutas base de cada módulo como constantes `as const` (`appRoutes = { example: '/example' }`).
- Reescribir `App.tsx` como `RootLayout` con un `Suspense` (fallback `Spinner`) como hijo, que envuelve las `Routes`. El `Suspense` queda dentro del layout para que el header no se esconda mientras carga un módulo. Las rutas son: `/` redirige a `appRoutes.example` con `<Navigate replace />`, `${appRoutes.example}/*` carga `ExampleRouter` con `lazy`, y `*` muestra `NotFoundPage`.
- Crear en `shared/components/` tres componentes neutrales, sin conocimiento del negocio:
  - `RootLayout`: header con `appName` y una `<nav aria-label>` con `navItems` (`NavLink`), más `children`. Exporta el tipo `NavItem` (`{ label, to }`).
  - `Spinner`: espiral giratoria en azul `sky`, solo en modo inline, con `role="status"` y texto accesible por prop (`label`, por defecto "Cargando…"). Respeta `motion-reduce`.
  - `NotFoundPage`: texto y enlace por props con valores por defecto en español.
- Crear `shared/test-utils/` con un helper de render que envuelve en `MemoryRouter`.
- Crear el módulo **temporal** `app/example/` con `ExampleRouter`, `example.routes.ts` (`exampleRoutes`, paths relativos), `pages/ExamplePage` y `pages/ExampleDetailPage` (ruta con parámetro). Los links del módulo usan `generatePath` con las constantes. El módulo existe para probar el patrón completo y se borra en el change del primer módulo real.
- Actualizar `docs/architecture.md`: quitar "provisional" de las reglas 12, 15 y 16, reescribir la 15 (el `Suspense` va dentro de `RootLayout`; las páginas de un módulo solo son `lazy` si lo justifican y entonces el módulo pone su `Suspense`), reflejar `BrowserRouter` en `main.tsx`, anotar `example` como temporal y añadir a "Decisiones abiertas" el error boundary y el rewrite del servidor para `BrowserRouter`, ambos pendientes antes del primer deploy.
- Añadir a `docs/conventions.md` la convención 6: las constantes se nombran en camelCase (`appRoutes`, `exampleRoutes`) y los objetos fijos llevan `as const`; no se usa `UPPER_CASE`.
- Reemplazar el test de `App` (que comprobaba el `<h1>`) por tests de la navegación.
- Fuera de alcance:
  - Error boundary y rewrite del servidor: quedan como decisiones abiertas antes del primer deploy.
  - Rutas protegidas, login y rutas fuera del layout: nacen con el change de autenticación.
  - `data-layer`, `store/` y cualquier módulo de negocio.
  - Diseño visual definitivo (barra lateral, responsive, tema).

## Capabilities

### New Capabilities

- `app-navigation`: navegación de la aplicación: layout común con header y navbar, redirección de la raíz, página de ruta no encontrada, y carga diferida de módulos con indicador de carga.

### Modified Capabilities

<!-- Ninguna: el proyecto aún no tiene specs. -->

## Impact

- **Archivos nuevos**: `src/routes.ts`, `src/shared/components/{RootLayout,Spinner,NotFoundPage}/`, `src/shared/test-utils/`, `src/app/example/` (router, rutas y dos páginas), con sus tests.
- **Archivos modificados**: `src/App.tsx`, `src/main.tsx`, `src/__tests__/App.test.tsx`, `docs/architecture.md`, `docs/conventions.md`, `package.json` y `package-lock.json`.
- **Dependencias**: `react-router` (v7).
- **Estructura**: nacen `app/`, `shared/components/` y `shared/test-utils/`, que no existían.
- **Verificación**: lint, build, tests con cobertura (umbral 80 %) y que `vite build` genera un chunk aparte para `example`. Lo que solo se ve en un navegador (aspecto del spinner, historial, fallback en transiciones) queda sin verificar y se informa como tal.
