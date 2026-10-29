# Tasks

## 1. Prettier

- [x] 1.1 Consultar la documentación oficial de Prettier (versión estable, config en TypeScript, `.prettierignore`) y registrar versión y pasos en la sección "Compatibilidad verificada" de `design.md`; verificar que la sección lista versión y comando de instalación
- [x] 1.2 Instalar `prettier` como devDependency y verificar que `npm ls prettier` no reporta errores
- [x] 1.3 Crear `prettier.config.ts` con la configuración de la decisión 2 y verificar que `npx prettier --check prettier.config.ts` carga la config sin error y que `npx tsc -b` la cubre (añadirla a `include` de `tsconfig.node.json`)
- [x] 1.4 Crear `.prettierignore` (`dist`, `coverage`, `node_modules`, `package-lock.json`, `openspec`, `.claude`) y verificar que `npx prettier --check .` no lista ningún archivo de esas rutas
- [x] 1.5 Añadir scripts `format` y `format:check` a `package.json` y verificar que `npm run format:check` funciona y señala los archivos sin formatear
- [x] 1.6 Formatear el repo con `npm run format` en un commit aislado (`style: format with prettier`) y verificar que `npm run format:check` y `npm run lint` pasan sin tocar `eslint.config.js` para formato

## 2. Reglas de ESLint

- [x] 2.1 Consultar la documentación de las reglas (núcleo de ESLint, `typescript-eslint` y `react-hooks`) en las versiones instaladas, confirmar nombres y opciones y registrarlo en "Compatibilidad verificada" de `design.md`; verificar que la sección lista las 10 reglas con sus opciones
- [x] 2.2 Añadir a `eslint.config.js` un bloque con las 10 reglas de la decisión 10 y el override de tests (`**/*.test.{ts,tsx}` y `src/test/**` sin `explicit-function-return-type`); verificar con `npx eslint --print-config src/App.tsx` que las 10 reglas están activas con las opciones esperadas y que `no-explicit-any` sigue en error
- [x] 2.3 Corregir el código existente que incumpla las reglas (p. ej. tipar `App` como `FC` y el parámetro `count` que sombrea a la variable de estado) sin desactivar ninguna regla; verificar que `npm run lint` pasa
- [x] 2.4 Verificar que cada regla se dispara con un archivo temporal que incumpla las 10 (sin commitearlo) y que el override de tests silencia solo `explicit-function-return-type`

## 3. Vitest y cobertura

- [x] 3.1 Consultar la documentación oficial de Vitest, `@vitest/coverage-v8` y Testing Library (compatibilidad con Vite 8, TS 6 y React 19) y registrar versiones y pasos en "Compatibilidad verificada" de `design.md`; verificar que la sección lista versiones y comando de instalación
- [x] 3.2 Instalar `vitest`, `@vitest/coverage-v8` (misma versión que `vitest`), `jsdom`, `@testing-library/react`, `@testing-library/dom` (peer obligatorio), `@testing-library/jest-dom` y `@testing-library/user-event` como devDependencies y verificar que `npm ls` no reporta conflictos de peers
- [x] 3.3 Crear `vitest.config.ts` que combine la config de Vite con `mergeConfig` y defina `test` (entorno `jsdom`, `setupFiles`) y `coverage` (proveedor v8, reportes `text` y `html`, `thresholds` del 80 % en statements, branches, functions y lines, `include` de `src/**/*.{ts,tsx}` y `exclude` de `src/main.tsx`, tests, `src/test/**` y `.d.ts`), añadirlo a `include` de `tsconfig.node.json` y crear `src/test/setup.ts` que importe `@testing-library/jest-dom/vitest`; verificar que `npx vitest run` arranca sin errores de configuración, que `npx tsc -b` compila y que `vite.config.ts` quedó sin cambios
- [x] 3.4 Verificar que los tipos de `jest-dom` y `user-event` compilan en un test con `npx tsc -b`; el import del setup basta, así que `tsconfig.app.json` no se modifica
- [x] 3.5 Añadir scripts `test`, `test:watch` y `test:coverage` a `package.json`
- [x] 3.6 Añadir `coverage` a `.gitignore` y a `globalIgnores` de `eslint.config.js` (ya está en `.prettierignore`) y verificar que `git status` no muestra la carpeta y que `npm run lint` no da warnings tras generar un reporte
- [x] 3.7 Escribir dos tests para `App`: uno de renderizado y otro que hace clic en el botón con `user-event` y comprueba que el contador sube; verificar que `npm test` pasa con 2 tests en verde y que `npm run test:coverage` imprime la tabla con al menos 80 % en los cuatro indicadores y genera `coverage/`
- [x] 3.8 Verificar que un test roto hace fallar `npm test` con código distinto de 0 (prueba temporal, sin commitearla)
- [x] 3.9 Verificar que bajar la cobertura por debajo del umbral (por ejemplo, añadir temporalmente una función sin test en `src/`) hace fallar `npm run test:coverage` con código distinto de 0 (prueba temporal, sin commitearla)

## 4. Husky y lint-staged

- [ ] 4.1 Consultar la documentación oficial de Husky 9 y lint-staged (versiones, formato de config, script `prepare`) y registrar versiones y pasos en "Compatibilidad verificada" de `design.md`; verificar que la sección lista versiones y pasos
- [ ] 4.2 Instalar `husky` y `lint-staged` como devDependencies y añadir `"prepare": "husky"` a `package.json`; verificar que `npm install` crea la carpeta `.husky/_`
- [ ] 4.3 Configurar `lint-staged` en `package.json`: `*.{ts,tsx}` → `eslint --fix`, `prettier --write`; `*.{json,css,html,md}` → `prettier --write`; verificar que un archivo de `openspec/` en staging no es modificado
- [ ] 4.4 Crear `.husky/pre-commit` con `npx lint-staged`, `npm run build` y `npm run test:coverage` en ese orden, y verificar que un commit con un archivo mal formateado queda formateado y que uno con error de lint es rechazado
- [ ] 4.5 Verificar que el hook bloquea el commit cuando el build falla (error de tipos temporal) cuando un test falla (test roto temporal) y cuando la cobertura queda bajo el umbral (función sin test temporal), y que las tres pruebas se revierten sin commitearse
- [ ] 4.6 Documentar en `README.md` los scripts, el hook y cómo se instala, y verificar que los comandos documentados funcionan tal como están escritos

## 5. Integración

- [ ] 5.1 Partiendo de un clon limpio (`git clone` + `npm install`), verificar que el hook se activa solo y que `npm run lint`, `npm run format:check`, `npm run build` y `npm run test:coverage` pasan

## Workflow follow-up

- Archivar el change con `/opsx:archive` una vez verificado.
