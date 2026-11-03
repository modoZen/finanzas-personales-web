# Tasks

## 1. Documento de flujo

- [x] 1.1 Crear `docs/workflow.md` con el texto de `design.md` (sección "Contenido acordado") y verificar que la primera frase declara que el flujo asume OpenSpec, que `grep -inE "finanzas|src/|architecture\.md|conventions\.md" docs/workflow.md` no devuelve resultados (el documento es genérico), que `wc -l docs/workflow.md` no pasa de 60 líneas y que `npx prettier --check docs/workflow.md` pasa

## 2. Integración en `CLAUDE.md` y `config.yaml`

- [x] 2.1 Agregar `- @docs/workflow.md` a la lista de imports de `CLAUDE.md`, tras los otros dos, y verificar que `npx prettier --check CLAUDE.md` pasa, que los tres imports quedan cada uno en su línea y que Max confirma en una sesión nueva, con `/context`, que `docs/workflow.md` aparece bajo **Memory files**
- [x] 2.2 Modificar `operations` en `openspec/config.yaml`: reemplazar la primera guía de `apply` por la frase que remite a `docs/workflow.md`, conservar la segunda guía de `apply` y añadir la guía de `archive`; verificar que el YAML parsea, que `openspec instructions apply --change workflow --json` muestra las dos guías de `apply` con la primera remitiendo al documento, y que `openspec instructions archive --change workflow --json` muestra la guía de `archive`
- [x] 2.3 Actualizar la sección de documentación del `README.md` (título "Documentación", frase de introducción y tercer enlace a `docs/workflow.md`, según `design.md`) y verificar que los tres enlaces apuntan a archivos existentes, que `git diff README.md` solo toca esa sección y que `npx prettier --check README.md` pasa
- [x] 2.4 Verificar que las guías de `config.yaml` y `docs/workflow.md` dicen lo mismo (pausa al final de cada grupo, sin commitear, entrega de los comandos) leyendo ambos archivos, y que `npm run lint`, `npm run format:check`, `npm run build` y `npm run test:coverage` pasan

## Workflow follow-up

- Archivar el change con `/opsx:archive` una vez verificado.
- `routing` es el siguiente change.
