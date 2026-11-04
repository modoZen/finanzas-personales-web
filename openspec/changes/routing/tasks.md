# Tasks

## 1. Dependencia, rutas base y helper de test

- [x] 1.1 Instalar `react-router` v7 con `npm install react-router@7` y verificar que aparece en `dependencies` de `package.json`, que `package-lock.json` se actualiza y que `npm run build` sigue pasando
- [x] 1.2 Crear `src/routes.ts` con `appRoutes = { example: '/example' } as const` y verificar que `npx tsc -b` pasa y que `npm run lint` no reporta nada en el archivo
- [x] 1.3 Crear `src/shared/test-utils/render-with-router.tsx`, un helper de render que envuelve en `MemoryRouter` con ruta inicial opcional, y verificar que `npm run lint` y `npx tsc -b` pasan y que no importa nada fuera de `shared/` (regla 9)

## 2. Componentes de `shared/`

- [x] 2.1 Crear `shared/components/Spinner/Spinner.tsx` (`label` por defecto "Cargando…", `role="status"`, texto `sr-only`, `animate-spin` con `motion-reduce:animate-none`, azul `sky`, contenedor de bloque que centra la espiral con `flex justify-center`) y su test en `__tests__/Spinner.test.tsx`; verificar que el test comprueba el rol, el texto accesible por defecto y por prop, la clase de animación y que el contenedor centra la espiral, y que `npx vitest run src/shared/components/Spinner` pasa
- [x] 2.2 Crear `shared/components/NotFoundPage/NotFoundPage.tsx` (props `title`, `message`, `linkLabel` y `linkTo` con valores por defecto en español, `linkTo` por defecto `/`) y su test; verificar que el test comprueba los textos por defecto, que se pueden sobrescribir y que el enlace apunta a `/`, y que `npx vitest run src/shared/components/NotFoundPage` pasa
- [x] 2.3 Crear `shared/components/RootLayout/RootLayout.tsx` (props `appName`, `navItems` y `children`; exporta el tipo `NavItem`; header con el nombre, `<nav aria-label>` con `NavLink` y `children` bajo el header) y su test; verificar que el test comprueba el nombre de la app, un enlace por cada `navItem`, que el enlace activo lleva `aria-current="page"`, que la navegación tiene nombre accesible y que los `children` se renderizan, y que `npx vitest run src/shared/components/RootLayout` pasa

## 3. Módulo `example` (temporal)

- [x] 3.1 Crear `app/example/example.routes.ts` con `exampleRoutes = { detail: 'detail/:id' } as const` y verificar que `npx tsc -b` pasa
- [x] 3.2 Crear `app/example/pages/ExamplePage/ExamplePage.tsx` y su test: lista con enlaces al detalle construidos con `generatePath(exampleRoutes.detail, { id })`; verificar que el test comprueba que cada enlace apunta a `detail/<id>` y que `npx vitest run src/app/example/pages/ExamplePage` pasa
- [x] 3.3 Crear `app/example/pages/ExampleDetailPage/ExampleDetailPage.tsx` y su test: muestra el `id` de `useParams` y un enlace de vuelta al índice; verificar que el test renderiza la ruta `detail/:id`, comprueba el `id` mostrado, y que el enlace de vuelta lleva al índice (si `..` no resuelve a `/example` bajo una ruta `/example/*`, usar `relative="path"` y anotarlo), y que `npx vitest run src/app/example/pages/ExampleDetailPage` pasa
- [x] 3.4 Crear `app/example/ExampleRouter.tsx` (export por defecto; `<Routes>` con la ruta índice y `exampleRoutes.detail`) y su test en `app/example/__tests__/ExampleRouter.test.tsx`; verificar que el test monta el router bajo `/example/*` y navega del índice al detalle comprobando la URL final `/example/detail/<id>` y el contenido, y que `npx vitest run src/app/example` pasa

## 4. Integración en `App`, `main` y documentación

- [x] 4.1 Reescribir `src/App.tsx`: `RootLayout` con `appName` "Finanzas personales" y `navItems` desde `appRoutes`, `Suspense` con `<Spinner />` como hijo, y dentro las `Routes`: `/` con `<Navigate to={appRoutes.example} replace />`, `${appRoutes.example}/*` con `lazy(() => import('@/app/example/ExampleRouter'))` y `*` con `NotFoundPage`; verificar que `npx tsc -b` y `npm run lint` pasan
- [x] 4.2 Envolver `<App />` en `<BrowserRouter>` en `src/main.tsx` y verificar que `npm run build` pasa y que `npm run dev` arranca sin errores en la consola del servidor
- [x] 4.3 Reemplazar `src/__tests__/App.test.tsx` por tests con `renderWithRouter`: `/` termina en el módulo inicial; una ruta inexistente muestra la página de no encontrada con header y navegación; el header muestra el nombre y los `navItems`; mientras el módulo `lazy` carga se ve el `Spinner` y luego el contenido (`findBy`); verificar que `npx vitest run src/__tests__` pasa
- [x] 4.4 Actualizar `docs/architecture.md`: quitar "provisional" de las reglas 12, 15 y 16; reescribir la 15 (los módulos se cargan con `lazy` desde `App.tsx`; un `Suspense` con fallback envuelve las `Routes` y se pasa como `children` de `RootLayout`, así el header queda fuera del límite de carga; dentro de un módulo las páginas son `lazy` solo si lo justifican y entonces el módulo pone su propio `Suspense`); reflejar `BrowserRouter` en `main.tsx`; anotar `app/example/` como temporal; y añadir a "Decisiones abiertas" el error boundary y el rewrite del servidor para `BrowserRouter`, ambos antes del primer deploy. Verificar que `grep -n "provisional" docs/architecture.md` ya no menciona `routing`, que `npx prettier --check docs/architecture.md` pasa y que lo descrito coincide con la estructura real de `src/`

- [x] 4.5 Añadir a `docs/conventions.md` la convención 6 («Constantes: camelCase, sin `UPPER_CASE`; los objetos fijos se declaran `as const`, como `appRoutes` y `exampleRoutes`»); verificar que `npx prettier --check docs/conventions.md` pasa, que la numeración sigue a la convención 5, y que `grep -rnE "\b[A-Z][A-Z_]{2,} = " src` no devuelve constantes en mayúsculas

## 5. Verificación final

- [x] 5.1 Verificar que `npm run lint`, `npm run format:check`, `npm run build` y `npm run test:coverage` pasan con los umbrales del 80 %, y que `dist/assets` contiene un chunk aparte para `example` (por ejemplo `ls dist/assets | grep -i example` o inspeccionar el resultado de `vite build`)
- [x] 5.2 Comprobar que el change respeta `docs/architecture.md` y `docs/conventions.md`: ningún módulo importa de otro ni de `@/routes`, `shared/` no importa de `core/`, `proxy/`, `domain/` ni `store/`, imports con `@/` entre carpetas de primer nivel y relativos dentro de la misma, componentes `const X: FC<Props>`, sin `enum`, y tests en `__tests__/` con el nombre de lo que prueban; verificar con `grep -rn "from '@/" src/shared src/app` y una lectura de las carpetas
- [x] 5.3 Informar de lo que no se pudo verificar: el aspecto del spinner y del layout, el historial al navegar y el fallback en transiciones, que solo se ven en un navegador

## Workflow follow-up

- Archivar el change con `/opsx:archive` una vez verificado.
- El change del primer módulo real borra `app/example/` y su entrada en `appRoutes`, y decide si conserva el redirect de `/`.
- Changes pendientes antes del primer deploy: error boundary y rewrite del servidor para `BrowserRouter`.
