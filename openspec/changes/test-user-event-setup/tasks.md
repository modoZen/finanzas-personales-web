# Tasks

## 1. Migrar los tests a `userEvent.setup()`

- [x] 1.1 En `src/shared/components/ErrorFallback/__tests__/ErrorFallback.test.tsx` y `src/__tests__/App.test.tsx`, crear `const user = userEvent.setup();` antes de `render` en cada test que interactúa y sustituir `userEvent.click` por `user.click`; verificar que `grep -n "userEvent\." ` en esos dos archivos solo encuentra `userEvent.setup()` y que `npx vitest run src/shared/components/ErrorFallback src/__tests__/App.test.tsx` pasa sin cambiar ninguna aserción
- [x] 1.2 En `src/app/example/components/PostForm/__tests__/PostForm.test.tsx`, crear `user` por test y pasarlo a los helpers `submit` y `fillValid` (parámetro `user: UserEvent`, importado con `import type`); verificar que no quedan llamadas directas a `userEvent.<acción>`, que `npx vitest run src/app/example/components/PostForm` pasa y que el número de tests no cambia
- [x] 1.3 En `src/app/example/pages/ExamplePage/__tests__/ExamplePage.test.tsx`, lo mismo para `openForm` y `fillForm`, y para los tests que pulsan «Cancelar» y el botón de envío; verificar que no quedan llamadas directas a `userEvent.<acción>`, que `npx vitest run src/app/example/pages/ExamplePage` pasa y que el número de tests no cambia

## 2. Convención y verificación final

- [ ] 2.1 Añadir en `eslint.config.js`, en un bloque nuevo para `**/*.test.{ts,tsx}`, la regla `no-restricted-syntax` con el selector y el mensaje de `design.md`; verificar que `npm run lint` pasa, que al reintroducir temporalmente un `userEvent.click(...)` en un test falla con el mensaje en español (y revertirlo) y que `userEvent.setup()` no se marca
- [ ] 2.2 Añadir a la convención 7 de `docs/conventions.md` la viñeta «Interacción» descrita en `design.md`, indicando que `npm run lint` la comprueba; verificar que `npx prettier --check docs` pasa y que `git diff docs` solo añade líneas dentro de la convención 7 y no toca `docs/architecture.md`
- [ ] 2.3 Verificar con `grep -rn "userEvent\.\(click\|type\|keyboard\|hover\|clear\|tab\|selectOptions\|paste\)" src` que no queda ninguna llamada directa, que ningún test usa `vi.useFakeTimers` junto a `user-event` y que `npm run lint`, `npm run format:check`, `npx tsc -b` y `npm run test:coverage` pasan con los umbrales del 80 %
- [ ] 2.4 Comprobar el cumplimiento de `docs/architecture.md` y `docs/conventions.md`: ningún archivo nuevo ni movido (regla 17), imports sin extensión y con `@/` entre carpetas de primer nivel (regla 13 y convención 5), y los tests siguen sustituyendo solo en las fronteras (convención 7); verificar con `git status` y `git diff --stat` que solo cambian los cuatro tests, `eslint.config.js` y `docs/conventions.md`
