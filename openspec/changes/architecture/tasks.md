# Tasks

## 1. Alias `@/`

- [x] 1.1 Consultar la documentación oficial de Vite (`resolve.alias`) y de TypeScript (`paths` con `moduleResolution: "bundler"`) contra las versiones instaladas, y registrar versiones y pasos en una sección "Compatibilidad verificada" de `design.md`; verificar que la sección lista ambas herramientas y la forma exacta de la configuración
- [x] 1.2 Agregar `paths` (`"@/*": ["./src/*"]`) a `tsconfig.app.json` y verificar que `npx tsc -b` sigue pasando
- [x] 1.3 Agregar `resolve.alias` (`@` → `./src`, calculado con `fileURLToPath(new URL('./src', import.meta.url))`) a `vite.config.ts` y verificar que `npx tsc -b` (que cubre `vite.config.ts`) y `npm run build` pasan
- [x] 1.4 Cambiar el import de `App` en `src/main.tsx` a `@/App` (sin extensión) y verificar que `npm run build`, `npm test` (Vitest hereda el alias por `mergeConfig`) y `npm run lint` pasan, y que `npm run dev` arranca y muestra el título

## 2. Setup y tests de la raíz

- [ ] 2.1 Mover `src/test/setup.ts` a `src/setup-tests.ts` con `git mv` y actualizar las tres referencias: `setupFiles` y la exclusión de cobertura en `vitest.config.ts` (que además excluye `**/test-utils/**`), y el override de tests en `eslint.config.js` (que además cubre `**/test-utils/**`); verificar que `grep -rn "src/test" src vitest.config.ts eslint.config.js tsconfig.app.json tsconfig.node.json package.json lint-staged.config.ts .husky` no devuelve resultados, que `src/test/` ya no existe y que `npm test` y `npm run lint` pasan
- [ ] 2.2 Mover `src/App.test.tsx` a `src/__tests__/App.test.tsx` con `git mv`, cambiando su import de `App` a `../App` (sin extensión); verificar que `npm test` pasa, que `npx tsc -b` compila y que `npm run test:coverage` mantiene al menos 80 % en los cuatro indicadores

## 3. Documentos de reglas

- [ ] 3.1 Crear `docs/architecture.md` con el texto de `design.md` (sección "Contenido acordado") y verificar que tiene las 20 reglas numeradas, las marcas de provisional en las reglas 10, 11, 12, 14, 15 y 16, las decisiones abiertas y ninguna sección de excepciones, y que `npx prettier --check docs/architecture.md` pasa
- [ ] 3.2 Verificar que lo que existe hoy en `src/` cumple las reglas de `docs/architecture.md`: con `git ls-files src`, comprobar que `setup-tests.ts` y `__tests__/App.test.tsx` están presentes, que `src/test/` ya no existe y que `App.tsx` y `App.test.tsx` están en `PascalCase` (el árbol describe la estructura objetivo, por lo que no se compara archivo por archivo)
- [ ] 3.3 Crear `docs/conventions.md` con el texto de `design.md` y verificar que tiene las cinco reglas, que el código actual las cumple (`src/App.tsx` usa `const App: FC`, `grep -rn "enum " src` no devuelve resultados y `grep -rnE "from .*\.tsx?['\"]" src` tampoco) y que `npx prettier --check docs/conventions.md` pasa

## 4. `CLAUDE.md` y configuración de OpenSpec

- [ ] 4.1 Consultar la documentación de Claude Code sobre imports en `CLAUDE.md` (sintaxis `@ruta`) y registrar la forma exacta en "Compatibilidad verificada" de `design.md`; luego crear `CLAUDE.md` con la descripción breve, el idioma de las respuestas y los dos imports, y verificar que Max confirma en una sesión nueva que se cargan `docs/architecture.md` y `docs/conventions.md`
- [ ] 4.2 Modificar `openspec/config.yaml` con `context` (idioma de los artefactos), `rules.tasks` (tarea de actualización del documento al decidir estructura) y la guía de verificación en `operations.apply.guidance`, conservando la guía de commits existente; verificar que `openspec instructions tasks --change architecture --json` muestra la regla en `rules` y el contexto en `context`, y que `openspec status --change architecture` sigue funcionando
- [ ] 4.3 Verificar que la regla de idioma de `CLAUDE.md` y la de `context` en `config.yaml` coinciden (respuestas en español; artefactos en español con estructura en inglés) leyendo ambos archivos

## 5. README e integración

- [ ] 5.1 Agregar al `README.md` una sección que enlace `docs/architecture.md` y `docs/conventions.md`, y verificar que los enlaces apuntan a archivos existentes y que `npm run format:check` pasa
- [ ] 5.2 Con el árbol limpio, verificar que `npm run lint`, `npm run format:check`, `npm run build` y `npm run test:coverage` pasan, y que la cobertura mantiene al menos 80 % en los cuatro indicadores

## Workflow follow-up

- Archivar el change con `/opsx:archive` una vez verificado.
- `routing` es el siguiente change: debe confirmar o corregir las reglas 12, 15 y 16 y actualizar `docs/architecture.md`.
