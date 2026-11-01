# Design

## Context

Proyecto Vite 8 + React 19 + TypeScript, con `src/` reducido a `App.tsx`, `main.tsx`, `index.css`, `App.test.tsx` y `test/setup.ts` (el setup global de Vitest, referenciado desde `vitest.config.ts` y `eslint.config.js`). No hay router, ni carpetas de módulos, ni alias de imports, ni `CLAUDE.md`. `openspec/config.yaml` solo tiene la guía de commits por grupo en `operations.apply.guidance`; el resto son comentarios de ejemplo. Antes de este change, `main.tsx` importaba `./App.tsx` (con extensión) y `App.test.tsx` importaba `./App` (sin extensión). Motivación y alcance en `proposal.md`.

Restricciones: `vitest.config.ts` hace `mergeConfig(viteConfig, ...)`, así que hereda lo que se declare en `vite.config.ts`; `tsconfig.app.json` usa `moduleResolution: "bundler"` y `allowImportingTsExtensions`; `tsconfig.node.json` cubre `vite.config.ts` con `module: "nodenext"` y `@types/node`; el pre-commit ejecuta lint-staged, build y tests con cobertura mínima del 80 %.

## Goals / Non-Goals

**Goals:**
- Dejar las reglas de estructura y las convenciones de código por escrito, legibles por personas y cargadas automáticamente en cada sesión de Claude Code.
- Distinguir qué reglas son firmes y cuáles provisionales, y en qué change se confirman.
- Que el documento se mantenga al día sin depender de la memoria de nadie.
- Dejar el alias `@/` funcionando en TypeScript, Vite, Vitest y el build.
- Dejar definido dónde viven el setup global de Vitest, los tests de la raíz de `src/` y los helpers de test, y que el código existente ya lo cumpla.

**Non-Goals:**
- Crear carpetas en `src/` o código de ejemplo: no hay consumidor todavía.
- Hacer cumplir las reglas con una herramienta automática.
- Resolver las decisiones abiertas del documento (`store/`, validaciones compartidas, orden de imports, forma del wrapper de `fetch`).

## Decisions

**1. Reglas como documentos en `docs/`, no como spec de OpenSpec.**
`docs/architecture.md` y `docs/conventions.md` describen convenciones de organización, no comportamiento verificable del producto. Por eso el change declara `skip_specs: true`, igual que los changes de tooling anteriores.
*Alternativa:* una spec `architecture` con requisitos y escenarios. Descartada: las specs describen qué hace el sistema, y "un módulo no importa de otro" se revisa leyendo imports, no con un escenario.

**2. Dos documentos: estructura y convenciones de código.**
`architecture.md` trata solo de carpetas, archivos y dependencias entre ellos. `conventions.md` recoge lo que no es de archivos ni carpetas (`FC` con flecha, sin `enum`, idioma, Conventional Commits, imports sin extensión). Separarlos evita que el primero se llene de reglas de estilo y permite leer cada uno por separado.
*Alternativa:* un único documento. Descartada: mezcla dos ritmos de cambio, ya que la estructura se toca en cada change de arquitectura y las convenciones casi nunca.

**3. Reglas firmes y reglas provisionales marcadas en el propio texto.**
Las reglas que dependen de código aún inexistente llevan la marca `_(provisional hasta <change>)_`: la 10, la 14 hasta `data-layer`, la 11 mientras `store/` siga abierto, y la 12 y las rutas (15 y 16) hasta `routing`. Cuando el change indicado las confirma o las corrige, quita la marca y lo registra con la regla 20.
*Alternativa:* escribir solo las reglas ya comprobadas. Descartada: se pierde lo ya decidido y vuelve a hacer falta repetir la conversación.

**4. Cumplimiento por revisión, no por lint.**
Se descartó `eslint-plugin-boundaries`: con revisión de PR por el autor y gran parte del código escrito por Claude Code, el costo de configurar y mantener el lint supera lo que aporta. En su lugar, dos guías en `openspec/config.yaml`: `rules.tasks` pide una tarea de actualización del documento cuando el change decide estructura, y `operations.apply.guidance` pide comprobar en la verificación que el change respeta ambos documentos. La guía de commits que ya existe se conserva tal cual.
*Alternativa:* lint de fronteras. Descartada por el costo; si más adelante hay dolor real, se propone como change propio.

**5. `CLAUDE.md` importa los documentos en lugar de duplicarlos.**
`CLAUDE.md` contiene una descripción breve del proyecto, el idioma de las respuestas y los imports `@docs/architecture.md` y `@docs/conventions.md`. Así hay una sola fuente de verdad y cada sesión carga las reglas sin copiarlas. La sintaxis de import se comprueba en la documentación de Claude Code durante el apply.
*Alternativa:* pegar las reglas dentro de `CLAUDE.md`. Descartada: se desincronizan del documento.

**6. El idioma se declara en dos sitios.**
`CLAUDE.md` fija el idioma de las respuestas; el campo `context` de `config.yaml` fija el de los artefactos de OpenSpec (contenido en español, estructura y palabras clave en inglés). Es redundante a propósito: `config.yaml` es lo que OpenSpec lee al generar artefactos, y `CLAUDE.md` es lo que lee Claude Code en cualquier conversación.

**7. Alias `@/` con `paths` en `tsconfig.app.json` y `resolve.alias` en `vite.config.ts`.**
`"paths": { "@/*": ["./src/*"] }` hace que TypeScript resuelva el alias, y `resolve.alias` hace que Vite lo resuelva en desarrollo y en el build. No hace falta `baseUrl`, porque `paths` se resuelve respecto al `tsconfig`. En `vite.config.ts` la ruta se calcula con `fileURLToPath(new URL('./src', import.meta.url))`, que funciona con `module: "nodenext"` sin depender de `__dirname`. Vitest lo hereda por `mergeConfig`. ESLint no necesita resolvedor porque ninguna regla activa comprueba la resolución de imports.
*Alternativa:* `vite-tsconfig-paths`. Descartada: añade una dependencia para algo que se resuelve con dos líneas de configuración.

**8. El alias se verifica con un import real, no con un archivo de prueba.**
`src/main.tsx` pasa a importar `@/App`, sin extensión, igual que ya hace `App.test.tsx`: con `moduleResolution: "bundler"` la extensión no se necesita, y la regla queda escrita en `docs/conventions.md`. Si el alias falla en TypeScript, Vite o Vitest, rompen `npm run build` y `npm test`. El import queda en el código: es el uso real del alias.

**9. No se crea ninguna carpeta de `src/`.**
`app/`, `core/`, `shared/`, `proxy/` y `domain/` están descritas en el documento pero no existen, siguiendo la regla 3 (las carpetas nacen cuando se usan). Git no versiona carpetas vacías y un `.gitkeep` solo ocultaría que nada las usa.

**10. `src/App.test.tsx` se mueve a `src/__tests__/App.test.tsx` en este change.**
La regla 17 dice que los tests de la raíz de `src/` viven en `src/__tests__/`, y el código existente debe cumplirla desde el primer día. Su import pasa a ser relativo y sin extensión (`../App`), porque ambos están en la misma carpeta de primer nivel (regla 13). No queda ninguna excepción vigente a la regla.

**11. Setup global y helpers de test.**
El setup global de Vitest pasa de `src/test/setup.ts` a `src/setup-tests.ts`, y `src/test/` desaparece, para que no convivan `test/` y `__tests__/`. Hay tres referencias que actualizar: `setupFiles` y la exclusión de cobertura en `vitest.config.ts`, y el override de tests en `eslint.config.js`. Los helpers de test reutilizables viven en `test-utils/`: en `shared/test-utils/` los que no necesitan nada de la app (la regla 9 les aplica igual) y en `core/test-utils/` los que necesitan providers de la app, por ejemplo un `render` con router y `QueryClient`. Ni `src/setup-tests.ts` ni las carpetas `test-utils/` cuentan para la cobertura y llevan el mismo override de ESLint que los tests. Las carpetas `test-utils/` no se crean todavía (regla 3).
*Alternativas:* dejar el setup en `src/test/`, descartada porque mezcla dos convenciones de nombre para tests; poner todos los helpers en `shared/test-utils/`, descartada porque los que envuelven providers de la app tendrían que importar de `core/` o `proxy/` y romperían la regla 9.

**12. `core/` separado de `shared/`, y `shared/` estricta.**
`shared/` queda sin conocimiento del negocio (la regla 9 le prohíbe importar de `core/`, `proxy/`, `domain/` y `store/`), y todo lo común que sí lo conoce, como los hooks de datos globales (`useCurrentUser()`) o un layout autenticado, vive en `core/`, con las mismas carpetas que `shared/` (`components/`, `hooks/`, `utils/`, `test-utils/`). Así hay un sitio claro para esta categoría y los módulos importan de ambas. `core/` solo puede importar de `shared/`, `proxy/` y `domain/`, y nunca de `app/`.
*Alternativas:* permitir una excepción para `shared/hooks`, descartada porque rompe la pureza de `shared/` por un solo caso; permitir que `shared/` importe de `domain/`, descartada porque `shared/` deja de ser transversal sin conocimiento del negocio; que cada módulo escriba su propio hook sobre `proxy/`, descartada porque duplica el hook y desalinea las claves de caché.

**13. Esquema de nombres según el identificador exportado.**
Los componentes, páginas, layouts y el router del módulo van en `PascalCase.tsx` y los hooks en `camelCase.ts`, igual que el identificador que exportan (`Button.tsx` exporta `Button`, `useTransactions.ts` exporta `useTransactions`), de modo que el nombre del archivo y el del símbolo coinciden al buscarlos. Cada uno vive en una carpeta con el mismo nombre. Todo lo demás (proxy, mapper, schema, mock, rutas, domain, utils y las carpetas que no son de componente ni de hook) va en `kebab-case`, con el rol como sufijo separado por punto cuando lo tiene (`transaction.mapper.ts`). Esto deja a `App.tsx` y `App.test.tsx` dentro de la regla sin excepción.
*Alternativas:* `kebab-case` para todos los archivos, descartada porque el nombre del archivo ya no coincidiría con el del componente; `PascalCase` solo en componentes con sufijo `.page.tsx` en las páginas, descartada porque `HomePage` ya dice que es una página y el sufijo sobra.

## Risks / Trade-offs

- [El documento se desactualiza y sus reglas dejan de ser ciertas] → regla 20, la tarea que exige `rules.tasks` y la comprobación del apply; las reglas aún sin probar llevan marca de provisional.
- [Reglas escritas antes del código que las prueba pueden resultar equivocadas] → solo las provisionales dependen de código futuro, y cada una nombra el change que la confirma.
- [Sin lint, una violación se cuela si la revisión falla] → el apply la comprueba contra los dos documentos; si ocurre con frecuencia, se reabre la decisión del lint.
- [`CLAUDE.md` y `config.yaml` repiten la regla de idioma y pueden divergir] → es una línea en cada sitio y el apply verifica que coinciden.
- [Si la sintaxis de import de `CLAUDE.md` no es la esperada, las reglas no se cargan en las sesiones] → comprobarla en la documentación y en una sesión nueva durante el apply.
- [El alias funciona en Vite pero no en TypeScript o Vitest, o al revés] → se prueba con `npx tsc -b`, `npm run build` y `npm test`, que cubren los tres.
- [Mover el setup deja una referencia a `src/test/` y rompe Vitest, ESLint o la cobertura] → `grep` de `src/test` en la raíz y verificar con `npm test`, `npm run lint` y `npm run test:coverage`.

## Migration Plan

1. Agregar el alias y cambiar el import de `main.tsx`; verificar `tsc -b`, build y tests.
2. Mover el setup de Vitest y `App.test.tsx`; actualizar `vitest.config.ts` y `eslint.config.js`; verificar tests, lint y cobertura.
3. Crear `docs/architecture.md` y `docs/conventions.md`.
4. Crear `CLAUDE.md` con los imports y el idioma.
5. Modificar `openspec/config.yaml`: `context`, `rules.tasks` y la guía de `apply`.
6. Mencionar los documentos en `README.md`.
7. Rollback: revertir los commits de este change; no hay datos ni migraciones.

## Compatibilidad verificada

Se completa durante el apply, una subsección por herramienta.

### Alias `@/` con Vite y TypeScript

- Versiones instaladas: Vite 8.3.5, TypeScript 6.0.3 y Vitest 5.0.5.
- Vite, `resolve.alias`: acepta un objeto (`Record<string, string>`) o un arreglo de `{ find, replacement }`. La documentación indica que, al apuntar a rutas del sistema de archivos, se usen siempre rutas absolutas, porque un valor relativo se usa tal cual y no se resuelve. Por eso la configuración calcula la ruta con `fileURLToPath(new URL('./src', import.meta.url))`. La página no menciona `fileURLToPath`; es una forma estándar de obtener una ruta absoluta en ESM.
- TypeScript, `paths`: cada entrada reasigna un import a una ubicación relativa a `baseUrl` si existe, o al propio `tsconfig` si no. Desde TypeScript 4.1 `baseUrl` no es necesario, y su documentación lo desaconseja fuera de cargadores AMD. El patrón con comodín es `"@/*": ["./src/*"]`.
- `paths` solo informa a TypeScript: no cambia los imports que se emiten, por lo que Vite necesita su propio alias.
- Vitest: `vitest.config.ts` usa `mergeConfig(viteConfig, ...)`, así que hereda `resolve.alias`.

### Imports en `CLAUDE.md` (Claude Code)

- Fuente: la página "How Claude remembers your project" de la documentación de Claude Code.
- Sintaxis: `@ruta/al/archivo` dentro del texto del `CLAUDE.md`. Los archivos importados se expanden y se cargan en el contexto junto con el `CLAUDE.md` que los referencia.
- Las rutas relativas se resuelven respecto al archivo que contiene el import, no respecto al directorio de trabajo. Desde el `CLAUDE.md` de la raíz, `@docs/architecture.md` apunta al archivo correcto. Profundidad máxima: cuatro saltos.
- El parser ignora los code spans y los bloques de código: para mencionar una ruta sin importarla hay que envolverla en backticks, y para importarla debe ir fuera de ellos. Por eso los dos imports van en líneas propias, sin backticks.
- Los imports que resuelven fuera del directorio de trabajo piden aprobación; los dos de este proyecto están dentro, así que no la necesitan.
- Los imports no reducen el costo de contexto: se cargan igual que el `CLAUDE.md`. La documentación recomienda archivos de menos de 200 líneas; `architecture.md` (unas 120) y `conventions.md` (unas 12) caben.
- Verificación: ejecutar `/context` en una sesión nueva y comprobar la lista bajo **Memory files**.

## Contenido acordado

Texto de partida de cada archivo, tal como se acordó en la exploración. El apply lo usa como fuente; Prettier puede reajustar el ajuste de líneas (`proseWrap: always`).

### `docs/architecture.md`

````markdown
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
2. `proxy/` y `domain/` globales guardan solo lo que usan varios módulos; lo propio de un módulo vive
   en su `proxy/` y su `domain/`. En `domain/` hay un archivo por entidad con su modelo y los tipos
   del contrato (`Transaction`, `TransactionResponse`, `CreateTransactionRequest`). En `proxy/` hay un
   archivo por recurso del backend, nombrado como su entidad cuando coincide (`transaction.proxy.ts`).
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
    recurso: el wrapper de `fetch` y el tipo de error viven en `shared/utils/`.
    _(provisional hasta `data-layer`)_
11. `store/` solo importa de `shared/` y `domain/`. _(provisional: `store/` sigue abierto)_
12. `App.tsx` solo toca de un módulo su router y su archivo de rutas. _(provisional hasta `routing`)_
13. Entre carpetas de primer nivel, imports con `@/`. Dentro de la misma carpeta de primer nivel
    (un módulo, `shared/`, `core/`, `proxy/`…), imports relativos.
14. Dentro de un módulo las capas van en una sola dirección:
    `pages` → `components` → `hooks` → `proxy` → `mappers` → `domain`.
    Cada capa importa solo de las que están a su derecha; los hooks reciben modelos ya mapeados y
    el `proxy` aplica el mapper dentro de cada función. `domain/`, `utils/` y `validation/` se usan
    desde cualquier capa; `utils/` y `validation/` solo importan de `domain/`; `domain/` no importa
    nada del módulo. `mocks/` solo se importa desde tests. _(provisional hasta `data-layer`)_

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
    `test-utils/`: en `shared/test-utils/` los que no necesitan nada de la app (respetan la
    regla 9) y en `core/test-utils/` los que necesitan providers de la app.

### Mantenimiento

20. Todo change que toma una decisión de estructura actualiza este documento como una tarea más.

## Decisiones abiertas

- `store/`: Zustand, Context o nada. Hasta decidir, el estado de UI global vive en `shared/hooks`.
- Relación entre `core/` y `store/`: hoy ninguno importa del otro.
- Dónde viven las validaciones compartidas entre módulos.
- Orden de imports (hoy sin herramienta que lo aplique).
- Forma concreta del wrapper de `fetch` y del tipo de error, y dónde va el `QueryClient`
  (se decide en `data-layer`).
````

### `docs/conventions.md`

````markdown
# Convenciones de código

Reglas de código y estilo que no son de carpetas ni archivos (esas viven en `architecture.md`).

1. **Componentes**: `const X: FC<Props> = () => ...`, con `FC` importado como tipo desde `react`.
   No se usa `function X` ni se tipa el retorno con `JSX.Element`. Excepción: los componentes
   genéricos, que necesitan `function` para declarar el parámetro de tipo.
2. **Sin `enum`**: el `tsconfig` activa `erasableSyntaxOnly`. Las constantes se declaran como
   objetos `as const`.
3. **Idioma**: código, nombres de archivo y commits en inglés; textos de la interfaz en español.
4. **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `build:`…).
5. **Imports sin extensión**: `@/App`, no `@/App.tsx`. Los assets conservan la suya
   (`./index.css`).
````

### `CLAUDE.md`

````markdown
# Finanzas personales (web)

Aplicación web de finanzas personales con React 19, TypeScript y Vite. Se desarrolla con OpenSpec
(`/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/opsx:archive`).

## Idioma

Responder siempre en español.

## Documentos

- @docs/architecture.md
- @docs/conventions.md
````

### `openspec/config.yaml`

- `context`: los artefactos de OpenSpec se escriben en español; la estructura (encabezados de las
  plantillas y palabras clave de las specs) queda en inglés. Las reglas vigentes viven en
  `docs/architecture.md` y `docs/conventions.md`.
- `rules.tasks`: si el change decide estructura de carpetas, archivos o dependencias entre
  carpetas, incluir una tarea que actualice `docs/architecture.md` y diga cómo se verifica.
- `operations.apply.guidance` (se agrega a la guía de commits existente): en la verificación,
  comprobar que el change respeta `docs/architecture.md` y `docs/conventions.md`, y que
  `docs/architecture.md` quedó actualizado si el change decidió estructura.
