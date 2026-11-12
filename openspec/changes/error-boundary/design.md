# Design

## Context

`App.tsx` monta `RootLayout` con un `Suspense` (fallback `Spinner`) que envuelve las `Routes`, y el módulo `example` se carga con `lazy`. Nada atrapa errores: un fallo de render o el rechazo del `import()` de `lazy` llega hasta la raíz y React desmonta todo. `ErrorMessage` (en `shared/components/`) ya pinta un aviso con `role='alert'`. Motivación y alcance en `proposal.md`; el comportamiento exigible, en `specs/app-navigation/spec.md`.

Restricciones que condicionan el diseño:
- Convención 1: componentes como `const X: FC<Props>`; no hay clases ni `function X`.
- `shared/` no sabe nada del negocio ni importa de `core/`, `proxy/`, `domain/` ni `store/` (reglas 1 y 9).
- El `BrowserRouter` vive en `main.tsx` (regla 15), así que `App` ya está dentro de un router y puede usar `useLocation`.
- Convención 7: los tests sustituyen solo en las fronteras (otros módulos, la red, las APIs del navegador).
- `react-error-boundary` 6.1.6 acepta React 18 y 19 como peer.

## Goals / Non-Goals

**Goals:**
- Que un fallo de un módulo muestre un aviso en vez de una pantalla en blanco, con el header y la navegación en pie.
- Que el aviso no sobreviva a un cambio de ruta.

**Non-Goals:**
- Errores de handlers, de código asíncrono y de Query (change `error-handling`).
- Logging o reporte remoto; el boundary no lleva `onError`.
- Un boundary en `main.tsx` ni la configuración del servidor para el `BrowserRouter`.

## Decisions

**1. `react-error-boundary` en vez de una clase propia.**
Una clase propia son unas 25 líneas más tests, obliga a una excepción en la convención 1 solo por esto y hay que implementar a mano el reset por cambio de clave (`componentDidUpdate`). La librería es pequeña, cumple la convención y trae `resetKeys`. Se instala como dependencia de producción.

**2. El `ErrorBoundary` va por fuera del `Suspense`, dentro de `RootLayout`.**
```
RootLayout
  header              <- fuera del boundary, siempre visible
  main
    ErrorBoundary     <- NUEVO
      Suspense
        Routes
```
El motivo de ponerlo por fuera no es el rechazo de `lazy`: lo lanza el componente `lazy` dentro de `Routes` y sube al boundary más cercano, y `Suspense` no atrapa errores, así que `Suspense > ErrorBoundary > Routes` también lo cubriría. La razón real es que por fuera cubre además un fallo del propio fallback del `Suspense` y queda como la capa más externa del contenido de `App`. Va dentro de `RootLayout`, como `children`, para que el header quede fuera del límite del error, igual que ya ocurre con la carga (regla 15).

**3. Reset por cambio de ruta con `resetKeys={[pathname]}`.**
Como el header sigue visible, el usuario puede navegar con el aviso en pantalla; sin reset, el aviso se quedaría aunque la ruta cambie. `App` lee `pathname` con `useLocation` y se lo pasa al boundary como clave de reset. `useLocation` funciona porque `BrowserRouter` está en `main.tsx` y en los tests se inyecta un `MemoryRouter`. Solo cuenta el `pathname`: cambiar la query o el hash no limpia el aviso, y no hace falta que lo haga.

**4. Un solo botón «Recargar página» y un mensaje fijo.**
`ErrorFallback` vive en `shared/components/ErrorFallback/ErrorFallback.tsx`, sin props, y se pasa como `FallbackComponent`. Muestra un `ErrorMessage` con un texto fijo en español y un botón «Recargar página» que llama a `window.location.reload()`. No muestra `error.message` (suele ser técnico y estar en inglés) ni la traza, y por eso el componente no necesita recibir el error.
*Alternativas descartadas:*
- Un botón «Reintentar» que haga el reset del boundary. No sirve para un chunk que falló: `React.lazy` cachea la promesa rechazada y reintentar vuelve a lanzar el mismo error sin repetir el `import()`. Tampoco sirve casi nunca para un fallo de render, que vuelve a lanzar con los mismos datos. El estado de la página ya está perdido y el reset sin recarga ya lo da navegar (decisión 3). Si aparece un error transitorio real, se suma después.
- Detectar el error de chunk y mostrar «Recargar» solo en ese caso: depende del texto del error del navegador, que es frágil, a cambio de poco.
- Mostrar `error.message`: expone texto técnico al usuario.

**5. Dónde vive cada pieza.**
`ErrorFallback` va en `shared/components/` (regla 1: no conoce el negocio) con su `__tests__/` (regla 17), y reutiliza `ErrorMessage` desde la misma carpeta de primer nivel, con import relativo (regla 13). El `ErrorBoundary` se cablea en `App.tsx`, que ya importa de `shared/components/`. No nace ninguna carpeta global.

**6. Estrategia de tests, sustituyendo solo en las fronteras (convención 7).**
- *`ErrorFallback`*: renderizado suelto; comprueba el `alert`, el texto fijo y el botón. Para la recarga, `window.location.reload` no se puede espiar en jsdom (`vi.spyOn(window.location, 'reload')` lanza «Cannot redefine property», comprobado con jsdom 30 y Vitest 5), pero `vi.stubGlobal('location', { ...window.location, reload })` sí funciona; `unstubGlobals: true` en `vitest.config.ts` lo restaura entre tests. Se descartó una prop `onReload`: añade API al componente solo para el test, y el stub sustituye en la frontera, que es el API del navegador. Es la excepción a la regla de espiar, y por eso va a `conventions.md`.
- *`App`, render que lanza*: en `App.test.tsx`, el stub de `ExampleRouter` lanza según una bandera creada con `vi.hoisted`. Comprueba el `alert`, el header y la navegación visibles y el stub ausente.
- *`App`, `import()` que rechaza*: no tiene test propio. `lazy` convierte el rechazo del `import()` en un error que lanza el componente `lazy` al renderizar, así que al boundary le llega como un error de render, el mismo camino que cubre el caso anterior. Un test aparte (`vi.mock` con una factory que lanza) solo probaría que `lazy` convierte un rechazo en error, que es comportamiento de React, y obligaría a un archivo de test que no se llama como su archivo fuente (regla 17). El escenario de la spec «Un módulo falla al descargarse» se verifica a mano (ver «Verificación manual» abajo).
- *`App`, reset con clic*: arranca en una subruta, `/example/detalle`, que también monta el router del módulo (`/example/*`); con `shouldThrow` en `false` se pulsa el enlace «Ejemplo» del header, que lleva a `/example`, y se comprueba que el aviso desaparece y vuelve el stub. Arrancar en `/example` no valdría: el enlace llevaría a la misma ruta y no cambiaría el `pathname`.
- *Verificación manual del fallo de descarga*: `npm run build && npm run preview`; en DevTools (pestaña Network), bloquear la URL del chunk de `ExampleRouter` (`assets/ExampleRouter-*.js`), abrir `/example` y comprobar que se ve el aviso con «Recargar página» y que el header y la navegación siguen visibles. Es la verificación del escenario de chunk de la spec y queda en la verificación final de `tasks.md`.
- En los tests que provocan errores se silencia `console.error` con `vi.spyOn(console, 'error').mockImplementation(() => {})`; `restoreMocks` lo restaura.

**7. Documentación.**
`docs/architecture.md`: la regla 15 pasa a describir el `ErrorBoundary` en el árbol de `App` (por fuera del `Suspense`, dentro de `RootLayout`, con reset por ruta), y la decisión abierta del error boundary se quita de «Decisiones abiertas». `docs/conventions.md`: la convención 7, «Mocks», añade el tercer caso, `vi.stubGlobal` para APIs del navegador que no se pueden espiar (en jsdom, `vi.spyOn(window.location, 'reload')` lanza «Cannot redefine property»), que `unstubGlobals` ya limpia.

## Risks / Trade-offs

- **Con un solo módulo, el clic en el mismo enlace no resetea** → hoy el header solo tiene el enlace «Ejemplo», que lleva a la misma ruta en la que falló el módulo, y como el `pathname` no cambia el aviso permanece. La salida desde la interfaz es «Recargar página» o volver atrás. Se acepta y se revisa cuando haya más módulos en el header; el reset por ruta se prueba con un clic en una subruta (decisión 6).
- **Un fallo de `RootLayout` o de `main.tsx` sigue dejando la pantalla en blanco** → el boundary solo cubre el contenido de `App`. Un boundary más externo no podría usar enlaces (no hay router fuera de `main.tsx`) y aporta poco ahora; se revisa si aparece un fallo real en esa zona.
- **Recargar pierde el estado de la página** → aceptado: tras un fallo de render o de descarga el estado ya no es fiable, y la recarga suele recoger el despliegue nuevo cuando el chunk falló por un hash cambiado.
- **Nueva dependencia en el bundle principal** → `App` se carga siempre, así que `react-error-boundary` entra en el chunk principal; se comprueba su tamaño en el build.
- **No hay registro del error** → sin `onError`, el aviso no deja rastro más allá de la consola de React. Se acepta hasta que haya un servicio de reporte (fuera de alcance).
