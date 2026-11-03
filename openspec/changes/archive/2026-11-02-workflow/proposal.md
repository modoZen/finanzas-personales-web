# Proposal

## Why

La forma de trabajar con OpenSpec (cuándo usar cada comando, que Claude pare al final de cada grupo de tareas y que el usuario haga los commits) hoy vive solo en una línea de `openspec/config.yaml` y en la memoria privada de Claude, que está ligada a este directorio. Ninguna de las dos se ve en el repositorio ni se lleva a otro proyecto sin rehacerla de memoria. Conviene escribir el flujo una vez, de forma genérica, para que sea visible, se cargue en cada sesión y se pueda copiar tal cual a otro proyecto con OpenSpec.

## What Changes

- Crear `docs/workflow.md` con el flujo completo, sin referencias a este proyecto:
  - Una primera línea que declara que el flujo asume OpenSpec (`/opsx:*`).
  - El ciclo `explore` → `propose` → `apply` → `archive`, con `update` para revisar artefactos. `explore` solo cuando hay decisiones abiertas; los cambios mecánicos van directos a `propose`.
  - Quién hace qué: Claude nunca hace `git commit` ni `git push`; entrega los comandos `git add` y `git commit` con los archivos exactos y un mensaje sugerido, y el usuario los ejecuta.
  - La cadencia de commits: uno tras `propose`, uno por grupo de tareas en `apply` y uno al archivar.
  - Cuándo se detiene Claude: al final de cada grupo, ante una tarea ambigua, un error o un bloqueo, y si la implementación revela un problema de diseño (propone `/opsx:update` en lugar de improvisar).
  - Cómo se verifica: cada tarea declara su comprobación y Claude informa de lo que verificó y de lo que no pudo verificar.
- Agregar `- @docs/workflow.md` a la lista de imports de `CLAUDE.md`, junto a los otros dos documentos.
- Modificar `openspec/config.yaml`: la guía de `apply` pasa a ser una frase corta que remite al documento (hoy repite la regla entera) y se añade una guía equivalente para `archive`. La guía de `apply` que verifica contra `architecture.md` y `conventions.md` se conserva.
- Actualizar la sección del `README.md` que lista los documentos: se renombra de "Arquitectura y convenciones" a "Documentación", se ajusta su frase de introducción y se añade `docs/workflow.md` a la lista.
- Fuera de alcance:
  - El formato del mensaje de commit: vive en `docs/conventions.md` (regla 4).
  - La actualización de `docs/architecture.md` cuando un change decide estructura: vive en la regla 20 del propio documento.
  - Una skill de usuario que configure proyectos nuevos, y una regla de permisos o un hook que impida de verdad `git commit`: se reconsideran si el copiado entre proyectos se vuelve repetitivo o si la guía deja de bastar.

## Capabilities

### New Capabilities
<!-- Ninguna: son documentación y configuración, no comportamiento del producto. -->

### Modified Capabilities
<!-- Ninguna. El change declara `skip_specs: true`. -->

## Impact

- **Archivos nuevos**: `docs/workflow.md`.
- **Archivos modificados**: `CLAUDE.md` (un import más), `openspec/config.yaml` (guía de `apply` y de `archive`) y `README.md` (sección de documentación).
- **Dependencias**: ninguna.
- **Flujo de trabajo**: `docs/workflow.md` se carga en cada sesión (unos 40 a 50 líneas, del orden de 700 tokens). El pre-commit existente sigue aplicando sin cambios.
