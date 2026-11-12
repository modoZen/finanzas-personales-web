# Design

## Context

`@testing-library/user-event` ^14.6.8. Hay 20 llamadas directas a `userEvent.click`/`userEvent.type`
repartidas en cuatro archivos de test. Los tests no comparten instancia ni estado entre sí
(`cleanup` en `setup-tests.ts`).

## Decisions

### Una instancia por test, creada en el propio test

Cada test que interactúa empieza con `const user = userEvent.setup();`, antes de `render`
(así lo recomienda la documentación de `user-event`: `setup()` antes de renderizar).

Alternativas descartadas:

- **Instancia a nivel de módulo** (`const user = userEvent.setup()` fuera de `describe`): comparte
  estado de teclado y puntero entre tests, justo lo que `setup()` evita.
- **Helper en `shared/test-utils/` que devuelva `{ user, ...render }`**: `setup()` es una sola
  línea; un wrapper añadiría un archivo, su test (regla 17) y una dependencia más entre los helpers
  de render y `user-event` sin ganar nada.
- **`beforeEach` con `let user`**: obliga a tipar y reasignar una variable mutable para ahorrar una
  línea por test.

### Los helpers de interacción reciben `user`

`submit`, `fillValid`, `openForm` y `fillForm` pasan a recibir `user: UserEvent` (tipo exportado por
`@testing-library/user-event`, importado como tipo). Así siguen siendo helpers de archivo, sin
estado oculto, y el test decide cuándo crea la instancia.

### Documentar en la convención 7

Una viñeta nueva en «Tests» de `docs/conventions.md`, junto a «Mocks»: «Interacción: cada test que
simula al usuario crea `const user = userEvent.setup()` antes de `render` y usa `user.click`,
`user.type`…; no se llama a `userEvent.<acción>` directamente. Los helpers de test reciben `user`».
Es una regla de código, no de estructura: `architecture.md` no se toca. La viñeta añade que
`npm run lint` la comprueba.

### Regla de ESLint que lo aplica

En `eslint.config.js`, un bloque nuevo para `**/*.test.{ts,tsx}` con `no-restricted-syntax` y el
selector `CallExpression[callee.object.name='userEvent'][callee.property.name!='setup']`, con un
mensaje en español («Usa `const user = userEvent.setup()` y llama a `user.<acción>`»). Marca
cualquier `userEvent.<acción>(...)` sin listar las acciones una a una.

Limitaciones aceptadas: no detecta `import { click } from '@testing-library/user-event'` ni una
instancia compartida a nivel de módulo; esos casos se evitan por convención y revisión.

Alternativa descartada: `eslint-plugin-testing-library` no tiene una regla equivalente, y añadir un
plugin por una sola regla no compensa.

## Risks

- Los tests con temporizadores falsos (`vi.useFakeTimers`) necesitarían `advanceTimers` en
  `setup()`. Hoy ningún test de estos cuatro los usa; se comprueba en la tarea de verificación.
- La regla de ESLint se añade después de migrar los tests, así que `lint` no queda en rojo entre
  tareas; se comprueba que detecta una llamada directa reintroducida a propósito.
- Ninguna otra: el comportamiento simulado es el mismo, así que los tests deben pasar sin tocar
  aserciones.
