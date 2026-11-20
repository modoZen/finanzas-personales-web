# Proposal

## Why

Los próximos cuatro changes crean los componentes del Design System «Yupana» sobre los tokens de
`index.css`. Los tests de jsdom comprueban comportamiento, no estilos, y hoy un componente solo se
ve dentro de una página real, con datos y estados difíciles de provocar. Hace falta un lugar donde
ver cada componente con todas sus variantes y estados, para compararlo con el DS, sin añadir
Storybook (dependencias, configuración y un tercer archivo por componente) y sin que ese lugar
llegue a producción.

## What Changes

- Nuevo módulo `app/gallery/` con un router y una única página, `GalleryPage`, escrita solo con
  JSX. No tiene hooks de datos, proxy ni dominio.
- La página nace con tres secciones: tokens (colores, estilos de texto, radios y sombras de
  `@theme`), `Spinner`, `ErrorMessage` y `ErrorFallback`. Cada change de componentes posterior añade
  su sección.
- `App.tsx` registra la ruta `/gallery` y su enlace en la navegación solo si
  `import.meta.env.DEV`, y carga el módulo con `lazy` dentro de esa condición, de modo que el
  bundler elimine el `import()` en producción.
- `routes.ts` añade `appRoutes.gallery`.
- Verificación en el build: el texto propio de la galería no aparece en `dist/` tras
  `npm run build`, y sí aparece en un build en modo `development` (la prueba de contraste).
- `docs/architecture.md` documenta el módulo solo-DEV y su excepción de montaje.

Fuera de alcance: Storybook; las secciones de los componentes que aún no existen; `NotFoundPage` y
`RootLayout` (son de página completa y su sección llegará con el change de navegación); migrar a
tokens los componentes existentes (lo hace cada change de familia).

## Capabilities

### New Capabilities

- `dev-gallery`: página de desarrollo que muestra los tokens y los componentes compartidos con sus
  variantes y estados, disponible solo en desarrollo y ausente del bundle de producción.

### Modified Capabilities

<!-- Ninguna: `app-navigation` describe los módulos de la aplicación; la galería no existe en
     producción, así que sus requisitos no cambian. -->

## Impact

- Código: `src/App.tsx`, `src/routes.ts`, `src/__tests__/App.test.tsx`, nuevo `src/app/gallery/`.
- Documentación: `docs/architecture.md`.
- Dependencias: ninguna.
- Producción: sin cambios en el bundle; se verifica en el build.
