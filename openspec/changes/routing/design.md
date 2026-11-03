# Design

## Context

Hoy `src/` solo tiene `App.tsx` (un `<h1>`), `main.tsx`, `index.css` y `setup-tests.ts`; no existen `app/`, `shared/` ni librería de rutas. `docs/architecture.md` ya fija el patrón que este change materializa: un `<Modulo>Router.tsx` y un `<modulo>.routes.ts` por módulo, rutas base en `src/routes.ts`, y carga con `lazy` desde `App.tsx` (reglas 12, 15 y 16, hoy provisionales). Restricciones que condicionan el diseño:

- Un módulo no importa de otro ni de `src/routes.ts` (regla 7), por lo que sus rutas son relativas.
- `shared/` no sabe nada del negocio ni importa de `core/`, `proxy/`, `domain/` ni `store/` (regla 9).
- `data-layer` aún no existe: no hay loaders ni `QueryClient`.
- Cobertura mínima del 80 % (`vitest.config.ts`); `main.tsx` y `**/test-utils/**` están excluidos.

Motivación y alcance: ver `proposal.md`. El comportamiento exigible está en `specs/app-navigation/spec.md`.

## Goals / Non-Goals

**Goals:**

- Dejar fijado y probado el patrón router + layout + carga diferida con un módulo real, aunque sea temporal.
- Que el layout y el indicador de carga sean neutrales y reutilizables sin tocar el negocio.
- Dejar `architecture.md` sin reglas provisionales de ruteo.

**Non-Goals:**

- Loaders, actions o cualquier fetching por ruta (`data-layer`).
- Rutas protegidas o fuera del layout (login), error boundary y configuración del servidor.
- Diseño visual definitivo.

## Decisions

### React Router v7 en modo declarativo

`BrowserRouter` + `<Routes>` anidados. Encaja con la estructura ya escrita: `XRouter.tsx` es un componente con sus propias `<Routes>` y `App.tsx` solo monta `${appRoutes.x}/*`.

- **Alternativa: modo data (`createBrowserRouter`)**. Obliga a que `XRouter` sea un array de objetos de ruta y a reescribir la regla 15; sus loaders se solaparían con `data-layer`.
- **Alternativa: TanStack Router**. Su fuerte es el árbol tipado y el file-based routing, que choca con `routes.ts` y con módulos autocontenidos.

### `BrowserRouter` en `main.tsx`, no en `App.tsx`

`App.tsx` solo declara las rutas. Si `App` creara su propio `BrowserRouter`, los tests no podrían inyectar un `MemoryRouter` y no se podrían probar el redirect ni el 404.

### `RootLayout` neutral con `children`, y el `Suspense` como hijo

```tsx
<RootLayout appName="Finanzas personales" navItems={navItems}>
  <Suspense fallback={<Spinner />}>
    <Routes>…</Routes>
  </Suspense>
</RootLayout>
```

`Suspense` captura por posición en el árbol de render: sube hasta el ancestro más cercano, sin importar dónde se declaró el `lazy`. Como el `Suspense` es hijo del layout, el header queda fuera del límite de carga y no se esconde; si envolviera el layout entero, sí se escondería. `RootLayout` recibe `appName` y `navItems` por props, así que no conoce `appRoutes` ni el nombre de la app (la regla 10 le impide importar `@/routes`) y vive en `shared/components/`. `NavItem` (`{ label, to }`) se exporta desde `RootLayout.tsx`; la navbar usa `<nav aria-label>` y `NavLink`, que marca `aria-current="page"` en el activo.

- **Alternativa: `RootLayout` como ruta de layout con `Outlet`** (con el `Suspense` dentro del layout, o en una segunda ruta sin path). Funciona y es idiomático, pero añade anidación, JSX en línea o un componente `SuspenseOutlet`, para resolver un caso (rutas sin header) que todavía no existe. `<Suspense>` tampoco puede ser hijo directo de `<Route>`: `<Routes>` solo admite `<Route>` o `<Fragment>`, porque las rutas son configuración y no un árbol de render.
- **Alternativa: `Suspense` por encima del layout**. Esconde el header mientras carga un módulo.
- **Cuando llegue el login**: una ruta sin header necesita su propio `Suspense`, como ruta hermana del layout y no colgada del que está dentro. Se resolverá en ese change, por ejemplo con un `PublicRoutes` y un `PrivateRoutes` como componentes con `<Routes>` descendientes.

### Rutas en dos niveles, con `generatePath`

- `src/routes.ts`: `appRoutes = { example: '/example' } as const`, absoluto; lo usan `App.tsx` (montaje, `navItems`, redirect).
- `app/example/example.routes.ts`: `exampleRoutes = { detail: 'detail/:id' } as const`, relativo; el módulo no sabe dónde está montado.
- Los links del módulo usan `generatePath(EXAMPLE_appRoutes.detail, { id })`, de modo que el patrón tiene una sola fuente. Al ser `as const`, TypeScript infiere los parámetros. Comprobado en Node con `react-router` 7.18.5: `generatePath('detail/:id', { id: 2 })` devuelve `detail/2` (relativo, acepta números) y lanza `Missing ":id" param` si falta el parámetro.

### `Spinner`, `NotFoundPage` y helper de test, en `shared/`

- `Spinner` (`shared/components/Spinner/`): anillo con borde `sky-200` y tramo `sky-500`, `animate-spin` con `motion-reduce:animate-none`, `role="status"` y texto con `sr-only` tomado de la prop `label` (por defecto "Cargando…"). Se centra solo: un contenedor de bloque (`flex justify-center`, con margen vertical) centra la espiral en el área de contenido, de modo que `App.tsx` pasa `<Spinner />` sin estilos. No lleva fondo ni cubre nada: es un reemplazo del contenido, y el header y la navegación quedan visibles. Un overlay sobre contenido existente (peticiones al backend) es un envoltorio aparte que se decide en `data-layer`.
- `NotFoundPage` (`shared/components/NotFoundPage/`): props `title`, `message`, `linkLabel` y `linkTo` con valores por defecto en español (`linkTo` por defecto `/`).
- `shared/test-utils/render-with-router.tsx`: envuelve en `MemoryRouter` con una ruta inicial opcional. Va en `shared/` porque no usa nada de la app (regla 19). Está excluido de cobertura y del lint de tipos de retorno por la configuración existente.

### `/` redirige con `<Navigate replace />`

Evita una `HomePage` suelta, que no tiene dónde vivir con la regla 12 (`App.tsx` solo toca routers de módulos). Se borra junto a `example`; el primer módulo real hereda el redirect o lo cambia. Un dashboard real sería su propio módulo.

### Módulo `example` temporal, con dos rutas

Un índice y un detalle con parámetro ejercitan los paths relativos, `generatePath`, el `Link` dentro del módulo y la carga `lazy` con `Suspense`. Con una sola ruta no se probaría nada de eso. `ExampleRouter` exporta por defecto (lo exige `lazy`). Sus páginas **no** son `lazy`: el módulo ya es un chunk aparte y dividir además las páginas es adelantarse. Si una página lo justificara, el módulo pondría su propio `Suspense`; como el más cercano gana, no entra en conflicto con el de `App.tsx`. Se borra en el change del primer módulo real: `app/example/` y su entrada en `appRoutes`; los tests de `App` y de `shared/` sobreviven.

### Tests

- `shared/` (`RootLayout`, `Spinner`, `NotFoundPage`): un test por componente con `renderWithRouter` donde haga falta router (`NavLink`, `Link`).
- `app/example/`: tests de las dos páginas y del router, con la regla 17 (`__tests__/` por componente; el del router en la raíz del módulo).
- `App`: redirect de `/`, 404, `navItems` en el header, carga del módulo `lazy` (con `findBy`, porque es asíncrona) y spinner mientras carga. El test actual del `<h1>` desaparece porque el título pasa al header.

## Risks / Trade-offs

- [El link de vuelta `..` se resuelve por jerarquía de rutas, no por segmentos de URL, y con un módulo bajo `/example/*` puede sorprender] → Se cubre con un test de navegación del detalle al índice; si falla, se usa `relative="path"` o un link absoluto por props.
- [`generatePath` con un patrón relativo dentro de `<Routes>` anidadas solo se ha probado como función, no como `Link` montado] → Un test navega del índice al detalle y comprueba la URL final.
- [El fallback en transiciones de navegación: React Router v7 actualiza el estado con `startTransition`, y React puede mantener la pantalla anterior en vez de mostrar el fallback] → No cambia el diseño; solo se ve el spinner siempre en la primera carga. Solo se comprueba en un navegador y se informa como no verificado.
- [`example` es código sin función de negocio que alguien podría tomar por permanente] → Se anota como temporal en `architecture.md` y en las tasks del primer módulo real.
- [Sin error boundary, un fallo al descargar un chunk rompe la app] → Fuera de alcance; queda en "Decisiones abiertas" como pendiente antes del primer deploy, junto al rewrite del servidor que `BrowserRouter` necesita en un hosting estático.
- [Una ruta fuera del layout (login) no estará bajo el `Suspense` del layout] → Necesitará el suyo; se resuelve en el change de autenticación.

## Open Questions

- Si el `Suspense` del layout y el de una rama pública (login) deben extraerse a un componente compartido: depende de cuántas ramas haya; se decide en el change de autenticación.
