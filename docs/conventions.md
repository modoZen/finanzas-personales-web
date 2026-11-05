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
   - **Qué se sustituye**: lo que la unidad solo enruta o consume, para que el test compruebe
     únicamente su propia responsabilidad: en `App`, los routers de módulo; en el router de un
     módulo, sus páginas; más adelante, `proxy/`. No se sustituyen los componentes puros de
     `shared/`, que son deterministas y ya tienen su propio test.
   - **Niveles**: un test unitario por componente y por página; el router de un módulo se prueba con
     sus páginas sustituidas por stubs y solo comprueba que enruta; el test de `App` solo prueba su
     cableado (redirect, 404, `navItems`, `Suspense`) con los routers de módulo sustituidos. No hay
     tests de integración de módulo en Vitest.
   - **Mocks**: `vi.mock` en línea, en el test que lo usa; `mocks/` queda para datos de prueba
     (regla 14 de `architecture.md`). El texto de un stub es el nombre del componente en inglés
     (`Example page`).
   - **Pendiente**: cómo se sustituye el backend (probablemente un mock del `proxy/`) se decide en
     `data-layer`.
