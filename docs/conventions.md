# Convenciones de código

Reglas de código y estilo que no son de carpetas ni archivos (esas viven en `architecture.md`).

1. **Componentes**: `const X: FC<Props> = () => ...`, con `FC` importado como tipo desde `react`. No
   se usa `function X` ni se tipa el retorno con `JSX.Element`. Excepción: los componentes
   genéricos, que necesitan `function` para declarar el parámetro de tipo.
2. **Sin `enum`**: el `tsconfig` activa `erasableSyntaxOnly`. Las constantes se declaran como
   objetos `as const`.
3. **Idioma**: código, nombres de archivo y commits en inglés; textos de la interfaz en español.
4. **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `build:`…).
5. **Imports sin extensión**: `@/App`, no `@/App.tsx`. Los assets conservan la suya (`./index.css`).
6. **Constantes**: camelCase, sin `UPPER_CASE`. Los objetos fijos se declaran `as const`
   (`appRoutes`, `exampleRoutes`).
7. **Tests**:
   - **Qué se sustituye**: solo en las fronteras, que son otras páginas o módulos y la red. `App`
     sustituye los routers de módulo y el router de un módulo, sus páginas. La red se sustituye en
     el punto más cercano a ella que el test no prueba: las páginas y los hooks, el proxy; el proxy,
     el wrapper de `fetch`; el wrapper, `fetch`. Lo demás se ejecuta de verdad (los hooks, la caché
     de consultas y los mappers), y tampoco se sustituyen los componentes puros de `shared/`, que
     son deterministas y ya tienen su propio test.
   - **Niveles**: un test por componente, página, hook, proxy, mapper y utilidad; las páginas y los
     hooks se prueban con los providers que necesiten (router y Query, con los helpers de
     `shared/test-utils/`) y el proxy sustituido; el router de un módulo solo comprueba que enruta,
     con sus páginas sustituidas; el test de `App` solo prueba su cableado. No hay tests de
     integración de módulo (router con páginas reales) en Vitest.
   - **Mocks**: `vi.mock` en línea para módulos (routers, páginas, el wrapper de `fetch`),
     `vi.spyOn` para objetos como `postProxy`, restaurando los espías entre tests, y `vi.stubGlobal`
     para las APIs del navegador que no se pueden espiar (en jsdom,
     `vi.spyOn(window.location, 'reload')` lanza «Cannot redefine property»; se sustituye todo
     `location`), que `unstubGlobals` ya limpia entre tests; `mocks/` queda para datos de prueba
     (regla 14 de `architecture.md`). El texto de un stub es el nombre del componente en inglés
     (`Example page`).
   - **Sin red**: ningún test llama a la red ni usa MSW. El flujo contra una API real queda para los
     tests e2e del primer módulo real.
8. **Formularios**: el formulario (`useForm` con el resolver del esquema, regla 22 de
   `architecture.md`) vive en un componente que recibe `onSubmit`, `onCancel` e `isPending` y no
   conoce los hooks de datos: emite los datos válidos y la página decide qué pasa después. La página
   pasa la función `mutate` de su mutación y, en su `onSuccess`, desmonta el formulario, de modo que
   el siguiente se abre nuevo y no hace falta `reset()`. Si el envío falla, el formulario sigue
   abierto con lo escrito y el error lo muestra la página a partir del estado de la mutación.
