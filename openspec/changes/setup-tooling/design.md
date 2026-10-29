# Design

## Context

Proyecto Vite 8 + React 19 + TypeScript (fijado en `~6.0.3` porque `typescript-eslint` aún no soporta TS 7) con ESLint 10 en flat config (`eslint.config.js`) y Node 24. No hay Prettier, tests ni hooks de git. Motivación y alcance en `proposal.md`.

Restricciones: `verbatimModuleSyntax` y `erasableSyntaxOnly` están activos, y `tsconfig.app.json` solo incluye `src` con `types: ["vite/client"]`.

Observación verificada con `eslint --print-config`: de las 86 reglas activas, ninguna es de formato (ESLint las retiró de su núcleo y ni `js.recommended`, ni `typescript-eslint`, ni los plugins de React las incluyen).

## Goals / Non-Goals

**Goals:**
- Un único punto de control (pre-commit) que formatee y lintee lo staged y verifique build y tests con cobertura.
- Que los tests reutilicen la config de Vite (plugins y resolución) sin duplicarla, manteniendo `vite.config.ts` limpio de configuración de test.
- Que los archivos generados por herramientas externas (OpenSpec) no sean reescritos por el formateador.
- Un conjunto acotado de reglas de convenciones en ESLint, sin dependencias nuevas.

**Non-Goals:**
- CI remoto y tests e2e.
- Plugins nuevos de ESLint (`eslint-plugin-react`, `import`, `jsx-a11y`), reglas con información de tipos y `--max-warnings`.
- Reglas de ESLint que impongan límites de arquitectura (se definirán cuando exista la arquitectura).

## Decisions

**1. Prettier independiente de ESLint; ESLint no necesita integración de formato.**
ESLint solo detecta problemas y Prettier solo formatea. Como ESLint ya no trae reglas de estilo activas, `eslint-config-prettier` no tendría nada que apagar y se omite.
*Alternativas:* `eslint-config-prettier` (redundante hoy; solo tendría sentido si se añade un plugin de estilo como `@stylistic`); `eslint-plugin-prettier` (corre Prettier dentro de ESLint; descartada por lenta, por mezclar ruido de formato con errores reales y porque Prettier la desaconseja).

**2. Configuración de Prettier en `prettier.config.ts`, tipada con `Config`.**
Valores definidos por el equipo: `printWidth: 100`, `tabWidth: 2`, `useTabs: false`, `semi: true`, `singleQuote: true`, `quoteProps: 'as-needed'`, `jsxSingleQuote: true`, `trailingComma: 'all'`, `bracketSpacing: true`, `bracketSameLine: false`, `arrowParens: 'always'`, `proseWrap: 'always'`, `endOfLine: 'auto'`.
*Alternativa:* `.prettierrc` JSON. Descartada: no permite tipado ni comentarios.
Verificado con Prettier 3.9.10 y Node 24.22.1: un `prettier.config.ts` con `import type { Config } from 'prettier'` carga y formatea correctamente. Condiciones: `"type": "module"` en `package.json` (ya presente) y un Node con soporte nativo de TypeScript (Node 24 lo trae). El archivo se añade a `include` de `tsconfig.node.json` para que `tsc -b` lo revise.

**3. `.prettierignore` excluye `openspec/` y `.claude/` además de lo habitual.**
Con `proseWrap: 'always'` Prettier reescribiría los `.md` de OpenSpec, que genera y mantiene el CLI, y los comandos y skills que `openspec init` generó en `.claude/`. Solo se formatean archivos del proyecto. También se ignoran `dist`, `coverage`, `node_modules` y `package-lock.json`.

**4. Vitest configurado en `vitest.config.ts` separado.**
Cuando existen `vitest.config.ts` y `vite.config.ts`, Vitest usa el primero e ignora el segundo, así que `vitest.config.ts` importa la config de Vite y la combina con `mergeConfig(viteConfig, defineConfig({ test: { ... } }))` para reutilizar el plugin de React y la resolución. Entorno `jsdom`, `globals: false` (imports explícitos) y un `setupFiles` con `@testing-library/jest-dom/vitest`. Los tests viven junto al código (`*.test.ts(x)`). El archivo se añade a `include` de `tsconfig.node.json`.
Esto mantiene `vite.config.ts` con solo la configuración de producción, sin la clave `test` ni coverage.
*Alternativa:* clave `test` dentro de `vite.config.ts`. Descartada: mezcla configuración de test con la de producción; su única ventaja es un archivo menos.

**5. Cobertura con `@vitest/coverage-v8` y umbral del 80 %.**
Umbral del 80 % en `statements`, `branches`, `functions` y `lines`. Si no se alcanza, Vitest termina con código distinto de 0 y el hook rechaza el commit. Reportes `text` y `html`, carpeta `coverage/` ignorada en git y Prettier.
Para que el umbral sea significativo se define qué se mide: `include: ['src/**/*.{ts,tsx}']` y `exclude` de `src/main.tsx` (solo monta la app en el DOM, sin lógica), los archivos de test, `src/test/**` y los `.d.ts`.
El `App` actual es el contador del template: para cubrir su única función propia (el `onClick`) hacen falta un test de renderizado y otro de interacción. Esos tests se reescriben cuando `App` se reemplace.
La versión de `@vitest/coverage-v8` debe coincidir con la de `vitest`.
*Alternativa:* cobertura solo informativa, sin umbral. Descartada: se decidió exigir el 80 % desde el inicio porque la app es simple y cubrirla es viable.

**6. Tipos de test en `tsconfig.app.json`.**
Con `globals: false` solo hace falta que el setup importe `@testing-library/jest-dom/vitest`. Así `tsc -b` (parte del build) verifica también los tests.

**7. Husky 9 + lint-staged; un único hook `pre-commit`.**
`.husky/pre-commit` ejecuta en orden, y aborta en el primer fallo:
1. `npx lint-staged`: sobre `*.{ts,tsx}` corre `eslint --fix` y `prettier --write`; sobre `*.{json,css,html,md}` solo `prettier --write`.
2. `npm run build`: `tsc -b && vite build`, que ya cubre la verificación de tipos.
3. `npm run test:coverage`.
Build y tests operan sobre el proyecto completo, por eso van como comandos del hook y no dentro de lint-staged (que trabaja por archivo). No hay `pre-push`, ni script `typecheck`, ni `vitest related`: el build y la suite completa los hacen redundantes.
*Alternativa:* build y suite completa en `pre-push` con un pre-commit ligero. Descartada por ahora: con el proyecto pequeño el costo es de segundos y un solo punto de control es más simple. Mover los pasos pesados a `pre-push` cuando el commit se vuelva lento es un cambio de una línea.

**8. Scripts de npm como interfaz única.**
`format`, `format:check`, `test` (`vitest run`), `test:watch` (`vitest`), `test:coverage` (`vitest run --coverage`). Los hooks y el futuro CI llaman a estos scripts, no a comandos sueltos.

**9. Husky se instala vía `prepare`.**
El script `"prepare": "husky"` activa los hooks tras `npm install`, sin pasos manuales para quien clone el repo.

**10. Convenciones de ESLint propias, solo con reglas que no requieren plugins nuevos.**
Se añade a `eslint.config.js` un bloque de reglas, adaptadas de una config previa en formato eslintrc (no utilizable con ESLint 10, que solo acepta flat config):
- Recomendadas: `curly`, `eqeqeq` (`'always'`, evita la coerción de `==` al comparar montos o ids), `no-console`, `@typescript-eslint/consistent-type-definitions`, `@typescript-eslint/no-shadow` y `react-hooks/exhaustive-deps` en `error` (hoy es warning y no bloquea el commit).
- Preferencias del equipo: `@typescript-eslint/explicit-function-return-type` (`allowExpressions: true`), `camelcase` (`ignoreDestructuring: true`, `properties: 'never'`), `no-underscore-dangle` (`allowAfterThis: true`) y `no-nested-ternary` (evita ternarios anidados ilegibles en JSX).
`no-explicit-any` se mantiene en `error` (no se porta el `0` de la config previa). Un override apaga `explicit-function-return-type` en los tests (`**/*.test.{ts,tsx}` y `src/test/**`).
`explicit-function-return-type` no distingue componentes de funciones normales, así que por ahora aplica a todo el código. Cómo ajustarla para componentes (por ejemplo, limitarla a archivos `.ts` o tipar el retorno con `JSX.Element`) se decide al construir la aplicación, cuando existan componentes reales.
No se porta: `eslint-config-airbnb` (peers solo hasta ESLint 8 y reglas de formato/estilo que ya cubre Prettier), `plugin:prettier/recommended` (contradice la decisión 1), `env: jest` (Vitest con imports explícitos), los `settings` de `import/*`, `jsx-filename-extension`, `require-default-props` y las reglas de `react/*` (dependen de `eslint-plugin-react`, que no declara soporte para ESLint 10).
*Alternativa:* bajar a ESLint 9 para poder usar `eslint-plugin-react` e `import`. Descartada: sacrifica la versión actual por reglas de estilo.

## Risks / Trade-offs

- [Las reglas nuevas rompen código existente o se vuelven ruidosas, sobre todo `explicit-function-return-type` en componentes] → el código existente se corrige en la tarea 2.3; se usa `allowExpressions` y el override de tests; el ajuste fino para componentes se decide al construir la aplicación y se aplica en `eslint.config.js`.
- [Código nuevo sin tests puede bloquear commits por el umbral del 80 %] → es intencional; salidas: añadir los tests, bajar el umbral en `vitest.config.ts` o, en emergencias, `--no-verify`.
- [El commit se vuelve lento al crecer el proyecto] → mover `build` y `test:coverage` a `.husky/pre-push`, cambio de una línea.
- [Build y tests corren sobre el árbol de trabajo, no sobre lo staged, así que un commit parcial podría pasar sin que lo staged sea válido por sí solo] → aceptado; se revisa en CI cuando exista.
- [`--no-verify` salta los hooks] → aceptado en un proyecto personal; un futuro CI sería la red de seguridad.
- [Formatear todo el repo genera un diff grande, y `semi: true` cambia el estilo del template] → hacerlo en un commit aislado (`style: format with prettier`).
- [Los archivos de OpenSpec no se formatean] → es intencional; lint-staged pasa los `.md` staged a Prettier, que los omite por `.prettierignore`.
- [Hooks no se activan si falla `prepare`] → documentarlo en el README y validarlo en las tareas con un clon limpio.
- [`prettier.config.ts` falla en un Node sin soporte nativo de TypeScript] → plan B: renombrarlo a `prettier.config.js` (misma config, sin tipado) o fijar la versión de Node del proyecto.
- [Compatibilidad de Vitest y coverage con Vite 8 y TS 6] → investigación previa en cada grupo y fijar la última versión compatible si hay conflicto de peers.

## Migration Plan

1. Instalar y configurar Prettier y Vitest sin hooks; formatear el repo en un commit aparte.
2. Activar el hook al final, cuando los scripts ya funcionan.
3. Rollback: quitar `prepare` y la carpeta `.husky/`; las demás herramientas siguen siendo utilizables a mano.

## Compatibilidad verificada

Se completa durante el apply, con la primera tarea de cada grupo: una subsección por herramienta.

### Prettier

- Versión estable: 3.9.10.
- Instalación: `npm install -D prettier`.
- Config en TypeScript: `prettier.config.ts` está entre los nombres que Prettier busca. Requiere Node >= 22.6.0 y, antes de Node 24.3.0, el flag `--experimental-strip-types`; con Node 24.22.1 no hace falta flag. La documentación usa `import { type Config } from 'prettier'`.
- `.prettierignore`: sintaxis de gitignore, en la raíz. Prettier ignora por defecto `.git` y `node_modules`, y respeta `.gitignore` si existe. La documentación no dice qué ocurre con un archivo ignorado que se pasa explícitamente por CLI (como hace lint-staged); se comprueba en la tarea 4.3.
