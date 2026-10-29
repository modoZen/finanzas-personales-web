# Proposal

## Why

El proyecto parte del template de Vite sin formateo automático, sin tests y sin ningún control previo al commit. Antes de escribir features conviene tener un pipeline de calidad que funcione de punta a punta, para que todo el código nuevo nazca formateado, lintado y probado, en lugar de arreglar código ya escrito.

## What Changes

- Agregar Prettier como formateador independiente de ESLint, con la configuración definida por el equipo en `prettier.config.ts`. ESLint no necesita integración: sus reglas activas ya no incluyen ninguna de formato.
- Añadir a `eslint.config.js` un conjunto acotado de reglas de convenciones que no requieren plugins nuevos: `curly`, `eqeqeq`, `no-console`, `consistent-type-definitions`, `no-shadow`, `exhaustive-deps` en error, `explicit-function-return-type`, `camelcase`, `no-underscore-dangle` y `no-nested-ternary`. `no-explicit-any` se mantiene en error.
- Agregar Vitest (más Testing Library y jsdom) para tests unitarios, configurado en un `vitest.config.ts` separado que reutiliza la config de Vite, con un test de humo que valide el pipeline, y reporte de cobertura con `@vitest/coverage-v8` con umbral mínimo del 80 % en statements, branches, functions y lines.
- Agregar Husky y lint-staged. Un único hook `pre-commit` ejecuta, en orden: lint-staged (ESLint y Prettier sobre los archivos staged), `npm run build` (incluye la verificación de tipos) y `npm run test:coverage`.
- Agregar scripts de npm: `format`, `format:check`, `test`, `test:watch`, `test:coverage`.
- Dejar fuera del formateo automático los archivos generados por OpenSpec (`openspec/`); solo se formatean los archivos del proyecto.
- Mantener fuera de alcance: estructura de carpetas/arquitectura, CI remoto, plugins nuevos de ESLint (`react`, `import`, `jsx-a11y`) y reglas con información de tipos.

## Capabilities

### New Capabilities
<!-- Ninguna: es infraestructura de desarrollo, no comportamiento del producto. -->

### Modified Capabilities
<!-- Ninguna. El change declara `skip_specs: true`. -->

## Impact

- **Dependencias (dev)**: `prettier`, `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`, `husky`, `lint-staged`.
- **Archivos nuevos**: `prettier.config.ts`, `.prettierignore`, `vitest.config.ts`, `.husky/pre-commit`, `lint-staged.config.ts`, setup de Vitest y un test de humo.
- **Archivos modificados**: `package.json` (scripts), `eslint.config.js` (reglas de convenciones), `src/App.tsx` (ajustes por las reglas nuevas), `tsconfig.node.json` (incluir `prettier.config.ts`, `vitest.config.ts` y `lint-staged.config.ts`), `.gitignore` (`coverage`), `README.md`. `vite.config.ts` no se modifica.
- **Flujo de trabajo**: cada commit ejecuta lint, build y tests con cobertura; un commit con errores de lint, de tipos, de build o con tests rotos será rechazado.
