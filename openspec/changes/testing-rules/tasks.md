# Tasks

## 1. Tests de `App` y del router de `example` con sustitutos

- [ ] 1.1 Reescribir `src/__tests__/App.test.tsx` con un `vi.mock('@/app/example/ExampleRouter', …)` cuya fábrica define `const ExampleRouterStub: FC = () => <p>Example module</p>` y la exporta por defecto; el contenido del módulo que se comprueba pasa del `h1` de `ExamplePage` al texto "Example module", mientras que la etiqueta "Ejemplo" de la navegación se sigue comprobando porque sale de `App`; el test del spinner sigue siendo el primero del archivo, con su comentario. Verificar que `npx vitest run src/__tests__` pasa con los 4 tests, que el spinner se ve en el primer render con el módulo mockeado y que `grep -n "heading.*Ejemplo\|ExamplePage" src/__tests__/App.test.tsx` no devuelve resultados (el test ya no depende del interior del módulo)
- [ ] 1.2 Reescribir `src/app/example/__tests__/ExampleRouter.test.tsx` con `vi.mock('../pages/ExamplePage/ExamplePage', …)` y `vi.mock('../pages/ExampleDetailPage/ExampleDetailPage', …)`, cuyas fábricas definen stubs `const …: FC` (el del índice pinta `Example page`; el del detalle pinta `Example detail page` y el `id` que lee con `useParams`); el test monta el router bajo `/example/*` y comprueba que `/example` muestra el stub del índice y que `/example/detail/3` muestra el del detalle con el `3`; el test de clics desaparece. Verificar que `npx vitest run src/app/example` pasa (las páginas conservan sus propios tests), que `grep -n "userEvent\|click\|Ver detalle" src/app/example/__tests__/ExampleRouter.test.tsx` no devuelve resultados (no carga páginas reales ni navega) y que el router sigue cubierto en `npm run test:coverage`
- [ ] 1.3 Comprobar que ninguno de los dos tests usa el módulo real: verificar que `vi.importActual` y las importaciones del interior del módulo (salvo las rutas de los `vi.mock`) no aparecen en `App.test.tsx`, y que `npx eslint src`, `npx tsc -b` y `npx prettier --check src` pasan. Si la fábrica con JSX da problemas al elevarse, usar `createElement` y anotarlo en el design

## 2. Convención 7 en `docs/conventions.md`

- [ ] 2.1 Añadir la convención 7 («Tests») a `docs/conventions.md` con el texto de la sección "Contenido acordado" de `design.md`, que cubre qué se sustituye, los niveles, dónde van los mocks, el nombre y el idioma del texto de los stubs y el pendiente del backend; verificar que `npx prettier --check docs/conventions.md` pasa, que la numeración sigue a la convención 6, que las referencias a la regla 14 de `docs/architecture.md` y a la convención 3 existen, y que lo que describe coincide con los tests reales (`App.test.tsx` sustituye `ExampleRouter`, `ExampleRouter.test.tsx` sustituye las páginas y las páginas se prueban solas)

## 3. Verificación final

- [ ] 3.1 Revisar los demás tests contra la regla: verificar con `grep -rn "vi.mock\|vi.importActual" src` que solo `App.test.tsx` y `ExampleRouter.test.tsx` sustituyen algo (y cada uno solo lo que enruta), que los tests de `shared/` y de las páginas de `example` no sustituyen nada ni importan de otro módulo; anotar el resultado y, si algún test más cruza una frontera, señalarlo antes de tocarlo
- [ ] 3.2 Verificar que `npm run lint`, `npm run format:check`, `npm run build` y `npm run test:coverage` pasan con los umbrales del 80 %, que son 20 tests (los 21 actuales menos el de clics del router; si la reescritura añade o quita alguno más, anotarlo) y que `dist/assets` mantiene el chunk de `ExampleRouter`
- [ ] 3.3 Informar de lo que no se pudo verificar: el comportamiento del stub con `lazy` solo se confirma ejecutando el test, ningún test ejercita ya el flujo de navegación entre páginas reales (queda para los e2e), y la regla de tests no se ha probado todavía con código de `data-layer`

## Workflow follow-up

- Archivar el change con `/opsx:archive` una vez verificado.
- El change `data-layer` completa la convención 7 con cómo se sustituye el backend.
- El change del primer módulo real conserva la regla de niveles y escribe el test de su router con las páginas sustituidas.
- Pendiente para el primer módulo real: valorar un helper de stubs en `shared/test-utils/` si el patrón se repite unas cinco veces con la misma forma.
- Pendiente para el primer módulo real: montar tests e2e (Playwright) para los flujos de navegación entre páginas, que ya no cubre ningún test de Vitest.
