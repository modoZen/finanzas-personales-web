# Design

## Context

Hoy `src/` no tiene `shared/utils/` ni ninguna capa de datos; `example` es estático (tres enlaces fijos y un detalle que muestra el `id` de la URL) y `main.tsx` solo monta `BrowserRouter` y `App`. `docs/architecture.md` ya fija las capas de un módulo (regla 14: `pages → components → hooks → proxy → mappers → domain`) y que el wrapper de `fetch` y el tipo de error viven fuera de `proxy/` (regla 10), pero ambas reglas son provisionales y su forma concreta está en "Decisiones abiertas". La convención 7 de `docs/conventions.md` deja pendiente cómo se sustituye el backend en los tests. Motivación y alcance en `proposal.md`; el comportamiento exigible, en `specs/remote-data/spec.md`.

Restricciones que condicionan el diseño:
- `erasableSyntaxOnly` está activo: no hay `enum` ni propiedades en el parámetro del constructor de una clase.
- La regla `explicit-function-return-type` del lint obliga a tipar el retorno de las funciones, hooks incluidos.
- La regla 9 impide que `shared/` importe de `domain/`, `proxy/`, `core/` o `store/`.
- El proyecto no usa la red en los tests ni MSW. El umbral de cobertura es del 80 % y `main.tsx` y `**/test-utils/**` están excluidos.
- Hoy `.gitignore` ignora `*.local` pero no `.env`, y no existe ningún `.env`.
- JSONPlaceholder (comprobado): `GET /posts/1` devuelve `{ userId, id, title, body }`, `GET /posts?_limit=2` acepta el límite, un `GET` de un post inexistente da 404, y `POST /posts` devuelve 201 con un eco y `id: 101` sin guardarlo. Responde con CORS para `localhost:5173`.

## Goals / Non-Goals

**Goals:**
- Dejar una capa de datos usable por el primer módulo real: wrapper, error, cliente de caché, y el patrón completo `pages → hooks → proxy → mappers → domain` probado en `example`.
- Que los tests sustituyan solo en las fronteras (otras páginas o módulos, y la red a través del proxy), ejecuten de verdad el resto de capas y no usen la red.
- Dejar `architecture.md` y la convención 7 sin pendientes de datos.

**Non-Goals:**
- El indicador global de carga y su `LoadingOverlay` (`loading-indicator`).
- El error boundary, la validación de respuestas en ejecución, el store y los tests e2e.
- Decidir cómo será el backend propio: se cambia de API con `VITE_API_URL`.

## Decisions

**1. TanStack Query v5, y nada más.**
Ya la asumían los documentos (el `QueryClient`) y es compatible con React 19 (peer dependencies `^18 || ^19`, versión 5.106). Con las devtools (`@tanstack/react-query-devtools`) como dependencia de desarrollo, montadas en `main.tsx`: en el código de la versión 5.106.1 el componente devuelve uno vacío cuando `NODE_ENV` no es `development`, así que en producción no pinta nada, y se verifica en el build que su código no entra en el bundle.
*Alternativas:* SWR o `fetch` con `useEffect` a mano. Descartadas: Query da caché, invalidación por prefijo, estado de mutaciones y `useIsFetching` y `useIsMutating`, que el siguiente change necesita.

**2. El acceso a datos vive en `shared/utils/http/`.**
Cuatro archivos sin sufijo (regla 18) y un `__tests__/` propio en la subcarpeta (regla 17): `fetch-json.ts`, `http-error.ts`, `http-method.ts` y `http-status.ts`. Criterio (regla 21): `utils/` es TypeScript puro, agrupado por tema en subcarpetas; los tipos y constantes transversales viven junto a la utilidad que los usa.
*Alternativas:* `shared/http/` como carpeta nueva del catálogo (obligaba a tocar el catálogo y la regla 18); `domain/` (la regla 9 impide que `shared/` importe de él, y el wrapper debe vivir en `shared/` por la regla 10).

**3. `fetchJson` centraliza lo que `fetch` no hace.**
Firma: `fetchJson<T>(path, { method?, body?, signal? })`. Comportamiento:
- Si `path` es absoluto (`http://` o `https://`), lo usa tal cual. Si es relativo, lo une a `import.meta.env.VITE_API_URL`; si esa variable no existe, lanza un error claro antes de enviar.
- Serializa el cuerpo a JSON y añade `Content-Type` solo cuando hay cuerpo.
- Si la respuesta no es 2xx, lanza `HttpError` con el código, su texto, el método, la URL ya resuelta y el cuerpo (JSON si se puede parsear, texto si no, `undefined` si está vacío).
- Una respuesta 204 devuelve `undefined`.
- Los fallos de red se dejan pasar como los lanza `fetch`.
El `<T>` es una **aserción**, no una garantía: `response.json()` devuelve `any` y nada comprueba que la API responda con `T`. Lo que se gana no es el tipado sino el tratamiento de errores HTTP (que `fetch` no hace), la cancelación y un único sitio para la URL base y, más adelante, la autenticación. Validar en ejecución (`validation/`, `.schema.ts`, con Zod) queda fuera.

**4. `HttpError` es una clase con campos declarados y un mensaje que identifica la petición.**
`class HttpError extends Error` con `status: number`, `statusText: string`, `method: HttpMethod`, `url: string` y `body: unknown` declarados como campos (no como propiedades del constructor, por `erasableSyntaxOnly`), un constructor que recibe un objeto con esos cinco valores y `name = 'HttpError'`. El `message` se arma con el método, la URL y el estado, por ejemplo `GET https://jsonplaceholder.typicode.com/posts/9999 responded with 404 Not Found`; `statusText` puede venir vacío (con HTTP/2 los navegadores no lo rellenan) y entonces el mensaje solo lleva el código. `url` es la dirección ya resuelta, no la ruta relativa. `status` es `number` y no el tipo `HttpStatus`: un servidor puede devolver un código que no está en la lista, y tiparlo estrecho obligaría a mentirle al compilador.

**5. `httpMethod` y `httpStatus` son objetos `as const`, sin `enum`.**
Convenciones 2 y 6: `httpMethod = { get: 'GET', post: 'POST', put: 'PUT', patch: 'PATCH', delete: 'DELETE' } as const` con un tipo `HttpMethod` derivado; `httpStatus` con los códigos comunes (`ok`, `created`, `noContent`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `unprocessableEntity`, `internalServerError`) y un tipo `HttpStatus`. La lista es curada y no la completa de IANA. `HttpMethod` tipa el parámetro `method` del wrapper; `httpStatus` se usa para comparar (`error.status === httpStatus.notFound`).

**6. El `QueryClient` se crea en `main.tsx`, sin fábrica compartida.**
Una instancia al nivel del módulo (no dentro de un componente) y un `QueryClientProvider` junto al `BrowserRouter`, con `<ReactQueryDevtools initialIsOpen={false} />` montado dentro del provider (importación directa: es una dependencia de desarrollo, igual que `vite` y `typescript`, que cualquier entorno de build ya instala). Los defaults van en línea y buscan que `useIsFetching` no haga ruido: `refetchOnWindowFocus: false`, un `staleTime` de un minuto y `retry: 1`. Son valores de partida y se ajustan con el uso; cada hook puede sobrescribirlos para su recurso, por ejemplo con un `staleTime` propio (decisión 10). Los tests crean el suyo con su propia configuración. Si más adelante hace falta compartir los defaults, se extrae entonces.
*Alternativa:* una función `createQueryClient` en `shared/utils/`. Descartada: solo la usarían la app y el helper de tests, con configuraciones distintas.

**7. La URL base es `VITE_API_URL`, con un `.env.example` versionado y `.env` ignorado.**
`.env.example` contiene la URL pública de JSONPlaceholder y se versiona; `.env` se añade al `.gitignore` y cada persona lo crea copiando el ejemplo (`cp .env.example .env`), como indica el `README.md`. Así la configuración de un entorno no acaba en el repositorio, y el patrón sigue valiendo el día que la variable apunte a un backend propio o lleve algo sensible. A cambio, un proyecto recién clonado necesita ese paso antes de pedir datos: sin él, la primera petición falla con el error claro de la variable ausente (requisito de la spec) y las pantallas muestran su estado de error. Los tests no dependen del archivo, porque sustituyen la variable. Los proxies pasan rutas relativas (`/posts`). Pasar a Express es cambiar la variable y el contrato del módulo real. No se declara el tipo en un `.d.ts`: la variable se lee con una comprobación en ejecución.
*Alternativa:* versionar el `.env` con la URL pública. Arrancaba sin pasos, pero mezcla la configuración local con la del repositorio y deja de valer en cuanto la variable contenga algo sensible. *Nota:* `.gitignore` ya ignora `*.local` (así que `.env.local` queda cubierto) y ahora `.env`; si algún día se usan archivos por modo (`.env.development`), habrá que ampliar el patrón.

**8. Se sustituye en las fronteras, no en cada capa (convención 7).**
Solo se sustituye lo que cruza una frontera: otras páginas u otros módulos, y la red, en el punto más cercano a ella que el test no prueba. Lo demás se ejecuta de verdad: los hooks, la caché de Query y los mappers.

```
test de...        sustituye...                    con...
---------------   -----------------------------   ------------------------------
App               los routers de módulo           vi.mock
router de módulo  sus páginas                     vi.mock
página            el proxy (la red)               vi.spyOn(postProxy, ...)
hook              el proxy (la red)               vi.spyOn(postProxy, ...)
proxy             fetchJson (la red)              vi.mock (módulo del wrapper)
fetchJson         fetch global y la variable      vi.stubGlobal / vi.stubEnv
mapper            nada (función pura)
```

Los tests de hooks necesitan el provider de Query (`renderHookWithQuery`) y los de páginas, el router y Query (`renderWithProviders`). Los estados de una página se fuerzan con el proxy: cargando con una promesa que no se resuelve, error con un rechazo (por ejemplo un `HttpError` 404) y datos con los de `mocks/`. El test del proxy usa el mapper real y `vi.mock` solo de `fetchJson`, con los datos de `mocks/post.mock.ts`. Los espías y los stubs se restauran en un `afterEach` global de `src/setup-tests.ts` (`vi.restoreAllMocks`, `vi.unstubAllGlobals`, `vi.unstubAllEnvs`).
*Alternativa:* que cada capa sustituya la siguiente (la página sustituye al hook, el hook al proxy). Descartada: obligaba a fabricar resultados de hook en cada test de página y no comprobaba que página, hook y caché funcionan juntos. A cambio, los tests de página son asíncronos (hay que esperar con `findBy`) y se rompen también si falla el hook; el test del propio hook localiza la causa.

**9. `postProxy` es un objeto `as const` y los hooks lo llaman por el objeto.**
`export const postProxy = { getAll, getById, create } as const` en `proxy/post.proxy.ts` (un archivo por recurso, regla 2). Un objeto permite `vi.spyOn` sin los problemas de hoisting de `vi.mock`. Los hooks llaman a `postProxy.getAll(...)` en el momento de ejecutar, nunca desestructurado al importar, o el espía no se aplicaría. El mapper se aplica dentro de cada función del proxy (regla 14). La convención 6 manda camelCase para constantes.
*Alternativas:* funciones exportadas con `vi.mock`; una clase con métodos estáticos (patrón peor visto).

**10. Los hooks encapsulan la política de caché del recurso y devuelven el resultado completo de Query.**
`usePosts`, `usePost(id)` y `useCreatePost` son los únicos archivos que declaran consultas y mutaciones (regla 14). No existen para facilitar los tests: las páginas se prueban con el hook real y el proxy sustituido (decisión 8). Existen porque cada recurso tiene su propia política de caché, y la clave, el `staleTime` propio y la invalidación son más fáciles de mantener juntos en un solo sitio que repartidos por cada página que usa el recurso. Con parámetros (`usePost(id)`, más adelante filtros) la clave tiene que incluirlos; un recurso casi estático puede conservarse 24 horas y otro, no; y `useCreatePost` necesita conocer la clave de la lista. Cada hook puede sobrescribir el `staleTime` (y otras opciones) de los defaults del `QueryClient` según su recurso; los de `example` usan los defaults, y la sobrescritura queda para los recursos reales.

Devuelven el resultado completo de la librería con un tipo explícito, que exige el lint de tipos de retorno: `UseQueryResult<Post[], Error>` y `UseQueryResult<Post, Error>` en las consultas, y `UseMutationResult<Post, Error, Omit<Post, 'id'>>` en la mutación. El error se tipa como `Error` (el valor por defecto de Query); una página que necesite el código comprueba `error instanceof HttpError`. Así las páginas disponen de lo que necesiten (`refetch` para reintentar, `isFetching`, `mutate` o `mutateAsync` para disparar la mutación) sin ampliar el hook cada vez. Las claves de caché van en línea en cada hook (`['posts', 'list']`, `['posts', 'detail', id]`) y `useCreatePost` invalida el prefijo `['posts']`; un test del hook comprueba que tras crear se vuelve a pedir la lista, que cubre una errata en la clave.

*Alternativa:* `useQuery` directamente en las páginas, extrayendo un hook solo al reutilizarlo. Descartada: la página tendría que conocer el proxy, las claves y la política de caché, habría que cambiar la regla 14, y con parámetros y políticas distintas por recurso es donde más fácil resulta equivocarse de clave.
*Alternativa:* `queryOptions` de la librería (un objeto reutilizable con clave, función y política que la página pasa a `useQuery`). Es legítima y centraliza sin hook envoltorio; no se elige para no introducir un rol nuevo en el catálogo de un módulo.
*Alternativa:* un contrato mínimo por hook (`data`, `isPending`, `error`). Descartada: se pensó para poder sustituir el hook con un objeto simple en los tests de página, y ya no se sustituye; sin esa razón, solo limitaba lo que una página podía hacer.
*Alternativa:* un archivo `post-query-keys.ts`. Descartada: con las consultas encapsuladas en hooks, las claves solo las conocen ellos; se extrae si aparece un consumidor fuera de los hooks.

**11. Dominio mínimo, sin tipo para lo que se envía.**
`domain/post.ts` define tres tipos, como pide la regla 2: `Post { id, title, body, authorId }`, `PostResponse { id, title, body, userId }` y `CreatePostRequest { title, body, userId }`. Lo que se envía al crear es `Omit<Post, 'id'>`; no hay un `NewPost`. El mapper traduce `userId` a `authorId` y al revés, para que el patrón enseñe un mapeo real.

**12. Las páginas resuelven sus estados; `ErrorMessage` solo muestra.**
`ExamplePage` lista los posts (cada título es un enlace al detalle con `generatePath`) y tiene un botón "Crear post" que dispara la mutación con un payload fijo; muestra que se creó y que la API de ejemplo no lo guarda (el POST de JSONPlaceholder devuelve un eco y la lista no cambia). `ExampleDetailPage` muestra un post. Ambas muestran el `Spinner` mientras cargan y `ErrorMessage` si falla; el detalle distingue un 404 (`httpStatus.notFound`, "El post no existe.") de cualquier otro error. `ErrorMessage` (`shared/components/`) recibe un mensaje y un título opcional, lleva `role="alert"` y no tiene botones: si una página quiere ofrecer reintentar, pone su botón al lado, porque reintentar no tiene sentido ante un 404.

**13. Helpers de test componibles en `shared/test-utils/`: cada test monta solo lo que usa.**
No necesitan nada de la app. Cada test pide solo los providers que usa, y hoy solo las páginas necesitan el router y Query a la vez:
- `render-with-router.tsx` (ya existe): `renderWithRouter`, para los tests que solo necesitan el router (`NotFoundPage`, `RootLayout`, el router de módulo, `App`).
- `render-with-query.tsx` (nuevo): `renderHookWithQuery`, para los tests de hooks. Crea un `QueryClient` nuevo por llamada, con `retry: false` y sin reintentos que alarguen el test, y lo devuelve por si un test necesita inspeccionar la caché. Aquí vive también la creación del cliente de test, para que no se duplique.
- `render-with-providers.tsx` (nuevo): `renderWithProviders`, router y Query a la vez, para los tests de páginas; reutiliza el cliente de test de `render-with-query.tsx`.
`renderWithQuery` para componentes que solo necesiten Query no se crea todavía: su primer usuario será el test del indicador global, en `loading-indicator`. Tampoco se acepta aún un `QueryClient` de fuera como opción; se añadirá cuando un test necesite precargar la caché. `core/test-utils/` nacería con un provider propio de `core/` (por ejemplo el usuario actual), que envolvería a estos.
*Alternativa:* un solo `renderWithProviders` con opciones (`router`, `query`). Descartada: el nombre oculta lo que monta y cada llamada tendría que acordarse de las banderas.

**14. Exports nombrados para lo que no es un componente.**
Las utilidades, las constantes, los hooks, el proxy y los mappers usan exports nombrados (`fetchJson`, `usePosts`, `postProxy`, `toPost`). Los componentes, las páginas y los routers de módulo siguen con `export default`, como hasta ahora (el router lo exige `lazy`). Con exports nombrados, `vi.mock` de un hook o del wrapper devuelve un objeto con esa función (`{ usePosts: vi.fn() }`) y `vi.mocked(usePosts)` tipa el sustituto.

**15. Los documentos se actualizan por grupo, con el texto de abajo.**
La regla nueva es la 21, al final y sin renumerar, para no romper las referencias desde `conventions.md` y los changes archivados; va en una sección propia, "Contenido de las carpetas". La regla 15 no cambia: el `QueryClientProvider` no es de rutas.

### Contenido acordado de los cambios en `docs/architecture.md`

- Árbol de `src/`: `main.tsx    punto de entrada; monta los providers: QueryClientProvider y BrowserRouter`. La nota de `app/example/` pasa a decir que es un módulo temporal que prueba el patrón de rutas y de datos (consume JSONPlaceholder) y que se borra, con su entrada en `routes.ts`, al crear el primer módulo real.
- Regla 10: `proxy/` contiene solo peticiones por recurso: el wrapper de `fetch` y el tipo de error viven en `shared/utils/http/`. Sin *provisional*.
- Regla 14: se añade al final, y se quita el *provisional*: «Las consultas y mutaciones (`useQuery`, `useMutation` y similares) solo se declaran en archivos de `hooks/`; las páginas y los componentes no las declaran directamente, pero sí usan lo que esos hooks devuelven (`refetch`, `mutate`) y pueden leer el estado global de carga (`useIsFetching`, `useIsMutating`).»
- Regla 17: se añade «Cada subcarpeta de `utils/` (por ejemplo `utils/http/`) lleva su propio `__tests__/`.»
- Regla 18: «Los archivos de `domain/` y `utils/` (incluidas sus subcarpetas) van sin sufijo.»
- Regla 21, nueva: «`utils/` contiene TypeScript puro (sin JSX, hooks ni APIs de React), agrupado por tema en subcarpetas cuando hace falta (`utils/http/`); `components/` y `hooks/` contienen código de React. Los tipos y constantes transversales viven junto a la utilidad que los usa, no en una carpeta de tipos aparte. `domain/` queda reservado para entidades de negocio.»
- Decisiones abiertas: se quita la del wrapper, el tipo de error y el `QueryClient`.

### Contenido acordado de la convención 7 (sustituye a la actual)

> 7. **Tests**:
>    - **Qué se sustituye**: solo en las fronteras, que son otras páginas o módulos y la red. `App` sustituye los routers de módulo y el router de un módulo, sus páginas. La red se sustituye en el punto más cercano a ella que el test no prueba: las páginas y los hooks, el proxy; el proxy, el wrapper de `fetch`; el wrapper, `fetch`. Lo demás se ejecuta de verdad (los hooks, la caché de consultas y los mappers), y tampoco se sustituyen los componentes puros de `shared/`, que son deterministas y ya tienen su propio test.
>    - **Niveles**: un test por componente, página, hook, proxy, mapper y utilidad; las páginas y los hooks se prueban con los providers que necesiten (router y Query, con los helpers de `shared/test-utils/`) y el proxy sustituido; el router de un módulo solo comprueba que enruta, con sus páginas sustituidas; el test de `App` solo prueba su cableado. No hay tests de integración de módulo (router con páginas reales) en Vitest.
>    - **Mocks**: `vi.mock` en línea para módulos (routers, páginas, el wrapper de `fetch`) y `vi.spyOn` para objetos como `postProxy`, restaurando los espías entre tests; `mocks/` queda para datos de prueba (regla 14 de `architecture.md`). El texto de un stub es el nombre del componente en inglés (`Example page`).
>    - **Sin red**: ningún test llama a la red ni usa MSW. El flujo contra una API real queda para los tests e2e del primer módulo real.

## Risks / Trade-offs

- [JSONPlaceholder puede caerse, cambiar o limitar peticiones] → Solo afecta a `npm run dev`; los tests no usan la red. Cambiar de API es cambiar `VITE_API_URL`.
- [El POST no se guarda y parece un fallo] → La página lo dice explícitamente tras crear.
- [`Response` y `fetch` en el entorno jsdom de Vitest podrían no comportarse como en el navegador] → Los tests del wrapper construyen respuestas con `Response` y sustituyen `fetch`; se comprueba al implementar y, si hace falta, se ajusta el entorno de ese archivo.
- [Un `afterEach` global que restaura espías y stubs podría tapar un test que dependa de uno anterior] → Es el comportamiento deseado (aislar); se añade a `setup-tests.ts` y se comprueba que los 20 tests actuales siguen pasando.
- [Una errata en una clave de caché en línea no da error] → Un test del hook comprueba el refetch tras crear; el resto de claves tienen un solo consumidor.
- [Las páginas reciben el resultado completo de Query y podrían acabar dependiendo de detalles de la librería] → Se acepta: necesitan `refetch` y `mutate`; la regla de la 14 evita que declaren consultas por su cuenta, y se vigila en la revisión de los PR.
- [El `message` de `HttpError` incluye la URL completa; si algún día lleva datos sensibles en la query, aparecería en los registros] → Hoy no hay ninguno; se revisa cuando llegue la autenticación.
- [Los tests de página dependen de Query y son asíncronos: el estado de carga necesita una promesa que no se resuelve y los demás, esperar con `findBy`] → Los helpers crean un cliente con `retry: false` por render, y los espías se restauran en el `afterEach` global.
- [Un fallo en un hook rompe también los tests de las páginas que lo usan] → Es el coste de no aislar cada capa; el test del propio hook, que sustituye solo el proxy, localiza la causa.
- [Las devtools acaban en el bundle de producción] → El componente es un vacío fuera de `development` y se comprueba en el build buscando la cadena `tsqd-` en `dist/assets` (tarea 2.1 y 6.1); si apareciera, se importan de forma dinámica detrás de `import.meta.env.DEV`.
- [Las devtools exigen que `@tanstack/react-query` esté en una versión compatible (`^5.106.1`)] → Se instalan juntas y se comprueba que ambas quedan en la misma 5.x.
- [El cliente al nivel del módulo en `main.tsx` se recrea en cada recarga en caliente de ese archivo] → Solo afecta al desarrollo y vacía la caché; aceptable.
- [Los defaults de `main.tsx` no los prueba ningún test (el archivo está excluido de cobertura)] → Son tres líneas de configuración; si crecen, se extraen a un archivo con su test.
- [El change es grande] → Seis grupos con pausa y commit entre ellos, cada uno con su propia verificación.
- [La regla de que las consultas solo viven en hooks depende de la revisión] → Se cumple con los documentos y la revisión de los PR, como el resto de reglas de arquitectura; el lint no se encarga de las prácticas del equipo.

## Migration Plan

1. Dependencia, `.env.example` y `shared/utils/http/` con sus tests, y las reglas de `architecture.md` que cubre.
2. `main.tsx`, los helpers `render-with-query` y `render-with-providers`, el `afterEach` global y `ErrorMessage`.
3. Capa de datos de `example`: dominio, mocks, mapper y proxy con sus tests.
4. Hooks con sus tests, la regla 14 y la convención 7.
5. Páginas con sus tests, y el árbol y la nota de `example` en `architecture.md`.
6. Verificación final y `README.md`.

## Open Questions

- Si declarar el tipo de `VITE_API_URL` en un archivo `.d.ts` cuando haya más variables de entorno.
- Si validar las respuestas en ejecución con esquemas (`validation/`, `.schema.ts`): se haría con Zod; se decide con el primer módulo real.
