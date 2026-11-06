# Proposal

## Why

La app no puede pedir datos a ningún sitio. `docs/architecture.md` deja abiertas varias decisiones que dependen de ello: la forma del wrapper de `fetch` y del tipo de error, dónde va el `QueryClient`, y las reglas 10 y 14 siguen marcadas como provisionales a la espera de este change. La convención 7 tiene un pendiente (cómo se sustituye el backend en los tests). El primer módulo real va a necesitar todo esto, y el módulo `example` es el sitio donde probarlo sin negocio inventado: al terminar, `example` tiene routing y capa de datos, que es el punto donde se marca la plantilla. El backend (Express) se construye en paralelo; la capa de datos se apoya en una API pública (JSONPlaceholder) y se cambia a la propia con una variable de entorno.

## What Changes

- Instalar `@tanstack/react-query` (v5) y, como dependencia de desarrollo, `@tanstack/react-query-devtools`.
- Crear `src/shared/utils/http/` con el acceso a datos, cada archivo con su test:
  - `fetch-json.ts`: wrapper de `fetch` que serializa y parsea JSON, lanza `HttpError` si la respuesta no es 2xx, acepta respuestas 204 sin cuerpo, pasa el `signal` para poder cancelar y resuelve las rutas relativas contra `VITE_API_URL` (con error claro si falta).
  - `http-error.ts`: clase `HttpError` con `status`, `statusText`, `method`, `url` y `body`, y un mensaje armado con el método, la URL y el estado.
  - `http-method.ts` y `http-status.ts`: objetos `as const` (`httpMethod`, `httpStatus`) con sus tipos, sin `enum`.
- Crear el `QueryClient` en `src/main.tsx`, una sola vez, y envolver la app con `QueryClientProvider` junto al `BrowserRouter`, montando dentro las devtools de Query (cerradas por defecto). No hay fábrica compartida.
- Versionar un `.env.example` con `VITE_API_URL` apuntando a JSONPlaceholder, añadir `.env` al `.gitignore` y documentar en el `README.md` que hay que copiar el ejemplo a `.env` antes de arrancar.
- Activar en `vitest.config.ts` el aislamiento entre tests (`clearMocks`, `restoreMocks`, `unstubGlobals` y `unstubEnvs`), para que las llamadas de los mocks, los espías, las globales y las variables de entorno sustituidas no pasen de un test al siguiente.
- Crear en `src/shared/test-utils/` dos helpers componibles, junto al `renderWithRouter` existente: `render-with-query.tsx` (`renderHookWithQuery`, con un `QueryClient` propio por render y la configuración de los tests) y `render-with-router-and-query.tsx` (`renderWithRouterAndQuery`, router y Query a la vez, para las páginas). Cada test monta solo lo que usa.
- Crear `src/shared/components/ErrorMessage/`: solo un mensaje (`role="alert"`), sin botones.
- Convertir `src/app/example/` de estático a un módulo con datos, con las capas de la regla 14:
  - `domain/post.ts` con `Post`, `PostResponse` y `CreatePostRequest`.
  - `mappers/post.mapper.ts`, que traduce `userId` a `authorId` y al revés.
  - `proxy/post.proxy.ts` con el objeto `postProxy` (`getAll`, `getById`, `create`).
  - `hooks/` con `usePosts`, `usePost` y `useCreatePost`, que devuelven el resultado completo de Query (`UseQueryResult` y `UseMutationResult`, con el error tipado como `Error`); las claves de caché van en línea y la mutación invalida la lista.
  - `mocks/post.mock.ts` con datos de prueba.
  - `ExamplePage` pasa a listar posts y a ofrecer un botón que crea uno con un payload fijo; `ExampleDetailPage` muestra un post. Ambas muestran el `Spinner` al cargar y `ErrorMessage` si falla.
- Actualizar `docs/architecture.md`: regla 10 (el wrapper y el error viven en `shared/utils/http/`, sin *provisional*), regla 14 (sin *provisional*, y las consultas y mutaciones solo se declaran en `hooks/`), regla 17 (cada subcarpeta de `utils/` lleva su propio `__tests__/`), regla 18 (los archivos de `utils/` y de sus subcarpetas van sin sufijo), regla 21 nueva (`utils/` es TypeScript puro, `components/` y `hooks/` son React, y los tipos y constantes transversales viven junto a su utilidad), la línea de `main.tsx` en el árbol, la nota de `example` y las decisiones abiertas.
- Actualizar `docs/conventions.md`: la convención 7 cierra el pendiente del backend (`vi.mock` para módulos, `vi.spyOn` para el objeto `postProxy`).
- Fuera de alcance, quedan para changes posteriores:
  - El indicador global de carga (`useIsFetching` y `useIsMutating`), con su barra de progreso y su `LoadingOverlay`: change `loading-indicator`.
  - El error boundary y la configuración del servidor para `BrowserRouter`, pendientes antes del primer deploy.
  - Validación de las respuestas en ejecución (`validation/`), el store, los tests e2e (Playwright) y una API local que guarde datos.
  - La rama `template` y su etiqueta, que Max prepara aparte.

## Capabilities

### New Capabilities

- `remote-data`: cómo trata la aplicación los datos que vienen de un servidor: una respuesta fallida es un error con su código, las pantallas muestran el estado de carga y el de error, y crear un elemento refresca los datos afectados.

### Modified Capabilities

<!-- Ninguna: `app-navigation` no cambia. -->

## Impact

- **Archivos nuevos**: `.env.example`, `src/shared/utils/http/` (4 archivos y sus tests), `src/shared/components/ErrorMessage/`, `src/shared/test-utils/render-with-query.tsx` y `render-with-router-and-query.tsx`, y en `src/app/example/`: `domain/`, `mappers/`, `proxy/`, `hooks/` (3 hooks con sus tests) y `mocks/`.
- **Archivos modificados**: `src/main.tsx`, `vitest.config.ts`, `ExamplePage` y `ExampleDetailPage` con sus tests, `README.md`, `.gitignore`, `docs/architecture.md`, `docs/conventions.md`, `package.json` y `package-lock.json`.
- **Dependencias**: `@tanstack/react-query` y, de desarrollo, `@tanstack/react-query-devtools`.
- **Red**: la app en ejecución (`npm run dev`) pide datos a JSONPlaceholder. Los tests automáticos no usan la red: se sustituye en las fronteras (el proxy en los tests de páginas y hooks, `fetchJson` en el del proxy y `fetch` en el del wrapper).
- **Estructura**: nacen `shared/utils/` (con la subcarpeta `http/`) y, dentro del módulo, `domain/`, `mappers/`, `proxy/`, `hooks/` y `mocks/`.
- **Verificación**: lint, formato, build y tests con cobertura (umbral 80 %). Lo que solo se ve en un navegador (los estados de carga y de error con la API real, el POST de ejemplo) queda sin verificar y se informa como tal.
