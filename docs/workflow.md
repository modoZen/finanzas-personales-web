# Flujo de trabajo

Este flujo asume que el proyecto usa OpenSpec (`/opsx:*`). No depende de ningún proyecto en
particular: se puede copiar tal cual a otro.

## El ciclo

```
explore --> propose --> apply --> archive
               ^          |
               +- update -+
```

1. **`/opsx:explore`**: conversación para pensar; no escribe nada. Se usa solo cuando hay decisiones
   abiertas. Los cambios mecánicos (tooling, configuración) van directos a `propose`.
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
verificar (por ejemplo, lo que solo se ve en un navegador), y solo marca una tarea como hecha cuando
su comportamiento está completo.
