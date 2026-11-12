# Proposal

## Why

Los tests llaman a `userEvent.click` y `userEvent.type` directamente. `user-event` 14 recomienda crear
una instancia por test con `userEvent.setup()`: las llamadas directas crean una instancia nueva en
cada llamada, así que el estado del usuario simulado (teclas pulsadas, posición del puntero,
portapapeles) no se conserva entre acciones del mismo test. Hoy no falla nada, pero la convención
tiene que quedar fijada antes de que el primer módulo real añada interacciones más largas
(escribir, tabular, pulsar varias veces).

## What Changes

- Los cuatro archivos de test que usan `userEvent` (`ErrorFallback.test.tsx`, `PostForm.test.tsx`,
  `ExamplePage.test.tsx`, `App.test.tsx`) crean `const user = userEvent.setup()` al principio de cada
  test que interactúa y usan `user.click` / `user.type`. Los helpers de test que interactúan
  (`submit`, `fillValid`, `openForm`, `fillForm`) reciben `user`.
- `docs/conventions.md`, convención 7 («Tests»): nueva viñeta que fija `userEvent.setup()` por test
  y prohíbe las llamadas directas a `userEvent.<acción>`, e indica que `npm run lint` lo comprueba.
- `eslint.config.js`: regla `no-restricted-syntax` en los archivos de test que prohíbe
  `userEvent.<acción>` y solo permite `userEvent.setup()`.
- Sin cambios de comportamiento ni de código de producción.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

Ninguna. Es un cambio de tooling y convención de tests; el change declara `skip_specs: true`.

## Impact

- Código: los cuatro tests listados arriba y `eslint.config.js`.
- Docs: `docs/conventions.md` (convención 7). `docs/architecture.md` no cambia: no hay decisión de
  estructura.
- Dependencias: ninguna (`@testing-library/user-event` ya está en `package.json`).
