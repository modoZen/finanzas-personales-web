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
  App.tsx     rutas raíz: layout, Suspense y módulos cargados con lazy
  main.tsx    punto de entrada; monta los providers: QueryClientProvider y BrowserRouter
  setup-tests.ts   setup global de Vitest
```

`app/example/` es un módulo temporal: prueba el patrón de rutas y de datos (consume JSONPlaceholder)
y se borra, junto con su entrada en `routes.ts`, al crear el primer módulo real.

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
    recurso: el wrapper de `fetch` y el tipo de error viven en `shared/utils/http/`.
11. `store/` solo importa de `shared/` y `domain/`. _(provisional: `store/` sigue abierto)_
12. `App.tsx` solo toca de un módulo su router y su archivo de rutas.
13. Entre carpetas de primer nivel, imports con `@/`. Dentro de la misma carpeta de primer nivel (un
    módulo, `shared/`, `core/`, `proxy/`…), imports relativos.
14. Dentro de un módulo las capas van en una sola dirección: `pages` → `components` → `hooks` →
    `proxy` → `mappers` → `domain`. Cada capa importa solo de las que están a su derecha; los hooks
    reciben modelos ya mapeados y el `proxy` aplica el mapper dentro de cada función. `domain/`,
    `utils/` y `validation/` se usan desde cualquier capa; `utils/` y `validation/` solo importan de
    `domain/` (entre las capas del módulo; los esquemas pueden usar `shared/` y `core/` como
    cualquier otra capa); `domain/` no importa nada del módulo. `mocks/` solo se importa desde
    tests. Las consultas y mutaciones (`useQuery`, `useMutation` y similares) solo se declaran en
    archivos de `hooks/`; las páginas y los componentes no las declaran directamente, pero sí usan
    lo que esos hooks devuelven (`refetch`, `mutate`) y pueden leer el estado global de carga
    (`useIsFetching`, `useIsMutating`).

### Rutas

15. Cada módulo se carga con `lazy` desde `App.tsx`. Un `Suspense` con fallback envuelve las
    `Routes` y se pasa como `children` de `RootLayout`, así el header queda fuera del límite de
    carga. Un `ErrorBoundary` (`react-error-boundary`) envuelve ese `Suspense`, también dentro de
    `RootLayout`: cubre un fallo de render o de descarga de un módulo, y también un fallo del
    fallback del `Suspense`, y deja el header visible. Muestra `ErrorFallback`, de
    `shared/components/`, y se limpia al cambiar el `pathname` (`resetKeys`). El `BrowserRouter`
    vive en `main.tsx`, no en `App.tsx`, para que los tests puedan inyectar un `MemoryRouter`.
    Dentro de un módulo, las páginas se cargan con `lazy` solo si lo justifican, y entonces el
    módulo pone su propio `Suspense`.
16. Las rutas base viven en `src/routes.ts` (`appRoutes`, absolutas); las del módulo, en su
    `*.routes.ts` (`exampleRoutes`, relativas: el módulo no sabe dónde está montado). Los enlaces
    del módulo se construyen con `generatePath` a partir de esas constantes.

### Archivos

17. Cada componente (incluidos páginas y layouts) y cada hook vive en su propia carpeta, con el
    mismo nombre que su archivo, y dentro su `__tests__/`. En el resto de carpetas (`proxy/`,
    `mappers/`, `validation/`, `utils/`…) hay un solo `__tests__/` al nivel de la carpeta. Los tests
    de los archivos sueltos en la raíz de `src/` o de un módulo (`App.tsx`, `routes.ts`, el router
    del módulo…) viven en un `__tests__/` en esa misma raíz. Cada subcarpeta de `utils/` (por
    ejemplo `utils/http/`) lleva su propio `__tests__/`. Los archivos de test se llaman
    `<Nombre>.test.ts(x)`, con el nombre de lo que prueban. Cada archivo fuente tiene como mucho un
    archivo de test, con su mismo nombre (`Button.tsx` → `Button.test.tsx`); los casos de un archivo
    no se reparten en otros archivos de test.

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
    `domain/` y `utils/` (incluidas sus subcarpetas) van sin sufijo. Las carpetas que no son de un
    componente ni de un hook van en `kebab-case`, salvo `__tests__/`.
19. El setup global de Vitest es `src/setup-tests.ts`. Los helpers de test reutilizables viven en
    `test-utils/`: en `shared/test-utils/` los que no necesitan nada de la app (respetan la regla 9)
    y en `core/test-utils/` los que necesitan providers de la app.

### Mantenimiento

20. Todo change que toma una decisión de estructura actualiza este documento como una tarea más.

### Contenido de las carpetas

21. `utils/` contiene TypeScript puro (sin JSX, hooks ni APIs de React), agrupado por tema en
    subcarpetas cuando hace falta (`utils/http/`); `components/` y `hooks/` contienen código de
    React. Los tipos y constantes transversales viven junto a la utilidad que los usa, no en una
    carpeta de tipos aparte. `domain/` queda reservado para entidades de negocio.
22. Las validaciones (`validation/`, archivos `*.schema.ts`) son por módulo. Si dos módulos
    necesitan la misma, sube según la regla 6: a `shared/validation/` si no conoce el negocio
    (reglas genéricas como obligatorio, email o longitud mínima, con sus mensajes), o a
    `core/validation/` si lo conoce (reglas que usan tipos de `domain/`, que `shared/` no puede
    importar por la regla 9). Un esquema de formulario valida los valores del formulario, no el
    modelo: la conversión de esos valores al modelo se hace en un mapper. Esas carpetas nacen cuando
    un segundo módulo las necesita (regla 3).

## Decisiones abiertas

- `store/`: Zustand, Context o nada. Hasta decidir, el estado de UI global vive en `shared/hooks`.
- Relación entre `core/` y `store/`: hoy ninguno importa del otro.
- Orden de imports (hoy sin herramienta que lo aplique).
- Configuración del servidor para el `BrowserRouter`: un hosting estático debe devolver `index.html`
  para cualquier ruta. Hay que resolverlo antes del primer deploy.
