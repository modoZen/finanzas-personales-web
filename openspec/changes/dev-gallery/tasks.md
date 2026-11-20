# Tasks

## 1. Módulo de la galería

- [x] 1.1 Crear `src/app/gallery/pages/GalleryPage/GalleryPage.tsx`: un `h1` «Galería de componentes» y cuatro `<section aria-labelledby>` con su `h2` (Tokens, Spinner, ErrorMessage, ErrorFallback), todo en JSX en un solo archivo, sin componentes auxiliares y sin hooks de datos. La sección de tokens muestra los 20 colores, los 7 estilos de texto, los 5 radios y las 4 sombras de `src/index.css` con su nombre y la clase como texto literal (`.map` sobre arrays literales; sin clases construidas con plantillas). `ErrorMessage` se muestra con título por defecto y con título propio. Verificar que `npm run build` compila sin errores de tipos y que el contenido de los arrays coincide uno a uno con los tokens de `src/index.css`.
- [x] 1.2 Test `src/app/gallery/pages/GalleryPage/__tests__/GalleryPage.test.tsx`: el `h1`, una región por sección con el nombre de su `h2`, que cada color, estilo de texto, radio y sombra aparece por su nombre, y que `ErrorMessage` aparece con los dos títulos. Verificar con `npx vitest run src/app/gallery/pages` en verde.
- [x] 1.3 Crear `src/app/gallery/GalleryRouter.tsx` con `Routes` y la ruta `index` hacia `GalleryPage`, más su test `src/app/gallery/__tests__/GalleryRouter.test.tsx` con la página sustituida por un stub («Gallery page», convención 7). Verificar con `npx vitest run src/app/gallery` en verde.
- [x] 1.4 Actualizar `docs/architecture.md`: añadir `app/gallery/` a la descripción de `app/` (módulo permanente, solo de desarrollo, mínimo: router + `pages/`, sin `*.routes.ts` porque solo tiene la ruta `index`). Verificar leyendo el documento: la numeración sigue sin saltos y `npm run format:check` pasa.

## 2. Montaje solo en desarrollo

- [x] 2.1 Añadir `gallery: '/gallery'` a `appRoutes` en `src/routes.ts`. Verificar con `npm run build` sin errores de tipos y comprobando que el test existente de `routes.ts`, si lo hay, sigue en verde.
- [x] 2.2 En `src/App.tsx`, declarar `GalleryRouter` como `import.meta.env.DEV ? lazy(() => import('@/app/gallery/GalleryRouter')) : undefined`, montar `{GalleryRouter && <Route … />}` con `appRoutes.gallery` y añadir el enlace «Galería» a `navItems` con una condición `import.meta.env.DEV` literal. Verificar con `npm run dev` y abriendo `/gallery` (Claude lo comprueba con una petición al servidor de desarrollo; lo visual lo ve el usuario en 3.4).
- [x] 2.3 Ampliar `src/__tests__/App.test.tsx` sin cambiar los tests existentes: sustituir `@/app/gallery/GalleryRouter` por un stub («Gallery module»); comprobar que `/gallery` muestra el stub tras el indicador de carga con el header visible, y que la navegación incluye el enlace «Galería» con `aria-current="page"` en esa ruta. Verificar con `npx vitest run src/__tests__` en verde.
- [x] 2.4 Actualizar `docs/architecture.md` en la regla 15 (o una regla nueva sin saltos de numeración): un módulo solo de desarrollo se monta con `lazy` dentro de una condición `import.meta.env.DEV` literal, y su ruta y su enlace usan la misma condición; en producción cae en la página de no encontrada. Verificar leyendo el documento y con `npm run format:check`.

## 3. Verificación integral

- [ ] 3.1 Ejecutar `npm run lint`, `npm run format:check`, `npm test` y `npm run build` y verificar que los cuatro terminan sin errores (y que `npm run test:coverage` sigue por encima del umbral del 80 %).
- [ ] 3.2 Producción sin galería: tras `npm run build`, verificar que `grep -r "Galería de componentes" dist/` no devuelve nada, que `ls dist/assets | grep -i gallery` no devuelve nada y que `dist/assets` no contiene ningún chunk con `GalleryRouter`. Anotar el tamaño del CSS de `dist/`.
- [ ] 3.3 Prueba de contraste: `npx vite build --mode development --outDir <directorio temporal del scratchpad>` (sin tocar `dist/`) y verificar que ahí el `grep` anterior sí encuentra «Galería de componentes» y que existe el chunk de la galería. Si no aparece, el modo no fija `DEV` en `true` y la prueba de 3.2 no vale: corregir la forma de construir antes de seguir. Comparar el CSS con el de 3.2 para cuantificar las utilidades que solo usa la galería.
- [ ] 3.4 Verificar con `git status` que no quedan archivos temporales ni cambios en `dist/` rastreados.
- [ ] 3.5 Confirmada por el usuario en el navegador: con `npm run dev`, abrir `/gallery` y comprobar que se ven los tokens, el `Spinner`, el `ErrorMessage` (dos variantes) y el `ErrorFallback`, y que el enlace «Galería» aparece en el header; con `npm run preview` tras el build de producción, que `/gallery` muestra «Página no encontrada» y no hay enlace. La hace el usuario; Claude no la marca como hecha.

## Workflow follow-up

- Al terminar cada grupo de tareas, Claude se detiene y da el mensaje de commit propuesto; el usuario hace el commit. Claude no ejecuta `git commit` ni `git push`.
- Archivar el change con `/opsx:archive` una vez implementado.
