# Proposal

## Why

El proyecto todavía no tiene `app/`, `shared/` ni ninguna regla escrita sobre cómo se organiza el código. Sin ellas, cada sesión de Claude Code (y cada PR) puede inventar su propia estructura, y corregirla después cuesta más cuanto más código exista. Los próximos changes (`routing` y `data-layer`) van a crear carpetas y a tomar decisiones de estructura, así que conviene dejar antes las reglas por escrito y el alias de imports que ambos van a usar.

## What Changes

- Crear `docs/architecture.md` con la estructura de `src/` (`app/`, `core/`, `shared/`, `proxy/`, `domain/`, `store/`), el catálogo de nombres de un módulo, 20 reglas (estructura, dependencias, rutas, archivos y mantenimiento) y las decisiones abiertas. Las reglas que dependen de código aún inexistente se marcan como provisionales hasta `routing` o `data-layer`.
- Crear `docs/conventions.md` con las convenciones de código que no son de carpetas ni archivos: componentes `const X: FC<Props> = () =>` (con excepción para genéricos), sin `enum`, idioma (código y commits en inglés, interfaz en español), Conventional Commits e imports sin extensión.
- Crear `CLAUDE.md` con una descripción breve del proyecto, los imports `@docs/architecture.md` y `@docs/conventions.md`, y la regla de idioma de las respuestas (español).
- Modificar `openspec/config.yaml`: `context` con el idioma de los artefactos (contenido en español, estructura en inglés), `rules.tasks` para que todo change que decida estructura incluya una tarea que actualice `docs/architecture.md`, y `operations.apply.guidance` para que la verificación del apply compruebe que el change respeta ambos documentos.
- Agregar el alias `@/` → `src/` en `tsconfig.app.json` (`paths`) y en `vite.config.ts` (`resolve.alias`), y comprobar que Vitest lo hereda. Se verifica cambiando el import de `App` en `main.tsx` a `@/App`.
- Mencionar los documentos en `README.md`.
- Mover el setup global de Vitest de `src/test/setup.ts` a `src/setup-tests.ts` y actualizar sus rutas en `vitest.config.ts` (`setupFiles` y exclusión de cobertura) y en `eslint.config.js` (override de los tests). La carpeta `src/test/` desaparece.
- Mover `src/App.test.tsx` a `src/__tests__/App.test.tsx`, según la regla de que los tests de la raíz de `src/` viven en `src/__tests__/`.
- Documentar dónde viven los helpers de test: `shared/test-utils/` los que no necesitan nada de la app (respetan la regla 9) y `core/test-utils/` los que necesitan providers de la app. Las carpetas no se crean todavía.
- Fuera de alcance, queda para changes posteriores:
  - Crear carpetas de `src/` (`app/`, `shared/`, `core/`, `proxy/`, `domain/`): nacen en `routing` y `data-layer`, cuando algo viva en ellas.
  - Lint de fronteras entre carpetas: las reglas se hacen cumplir en la revisión del PR y en la verificación del apply.
  - Reglas de negocio y de estado asíncrono (dinero, filtros en la URL, librería de datos, wrapper de `fetch`).

## Capabilities

### New Capabilities
<!-- Ninguna: son documentación y configuración, no comportamiento del producto. -->

### Modified Capabilities
<!-- Ninguna. El change declara `skip_specs: true`. -->

## Impact

- **Archivos nuevos**: `docs/architecture.md`, `docs/conventions.md`, `CLAUDE.md`.
- **Archivos modificados**: `openspec/config.yaml`, `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `src/main.tsx` (import con alias) y `README.md`.
- **Archivos movidos**: `src/test/setup.ts` → `src/setup-tests.ts` y `src/App.test.tsx` → `src/__tests__/App.test.tsx`.
- **Dependencias**: ninguna.
- **Flujo de trabajo**: el pre-commit existente (lint, build y tests con cobertura) sigue aplicando sin cambios. A partir de este change, los changes que decidan estructura tienen una tarea adicional de documentación y el apply verifica contra los dos documentos.
