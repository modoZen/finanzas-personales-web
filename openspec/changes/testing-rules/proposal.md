# Proposal

## Why

El test de `App` carga hoy el módulo `example` real, con su router y sus páginas, para comprobar cosas que son solo de `App`: el redirect de `/`, el 404, los `navItems` y el `Suspense`. Eso lo ata al interior de un módulo (busca el `h1` "Ejemplo" de `ExamplePage`), contradice la regla 12 de `docs/architecture.md` (`App.tsx` solo toca el router del módulo) y se rompería al borrar `example`, que es temporal. El test de `ExampleRouter` tiene el mismo problema en pequeño: monta las páginas reales y navega con clics para comprobar algo que es solo del router (que cada ruta lleva a su página), y una página real acabará pidiendo datos, `QueryClient` y formularios. Además, el proyecto no tiene escrito qué se sustituye en un test y qué no, y `data-layer` está por llegar y va a tener que decidir cómo se prueban los hooks y las páginas que piden datos. Conviene fijar el criterio ahora, con lo que ya existe, antes de que cada test lo decida por su cuenta.

## What Changes

- Reescribir `src/__tests__/App.test.tsx` para que sustituya `ExampleRouter` por un stub estático (`vi.mock` inline, con un componente `const ExampleRouterStub: FC` que pinta "Example module"). El layout, el spinner y la página de no encontrada se mantienen reales. Los textos que se comprueban pasan de los de `ExamplePage` a los del stub; el test del spinner sigue siendo el primero de su archivo por la caché de `lazy`.
- Reescribir `src/app/example/__tests__/ExampleRouter.test.tsx` para que sustituya `ExamplePage` y `ExampleDetailPage` por stubs y solo compruebe que enruta: que el índice y `detail/:id` llevan a su página y que el parámetro llega. Desaparece el test de clics; la navegación entre páginas se cubrirá con tests e2e cuando exista el primer módulo real (pendiente, no se monta ahora).
- Añadir a `docs/conventions.md` la convención 7, «Tests»:
  - Cada test sustituye lo que la unidad solo enruta o consume y comprueba únicamente su propia responsabilidad: en `App`, los routers de módulo; en el router de un módulo, sus páginas; más adelante, `proxy/`. No se sustituyen los componentes puros de `shared/`.
  - Niveles: un test unitario por componente y por página; el router de un módulo se prueba con sus páginas sustituidas; el test de `App` solo prueba su cableado. No hay tests de integración de módulo en Vitest.
  - Los mocks van en línea en el test que los usa; `mocks/` queda para datos de prueba (regla 14 de `architecture.md`).
  - El texto de un stub es el nombre del componente en inglés (`Example page`). No hay un helper de stubs todavía; si se extrae, irá en `shared/test-utils/`.
  - Pendiente: cómo se sustituye el backend (probablemente un mock del `proxy/`) se decide en `data-layer`.
- Revisar los demás tests contra esa regla. El resultado esperado es que no cambia ninguno más: los de `shared/` y los de las páginas son unitarios.
- Fuera de alcance:
  - Montar tests e2e (Playwright): es una dependencia nueva con su propia configuración; queda anotado como pendiente para el primer módulo real.
  - Cómo se prueba el backend y los hooks que piden datos (`data-layer`).
  - Cambios en la configuración de Vitest, en el umbral de cobertura o en `test-utils/`.
  - Cambios en `docs/architecture.md`: la colocación de los tests (reglas 17 y 19) no cambia.

## Capabilities

### New Capabilities

<!-- Ninguna: son tests y documentación, no comportamiento del producto. -->

### Modified Capabilities

<!-- Ninguna. El change declara `skip_specs: true`. -->

## Impact

- **Archivos modificados**: `src/__tests__/App.test.tsx`, `src/app/example/__tests__/ExampleRouter.test.tsx` y `docs/conventions.md`.
- **Archivos nuevos**: ninguno.
- **Dependencias**: ninguna.
- **Flujo de trabajo**: a partir de este change, los tests nuevos siguen una regla escrita sobre qué se sustituye. El código de la aplicación no cambia.
- **Verificación**: lint, formato, build y tests con cobertura (umbral 80 %). Lo que `vi.mock` hace con `lazy` en el primer render se comprueba al implementar, no está probado todavía.
