# Design

## Context

Hay 7 archivos de test y 21 tests. Los de `shared/` (`Spinner`, `NotFoundPage`, `RootLayout`) y los de las páginas de `example` son unitarios: solo llevan un `MemoryRouter` alrededor. El de `ExampleRouter` monta el módulo con sus páginas reales y navega con clics. El de `App` monta todo: `App`, el layout, el spinner, la página de no encontrada, `ExampleRouter` y sus páginas. Son los dos que cargan más de lo que prueban: el de `App` comprueba cosas suyas con textos de `ExamplePage`, y el de `ExampleRouter` carga páginas reales para comprobar solo que una ruta lleva a su página. `docs/conventions.md` tiene 6 convenciones y ninguna habla de tests; la colocación de los tests ya está en las reglas 17 y 19 de `docs/architecture.md`. Motivación y alcance en `proposal.md`.

Restricciones: el proyecto no usa mocks hoy (`grep` de `vi.mock`, `vi.fn` y `vi.spyOn` sin resultados), `data-layer` aún no existe, y el umbral de cobertura es del 80 % (hoy 100 %).

## Goals / Non-Goals

**Goals:**
- Que el test de `App` pruebe solo el cableado de `App`, sin depender del interior de un módulo.
- Que el test del router de un módulo pruebe solo que enruta, sin depender de lo complejas que lleguen a ser sus páginas.
- Dejar escrito qué se sustituye en un test, para que los tests nuevos no lo decidan cada uno por su cuenta.

**Non-Goals:**
- Decidir cómo se prueba el backend o los hooks con `QueryClient`: depende de `data-layer`.
- Aislar todos los tests hasta el nivel de solitarios.
- Tocar la configuración de Vitest o `test-utils/`.

## Decisions

**1. Cada test sustituye lo que la unidad solo enruta o consume, y comprueba solo su propia responsabilidad.**
En `App`, los routers de módulo; en el router de un módulo, sus páginas; cuando exista, `proxy/`. No se sustituyen los componentes puros de `shared/` (`RootLayout`, `Spinner`, `NotFoundPage`): son deterministas, baratos y tienen su propio test. El criterio es la responsabilidad del test y no una frontera de carpetas: una página es del mismo módulo que su router, pero al router solo le importa que la ruta lleve a ella.
*Alternativa:* aislar también esos componentes en el test de `App`. Descartada porque el test pasaría a comprobar que `App` pasa props a stubs, se rompería con cualquier refactor y no probaría lo que ve el usuario. Lo que `App` hace con el layout (pasar `appName` y `navItems`) sí se comprueba, a través de lo que se renderiza.

**2. Tres niveles de test, todos unitarios, cada uno con su alcance.**
- Componente o página: con un router de prueba si lo necesita (`shared/` y las páginas de `example`). Cada página comprueba los enlaces que construye (su `href`), y cuando una página navega, comprueba la URL resultante sin renderizar el destino.
- Router de un módulo: con sus páginas sustituidas por stubs, comprueba que cada ruta lleva a su página y que los parámetros llegan (`ExampleRouter`).
- Cableado de `App`: redirect, 404, `navItems` y `Suspense`, con los routers de módulo sustituidos.

No hay test de integración de módulo en Vitest. *Alternativa:* conservar el de `ExampleRouter` con las páginas reales y clics. Descartada porque una página real va a pedir datos, `QueryClient` y formularios, y montar todo eso solo para comprobar un clic sería lento y frágil justo cuando haya más páginas. Ese test fue el que verificó `generatePath` relativo y `..` en rutas anidadas; esa garantía queda repartida entre los tests de las páginas (asumen que el módulo cuelga de `/example/*` con `detail/:id`) y el del router (comprueba esa misma estructura).

**3. El stub de `ExampleRouter` es estático y va en línea.**
`vi.mock('@/app/example/ExampleRouter', …)` con una fábrica que define `const ExampleRouterStub: FC = () => <p>Example module</p>` y la exporta por defecto. La fábrica se eleva por encima de los imports, así que el componente se define dentro de ella. Sin compuertas ni promesas controladas: la importación de un módulo mockeado sigue siendo asíncrona, de modo que el spinner se ve en el primer render.
*Alternativa:* un `lazy` propio con una promesa controlada, para no depender del orden. Se probó en el change `routing` y se descartó por desproporcionado: el test del spinner va primero en su archivo, con un comentario que lo explica, y si otro test cargara el módulo antes, falla con un error claro y no pasa en falso.
*Qué se pierde:* que `ExampleRouter` tenga export por defecto y que la ruta del `import()` resuelva dejan de comprobarse en tiempo de ejecución. Lo cubren `tsc` (el tipo de `lazy` exige `{ default: ComponentType }`) y `npm run build` (que genera el chunk). Que `App` y el módulo funcionan juntos de punta a punta ya no lo cubre ningún test de Vitest (ver la decisión 5).

**4. Las páginas se sustituyen en el test del router, con stubs mínimos.**
El test de `ExampleRouter` usa `vi.mock` con rutas relativas al propio test (`../pages/ExamplePage/ExamplePage` y `../pages/ExampleDetailPage/ExampleDetailPage`). El stub del índice pinta un texto fijo; el del detalle lee el `id` con `useParams` y lo pinta, para comprobar que el parámetro llega. Solo hay dos casos (el índice y un detalle por su URL), sin clics: los enlaces los comprueba cada página en su propio test.

**5. Los flujos de navegación entre páginas se cubrirán con tests e2e cuando exista el primer módulo real.**
Sin test de integración, nada ejercita router y páginas reales juntos salvo `tsc`, el build y la prueba manual en el navegador. Un test del tipo «entro al índice, pulso un detalle y vuelvo» tiene su capa en un test end-to-end (Playwright), con la app completa en un navegador real y sin importar lo complejas que sean las páginas; además vive aparte de la suite unitaria, así que no la ralentiza. No se monta ahora: con `example` temporal no compensa, y Playwright es una dependencia nueva con su propia configuración. Queda como pendiente para el primer módulo real.

**6. El texto del stub es el nombre del componente, en inglés.**
No es UI del producto sino un valor de prueba, así que le aplica la convención 3 (código en inglés). Por costumbre es el nombre del componente sustituido (`Example module`, `Example page`, `Example detail page`), para que todos los stubs se lean igual y una extracción futura sea mecánica. Los textos de la interfaz que el test comprueba de `App` o del layout (por ejemplo la etiqueta "Ejemplo" de la navegación) siguen en español, porque salen de `App`.

**7. Los mocks van en línea; `mocks/` es para datos.**
Un `vi.mock` vive en el test que lo usa. La carpeta `mocks/` del catálogo de un módulo (regla 14 de `architecture.md`) queda para datos de prueba reutilizables y solo se importa desde tests. No se crea ninguna carpeta nueva.

**8. La regla vive en `docs/conventions.md`, no en `architecture.md` ni en un documento nuevo.**
Es una regla de código y estilo, no de carpetas ni archivos. Un documento aparte sumaría contexto que se carga en cada sesión por un texto corto. La regla 20 de `architecture.md` no aplica: este change no decide estructura de carpetas, archivos ni dependencias entre carpetas.

**9. Lo del backend queda apuntado como pendiente.**
La convención termina con una línea que dice que cómo se sustituye el backend (probablemente un mock del `proxy/`) se decide en `data-layer`. Se escribe como pendiente y no como regla para no adelantar una decisión que depende de la librería de datos que se elija.

**10. No hay un helper de stubs todavía; si lo hay, vive en `shared/test-utils/`.**
Un stub en línea son 3 o 4 líneas, y hoy solo hay tres, que además no son iguales (el del detalle lee `id` con `useParams`). Un helper no sería más corto: `vi.mock` se eleva por encima de los imports y, cuando el módulo bajo prueba importa las páginas de forma estática (el router de un módulo), la fábrica se ejecuta mientras se evalúan los imports del propio test, de modo que el helper habría que traerlo con un `import()` dentro de la fábrica. Esto es lo que se espera por cómo funciona Vitest y no está probado en el proyecto. Además, el test dejaría de ser autocontenido.
*Si algún día se extrae:* el sitio es `shared/test-utils/`, no `shared/components/` ni `shared/utils/`. Esas dos son código de producción: cuentan en la cobertura, pasan por el lint estricto y parecen parte del producto; `test-utils/` está excluida de la cobertura y de la regla de tipos de retorno, y la regla 19 de `architecture.md` la reserva para esto. Se reabre con el primer módulo real, si el patrón de un componente que pinta un texto fijo se repite unas cinco veces con la misma forma.

### Contenido acordado de la convención 7

> 7. **Tests**:
>    - **Qué se sustituye**: lo que la unidad solo enruta o consume, para que el test compruebe únicamente su propia responsabilidad: en `App`, los routers de módulo; en el router de un módulo, sus páginas; más adelante, `proxy/`. No se sustituyen los componentes puros de `shared/`, que son deterministas y ya tienen su propio test.
>    - **Niveles**: un test unitario por componente y por página; el router de un módulo se prueba con sus páginas sustituidas por stubs y solo comprueba que enruta; el test de `App` solo prueba su cableado (redirect, 404, `navItems`, `Suspense`) con los routers de módulo sustituidos. No hay tests de integración de módulo en Vitest.
>    - **Mocks**: `vi.mock` en línea, en el test que lo usa; `mocks/` queda para datos de prueba (regla 14 de `architecture.md`). El texto de un stub es el nombre del componente en inglés (`Example page`).
>    - **Pendiente**: cómo se sustituye el backend (probablemente un mock del `proxy/`) se decide en `data-layer`.

## Risks / Trade-offs

- [`vi.mock` con `lazy` podría no comportarse como se espera (por ejemplo, el spinner no verse en el primer render, o la fábrica con JSX no resolverse al elevarse)] → Se comprueba al implementar. Si el JSX en la fábrica da problemas, se usa `createElement`; si el spinner no se ve, se reabre la decisión.
- [El test del spinner depende de ejecutarse el primero de su archivo] → Es la misma limitación que ya existe y está comentada en el test; falla con un error claro.
- [El stub no comprueba que `ExampleRouter` siga siendo un módulo válido para `lazy`] → Lo cubren `tsc` y `npm run build`.
- [Sin test de integración, nada ejercita router y páginas reales juntos: un cambio que descuadre el enlace de una página con la ruta del router podría pasar los tests unitarios] → Los tests de las páginas y el del router comparten las constantes de `example.routes.ts` y la misma estructura (`/example/*` con `detail/:id`); además `tsc` y la prueba manual. El flujo completo queda para los tests e2e del primer módulo real (decisión 5).
- [`vi.mock` sobre páginas con export por defecto, con rutas relativas al test, podría no resolverse como se espera] → Se comprueba al implementar; si falla, se ajusta la ruta o se usa la fábrica asíncrona.
- [La convención se queda corta cuando llegue `data-layer`] → Termina con el pendiente explícito; ese change la amplía.
- [`example` es temporal y sus tests desaparecerán con él] → La regla de niveles sigue valiendo para el primer módulo real, que tendrá su test de router con stubs.

## Migration Plan

1. Reescribir `src/__tests__/App.test.tsx` con el stub y comprobar que los tests, la cobertura y el spinner del primer render siguen bien.
2. Reescribir `src/app/example/__tests__/ExampleRouter.test.tsx` con las páginas sustituidas y sin el test de clics.
3. Añadir la convención 7 a `docs/conventions.md`.
4. Verificar lint, formato, build y tests con cobertura, y revisar el resto de tests contra la regla.

## Open Questions

- Si extraer un helper de stubs a `shared/test-utils/`: se reabre con el primer módulo real si el patrón se repite unas cinco veces con la misma forma (decisión 10).
- Los tests e2e (Playwright) de los flujos de navegación entre páginas: herramienta, configuración y dónde viven. Se deciden en el change del primer módulo real, no antes.
