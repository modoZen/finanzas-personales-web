# Design

## Context

- `App.tsx` carga cada módulo con `lazy` a nivel de módulo y monta sus rutas dentro de `Routes`; la navegación es una constante `navItems`. `routes.ts` guarda las rutas base (`appRoutes`).
- `tsconfig.app.json` ya incluye `vite/client`, así que `import.meta.env.DEV` tiene tipo. Vitest corre con `DEV` en `true`.
- Tailwind v4 genera CSS a partir de las clases que encuentra en los **archivos fuente** del proyecto, no del bundle de JavaScript. Los tokens de `@theme` que ninguna clase usa no se emiten (ver el change archivado `design-tokens`).
- Las reglas de `architecture.md` que importan aquí: 5 (módulo mínimo = router + `pages/`), 3 (las carpetas nacen cuando se usan), 7 (un módulo puede importar `shared/`, `core/`), 15 y 17.

## Goals / Non-Goals

**Goals:**

- Que `GalleryPage` sea una sola página con JSX, sin hooks de datos, y que cada change de componentes añada su sección sin tocar nada más.
- Que, con la galería registrada solo en DEV, el JavaScript de producción no contenga nada de ella, y que eso se pueda comprobar con un comando.

**Non-Goals:**

- Sustituir los tests por la galería: sigue sin haber comprobación de estilos automática.
- Que la galería sea interactiva (controles para cambiar props): son muestras estáticas, cada variante visible a la vez.

## Decisions

### Módulo `app/gallery/` permanente, mínimo

```
app/gallery/
  GalleryRouter.tsx
  pages/GalleryPage/GalleryPage.tsx
```

Es un módulo como los demás (router con `Routes`, una ruta `index`), a diferencia de `app/example/`, que es temporal. No lleva `gallery.routes.ts`: la regla 16 pide el archivo para las rutas relativas del módulo y este solo tiene la ruta `index`, así que no habría nada que declarar (regla 3). Si algún día tiene subrutas, nace entonces.

*Alternativa:* una página suelta en `shared/` o directamente en `App.tsx`. Se descarta porque `shared/` no debe saber de rutas y porque `App.tsx` solo toca de un módulo su router y su archivo de rutas (regla 12).

### La galería es una sola página con JSX literal

`GalleryPage.tsx` contiene todas las secciones como JSX, sin componentes auxiliares: un componente por archivo y carpeta (regla 17) obligaría a una carpeta por sección, justo la estructura que se quiere evitar. Las muestras repetidas (colores, estilos de texto, radios, sombras) se generan con `.map` sobre arrays literales declarados en el mismo archivo.

Esos arrays guardan el **nombre del token y la clase completa como texto literal** (`'bg-income-soft'`, no `` `bg-${name}` ``): Tailwind solo detecta clases que aparecen enteras en el código, y una clase construida no se generaría.

Cada sección es un `<section aria-labelledby>` con su `h2`, que es lo que la spec pide como región con nombre. El `h1` es «Galería de componentes».

*Alternativa:* un componente `Section` local. Se descarta por la regla 17.

### Montaje solo en DEV: `lazy` dentro de la condición, comparación literal

En `App.tsx`:

```tsx
const GalleryRouter = import.meta.env.DEV
  ? lazy(() => import('@/app/gallery/GalleryRouter'))
  : undefined;
```

- Vite sustituye `import.meta.env.DEV` por `false` en producción y el minificador elimina la rama muerta, con el `import()` dinámico dentro: el chunk de la galería ni siquiera se genera. Funciona porque la comparación es el literal `import.meta.env.DEV` y el `import()` está dentro de la rama; envolverla en una función (`isDev()`) o en una variable intermedia dificulta que el bundler lo garantice.
- La ruta se declara solo si `GalleryRouter` existe: `{GalleryRouter && <Route path={`${appRoutes.gallery}/*`} element={<GalleryRouter />} />}`. `Routes` ignora los hijos que no son elementos.
- El enlace de la navegación se añade con la misma condición: `navItems` pasa a ser `[Ejemplo, ...(import.meta.env.DEV ? [Galería] : [])]`. Se repite el literal en lugar de derivarlo de `GalleryRouter`, para que cada condición sea eliminable por sí sola.
- `appRoutes.gallery = '/gallery'` va en `routes.ts` sin condición: es un `string`, no arrastra código.

En producción `/gallery` cae en el `*` y muestra `NotFoundPage`, sin código especial.

*Alternativas:* una variable `VITE_ENABLE_GALLERY` (otra configuración que mantener y que se puede activar por error en producción); un plugin de Vite que excluya la carpeta (más maquinaria que un `if`).

### Contenido inicial: tokens, `Spinner`, `ErrorMessage`, `ErrorFallback`

La sección de tokens lista los 20 colores, los 7 estilos de texto, los 5 radios y las 4 sombras de `index.css`. Sirve para comparar con el DS y, de paso, hace que Tailwind emita todos los tokens en desarrollo. `ErrorFallback` aparece tal cual (su botón «Recargar página» recarga de verdad). `NotFoundPage` y `RootLayout` no entran (son de página completa); `Spinner` y los demás se muestran con sus valores por defecto y, cuando existe, con una variante (`ErrorMessage` con título propio).

### Cómo se prueba cada rama

- `GalleryPage`: test propio con los hooks y la red fuera de juego (no los usa). Comprueba los encabezados de sección y que cada token aparece por su nombre.
- `GalleryRouter`: test de enrutado con la página sustituida (convención 7).
- `App`: en Vitest `DEV` es `true`, así que se prueba la rama de desarrollo: `/gallery` muestra el módulo sustituido y la navegación tiene el enlace. La rama de producción **no se prueba con Vitest**: la constante se evalúa al cargar el módulo y `vi.stubEnv` llega tarde, y recargar el módulo con `vi.resetModules` duplicaría React. La cubre la verificación del build.
- Build: `npm run build` y buscar en `dist/` el texto «Galería de componentes» y cualquier archivo cuyo nombre contenga `Gallery`: no debe haber ninguno. Como contraste, un build con `--mode development` escrito en un directorio temporal sí debe contenerlos; sin esa prueba positiva, un `grep` vacío no demuestra nada.

## Risks / Trade-offs

- [El CSS de producción incluye las utilidades que usa la galería, aunque su JavaScript no esté] → Tailwind lee los archivos fuente, no el bundle. Es un puñado de reglas (los tokens que hoy nadie más usa). Se mide en la verificación y se acepta; la alternativa (`@source not` condicional) no existe por entorno. Además deja de ser un efecto visible cuando los componentes reales usen esos tokens.
- [Un cambio futuro rompe la eliminación sin que nadie lo note (por ejemplo, importar la galería de forma estática desde otro archivo)] → La verificación del build es manual en este change. Se anota como decisión abierta si conviene automatizarla en CI cuando exista.
- [La rama de producción de `App.tsx` queda fuera de la cobertura de ramas] → Pesa poco frente al umbral global del 80 %; si el umbral falla, se revisa entonces.
- [`import.meta.env.DEV` también es `true` en `vite preview` de un build de desarrollo] → Irrelevante: el build de producción lo fija en `false`.
- [`ErrorFallback` en la galería recarga la página al pulsar su botón] → Es el comportamiento real del componente y lo que se quiere ver; la galería no lo neutraliza.

## Open Questions

- Automatizar la comprobación del bundle en CI cuando haya CI. No cambia las specs ni las tareas actuales.
