# Design

## Context

`CLAUDE.md` tiene una descripción breve, la regla de idioma y una lista con dos imports (`docs/architecture.md` y `docs/conventions.md`). La regla de parar al final de cada grupo y no commitear vive hoy en una sola entrada de `operations.apply.guidance` en `openspec/config.yaml`, redactada con todo el detalle, y en la memoria privada de Claude, que no se versiona. `operations.archive.guidance` no existe. Motivación y alcance en `proposal.md`.

Restricciones: `CLAUDE.md` y sus imports se cargan en cada sesión (la sintaxis `@ruta` y el comportamiento del parser quedaron verificados en el change `architecture`); `docs/architecture.md` ya pesa unos 2.6k tokens y `docs/conventions.md` unos 360; `openspec/` y `.claude/` están fuera del formateo de Prettier, pero `docs/` y `CLAUDE.md` no.

## Goals / Non-Goals

**Goals:**
- Escribir el flujo una sola vez, de forma que se pueda copiar a otro proyecto con OpenSpec sin editarlo.
- Que Claude lo tenga presente en cada sesión y que la regla de los commits llegue, además, en el momento exacto del apply y del archive.
- Que cada regla viva en un solo sitio.

**Non-Goals:**
- Hacer cumplir la regla con permisos o un hook: es contexto, no una restricción técnica.
- Automatizar la configuración de un proyecto nuevo (skill de usuario).
- Cubrir proyectos sin OpenSpec.

## Decisions

**1. `docs/workflow.md` importado desde `CLAUDE.md`, no bajo demanda.**
El documento ocupa unas 45 líneas, del orden de 700 tokens, que sobre los 3.2k que ya cargan `CLAUDE.md` y los otros dos documentos es poco. A cambio, un documento importado siempre está presente, y uno bajo demanda solo se lee si algo lo indica. Importarlo sigue el mismo patrón que `architecture.md` y `conventions.md`.
*Alternativas:* documento bajo demanda referenciado desde `config.yaml`, descartada porque solo se leería durante el apply y dejaría fuera el resto de las etapas y las sesiones que no usan OpenSpec; pegar unas líneas sueltas en `CLAUDE.md`, descartada porque no se puede copiar como una pieza; una skill de usuario que configure cada proyecto, descartada por ahora porque añade algo que mantener y con pocos proyectos el copiado manual basta.

**2. El documento es genérico y declara que asume OpenSpec.**
No nombra rutas, carpetas ni documentos de este proyecto, y su primera línea dice que el flujo asume OpenSpec (`/opsx:*`). "Portable" significa entonces portable a otro proyecto con OpenSpec, que es donde el flujo tiene sentido. Lo que sí es específico de un proyecto queda fuera: el formato del mensaje de commit vive en `docs/conventions.md` (regla 4) y la obligación de actualizar `docs/architecture.md` al decidir estructura vive en su regla 20.
Llevar el flujo a otro proyecto es copiar tres piezas: `docs/workflow.md` sin cambios, la línea de import en `CLAUDE.md` y las guías de `apply` y `archive` en `openspec/config.yaml`.

**3. `config.yaml` recuerda la acción esencial y remite al documento.**
Cada guía es una frase corta que dice qué hacer en ese momento y a dónde mirar el detalle:
- `apply`: "Seguir docs/workflow.md: pausar al final de cada grupo y entregar los comandos de commit, sin commitear por cuenta propia."
- `archive`: "Seguir docs/workflow.md: sin commitear, y entregar el comando de commit del archivado."

*Alternativas:* repetir la regla completa en la guía, descartada porque el día que cambie en un sitio se olvida el otro; dejar solo "Seguir docs/workflow.md", descartada porque la guía llega justo en el apply y un puntero vacío no dice qué hacer en ese momento.

**4. `explore` solo cuando hay decisiones abiertas.**
Los changes de tooling (`setup-tooling`, `setup-tailwind`) fueron directos a `propose`, y `explore` se usó para decisiones de estructura y de diseño. El documento lo recoge como criterio para que Claude no proponga una exploración para un cambio mecánico ni se salte una para una decisión abierta.

**5. Sin permisos ni hooks que impidan el commit.**
La regla se cumple por contexto y por la guía del apply, igual que las reglas de arquitectura se cumplen por revisión. Una regla de denegación para `git commit` impediría de verdad que Claude commitee, pero no obliga a parar al final de un grupo, que es lo que más importa. Se reconsidera si la guía deja de bastar.

**6. La regla de `rules.tasks` sobre `docs/architecture.md` no aplica.**
Este change añade un archivo en `docs/` y no decide estructura de `src/`, de archivos de código ni dependencias entre carpetas, que es de lo que trata `docs/architecture.md`. Por eso no incluye una tarea que lo actualice.

## Risks / Trade-offs

- [El documento se carga en cada sesión y suma tokens] → se mantiene corto (unas 45 líneas) y se comprueba con `wc -l` y con `/context`.
- [La guía de `config.yaml` y el documento divergen] → la guía solo recuerda la acción y remite al detalle, que vive únicamente en el documento.
- [El documento es contexto y Claude podría no seguirlo] → la guía llega en el momento del apply y del archive; si no basta, se reabre la decisión de los permisos.
- [Acortar la guía de `apply` quita detalle ("archivos exactos", "mensaje sugerido") justo en el momento en que se aplica] → ese detalle queda en el documento, que está siempre cargado; se comprueba en el siguiente apply.
- [Llevar el flujo a otro proyecto exige copiar tres piezas y puede quedar a medias] → las tres piezas están listadas en la Decisión 2.
- [El documento queda desactualizado respecto a los comandos de OpenSpec] → es corto y habla del ritmo y de las reglas, no de las opciones de cada comando, que explican los propios comandos.

## Migration Plan

1. Crear `docs/workflow.md`.
2. Agregar el import a `CLAUDE.md` y modificar las guías de `apply` y `archive` en `openspec/config.yaml`.
3. Actualizar la sección de documentación del `README.md`.
4. Rollback: revertir los commits de este change; no hay datos ni migraciones.

## Contenido acordado

Texto de partida de cada archivo. El apply lo usa como fuente; Prettier puede reajustar el ajuste de líneas (`proseWrap: always`).

### `docs/workflow.md`

````markdown
# Flujo de trabajo

Este flujo asume que el proyecto usa OpenSpec (`/opsx:*`). No depende de ningún proyecto en
particular: se puede copiar tal cual a otro.

## El ciclo

```
explore --> propose --> apply --> archive
               ^          |
               +- update -+
```

1. **`/opsx:explore`**: conversación para pensar; no escribe nada. Se usa solo cuando hay
   decisiones abiertas. Los cambios mecánicos (tooling, configuración) van directos a `propose`.
2. **`/opsx:propose <nombre>`**: crea el change y todos sus artefactos. Un change por objetivo,
   pequeño.
3. **`/opsx:update`**: revisa los artefactos y los mantiene coherentes entre sí. Cada edición se
   confirma antes de escribirse.
4. **`/opsx:apply`**: implementa las tareas, por grupos.
5. **`/opsx:archive`**: archiva el change una vez implementado.

## Commits

Claude nunca hace `git commit` ni `git push`. Da los comandos `git add` y `git commit` con los
archivos exactos y un mensaje sugerido, y el usuario los ejecuta. Hay un commit:

- al terminar `propose` (los artefactos del change),
- al terminar cada grupo de tareas de `apply`,
- al archivar.

## Cuándo se detiene Claude

- Al final de cada grupo de tareas, para que el usuario haga el commit.
- Ante una tarea ambigua, un error o un bloqueo.
- Si la implementación revela un problema de diseño: propone `/opsx:update` en lugar de improvisar.
- Si una tarea exige trabajo más allá de lo descrito: lo señala y pregunta antes de absorberlo.

## Verificación

Cada tarea declara cómo se comprueba. Claude informa de lo que verificó y de lo que no pudo
verificar (por ejemplo, lo que solo se ve en un navegador), y solo marca una tarea como hecha
cuando su comportamiento está completo.
````

### `CLAUDE.md`

La lista de la sección "Documentos" queda con tres imports:

```markdown
- @docs/architecture.md
- @docs/conventions.md
- @docs/workflow.md
```

### `README.md`

La sección que hoy se llama "Arquitectura y convenciones" pasa a llamarse "Documentación". Cambian su título, su frase de introducción y la lista; el párrafo final sobre el alias `@/` y la actualización de `docs/architecture.md` no cambia:

```markdown
## Documentación

La estructura de carpetas, las convenciones de código y el flujo de trabajo están documentados en
`docs/`:

- [`docs/architecture.md`](docs/architecture.md): estructura de `src/`, catálogo de un módulo y
  reglas de dependencias, nombres y tests.
- [`docs/conventions.md`](docs/conventions.md): convenciones de código (componentes, `enum`, idioma,
  commits e imports).
- [`docs/workflow.md`](docs/workflow.md): flujo de trabajo con OpenSpec (ciclo, commits y cuándo se
  detiene Claude).
```

### `openspec/config.yaml`

`operations` queda así (la segunda guía de `apply` no cambia). Las frases con `: ` van entre comillas: sin ellas YAML las lee como un mapa y OpenSpec ignora la guía ("must be an array of strings"):

```yaml
operations:
  apply:
    guidance:
      - "Seguir docs/workflow.md: pausar al final de cada grupo y entregar los comandos de commit, sin commitear por cuenta propia."
      - En la verificación, comprobar que el change respeta docs/architecture.md y docs/conventions.md, y que docs/architecture.md quedó actualizado si el change decidió estructura.
  archive:
    guidance:
      - "Seguir docs/workflow.md: sin commitear, y entregar el comando de commit del archivado."
```
