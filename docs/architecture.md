# Arquitectura

Estructura de carpetas y reglas de dependencia del frontend. Las convenciones de código viven en
`conventions.md`. Todo change que decida estructura actualiza este documento.

## Estructura de `src/`

```
src/
  app/        módulos de negocio, cada uno autocontenido
  core/       común que conoce el negocio: hooks de datos globales y componentes de negocio
              components/  hooks/  utils/  test-utils/
  shared/     transversal, sin conocimiento del negocio
              components/  hooks/  utils/  test-utils/
  proxy/      peticiones HTTP al backend de uso global, un archivo por recurso
  domain/     entidades compartidas por varios módulos
  store/      estado de UI global (abierto)
  __tests__/  tests de los archivos de la raíz de src/
  routes.ts   rutas base de cada módulo
  App.tsx     router raíz
  main.tsx
  setup-tests.ts   setup global de Vitest
```

## Catálogo de un módulo

Es un catálogo de nombres, no una lista de carpetas obligatorias.

```
app/<modulo>/
  <Modulo>Router.tsx    <modulo>.routes.ts
  pages/  components/  hooks/  utils/
  proxy/  domain/  mappers/  mocks/  validation/
```

## Reglas

### Estructura

1. `app/` contiene módulos autocontenidos; `shared/` no sabe nada del negocio; `core/` es el código
   común que sí lo conoce.
2. `proxy/` y `domain/` globales guardan solo lo que usan varios módulos; lo propio de un módulo
   vive en su `proxy/` y su `domain/`. En `domain/` hay un archivo por entidad con su modelo y los
   tipos del contrato (`Transaction`, `TransactionResponse`, `CreateTransactionRequest`). En
   `proxy/` hay un archivo por recurso del backend, nombrado como su entidad cuando coincide
   (`transaction.proxy.ts`).
3. Las carpetas nacen cuando se usan; no se crean vacías.
4. El catálogo es de nombres: si una carpeta nace, se llama igual en todos los módulos.
5. Un módulo mínimo es su router más `pages/`.
6. Si dos módulos necesitan lo mismo, sube a `shared/` si no conoce el negocio, a `core/` si lo
   conoce, o a `proxy/` o `domain/` según su naturaleza.

### Dependencias

7. Un módulo no importa de otro módulo. Sí puede importar de `shared/`, `core/`, `proxy/` y
   `domain/`.
8. `shared/`, `core/`, `proxy/`, `domain/` y `store/` no importan de `app/`.
9. `shared/` no importa de `core/`, `proxy/`, `domain/` ni `store/`.
10. `domain/` no importa de otras carpetas globales; `proxy/` solo importa de `shared/` y `domain/`;
    `core/` solo importa de `shared/`, `proxy/` y `domain/`. `proxy/` contiene solo peticiones por
    recurso: el wrapper de `fetch` y el tipo de error viven en `shared/utils/`. _(provisional hasta
    `data-layer`)_
11. `store/` solo importa de `shared/` y `domain/`. _(provisional: `store/` sigue abierto)_
12. `App.tsx` solo toca de un módulo su router y su archivo de rutas. _(provisional hasta
    `routing`)_
13. Entre carpetas de primer nivel, imports con `@/`. Dentro de la misma carpeta de primer nivel (un
    módulo, `shared/`, `core/`, `proxy/`…), imports relativos.
14. Dentro de un módulo las capas van en una sola dirección: `pages` → `components` → `hooks` →
    `proxy` → `mappers` → `domain`. Cada capa importa solo de las que están a su derecha; los hooks
    reciben modelos ya mapeados y el `proxy` aplica el mapper dentro de cada función. `domain/`,
    `utils/` y `validation/` se usan desde cualquier capa; `utils/` y `validation/` solo importan de
    `domain/`; `domain/` no importa nada del módulo. `mocks/` solo se importa desde tests.
    _(provisional hasta `data-layer`)_

### Rutas _(provisionales hasta `routing`)_

15. Cada módulo se carga con `lazy` desde `App.tsx`, dentro de un `Suspense` con fallback.
16. Las rutas base viven en `src/routes.ts`; las del módulo, en su `*.routes.ts`.

### Archivos

17. Cada componente (incluidos páginas y layouts) y cada hook vive en su propia carpeta, con el
    mismo nombre que su archivo, y dentro su `__tests__/`. En el resto de carpetas (`proxy/`,
    `mappers/`, `validation/`, `utils/`…) hay un solo `__tests__/` al nivel de la carpeta. Los tests
    de los archivos sueltos en la raíz de `src/` o de un módulo (`App.tsx`, `routes.ts`, el router
    del módulo…) viven en un `__tests__/` en esa misma raíz. Los archivos de test se llaman
    `<Nombre>.test.ts(x)`, con el nombre de lo que prueban.

```
components/Button/Button.tsx
components/Button/__tests__/Button.test.tsx
hooks/useTransactions/useTransactions.ts
mappers/transaction.mapper.ts
mappers/__tests__/transaction.mapper.test.ts
```

18. Nombres de archivo: `PascalCase.tsx` para componentes, páginas, layouts y el router del módulo
    (`Button.tsx`, `HomePage.tsx`, `RootLayout.tsx`, `TransactionsRouter.tsx`); `camelCase.ts` para
    hooks (`useTransactions.ts`); `kebab-case` para todo lo demás, con sufijo de rol separado por
    punto: `.routes.ts`, `.proxy.ts`, `.mapper.ts`, `.schema.ts`, `.mock.ts`. Los archivos de
    `domain/` y `utils/` van sin sufijo. Las carpetas que no son de un componente ni de un hook van
    en `kebab-case`, salvo `__tests__/`.
19. El setup global de Vitest es `src/setup-tests.ts`. Los helpers de test reutilizables viven en
    `test-utils/`: en `shared/test-utils/` los que no necesitan nada de la app (respetan la regla 9)
    y en `core/test-utils/` los que necesitan providers de la app.

### Mantenimiento

20. Todo change que toma una decisión de estructura actualiza este documento como una tarea más.

## Decisiones abiertas

- `store/`: Zustand, Context o nada. Hasta decidir, el estado de UI global vive en `shared/hooks`.
- Relación entre `core/` y `store/`: hoy ninguno importa del otro.
- Dónde viven las validaciones compartidas entre módulos.
- Orden de imports (hoy sin herramienta que lo aplique).
- Forma concreta del wrapper de `fetch` y del tipo de error, y dónde va el `QueryClient` (se decide
  en `data-layer`).
