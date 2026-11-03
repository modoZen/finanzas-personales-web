# Spec Delta

## Purpose

Define cómo se navega por la aplicación: el layout común con header y navegación, la redirección de la raíz, la página de ruta no encontrada y la carga diferida de módulos con un indicador de carga.

## ADDED Requirements

### Requirement: Layout común con header y navegación
La aplicación SHALL mostrar en todas las rutas un header con el nombre de la aplicación y una navegación con un enlace por cada módulo, y debajo de él el contenido de la ruta activa.

#### Scenario: El header aparece en cualquier ruta
- **WHEN** el usuario abre cualquier ruta de la aplicación, incluida una que no existe
- **THEN** se muestran el nombre de la aplicación y los enlaces de navegación sobre el contenido de la ruta

#### Scenario: La navegación marca la ruta activa
- **WHEN** el usuario está en una ruta que pertenece a un módulo de la navegación
- **THEN** el enlace de ese módulo se identifica como la página actual para tecnologías de apoyo

#### Scenario: La navegación está etiquetada
- **WHEN** una tecnología de apoyo recorre la página
- **THEN** la navegación se expone como una región de navegación con nombre accesible

### Requirement: La raíz redirige al módulo inicial
La aplicación SHALL redirigir la ruta raíz al módulo inicial sin dejar la raíz en el historial del navegador.

#### Scenario: Entrar a la raíz
- **WHEN** el usuario abre `/`
- **THEN** la aplicación muestra el módulo inicial y la URL pasa a ser la de ese módulo

#### Scenario: Volver atrás desde el módulo inicial
- **WHEN** el usuario llegó a `/` y fue redirigido, y luego pulsa atrás
- **THEN** no regresa a `/`, porque la redirección reemplazó la entrada del historial

### Requirement: Página de ruta no encontrada
La aplicación SHALL mostrar una página de ruta no encontrada, en español y con un enlace para volver al inicio, cuando la URL no coincide con ninguna ruta.

#### Scenario: Ruta inexistente
- **WHEN** el usuario abre una URL que no pertenece a ningún módulo
- **THEN** se muestra la página de no encontrada con un enlace al inicio, y el header y la navegación siguen visibles

#### Scenario: Volver al inicio desde la página de no encontrada
- **WHEN** el usuario pulsa el enlace de la página de no encontrada
- **THEN** la aplicación lo lleva a `/` y de ahí al módulo inicial

### Requirement: Carga diferida de módulos con indicador de carga
La aplicación SHALL cargar cada módulo la primera vez que se visita y SHALL mostrar un indicador de carga mientras tanto, sin ocultar el header ni la navegación.

#### Scenario: Primera visita a un módulo
- **WHEN** el usuario abre un módulo cuyo código aún no se ha descargado
- **THEN** se muestra un indicador de carga en el área de contenido, el header y la navegación permanecen visibles, y al terminar la carga se muestra el módulo

#### Scenario: Indicador accesible
- **WHEN** se muestra el indicador de carga
- **THEN** se anuncia a las tecnologías de apoyo como un estado, con el texto "Cargando…"

#### Scenario: Preferencia de movimiento reducido
- **WHEN** el sistema del usuario pide reducir el movimiento
- **THEN** el indicador de carga no se anima

### Requirement: Rutas relativas dentro de un módulo
Un módulo SHALL poder navegar entre sus propias páginas sin conocer la ruta en la que está montado, de modo que cambiar su ruta base no obligue a modificar sus enlaces.

#### Scenario: Ir al detalle desde el índice del módulo
- **WHEN** el usuario pulsa en el índice de un módulo el enlace a un elemento con identificador
- **THEN** la aplicación muestra la página de detalle de ese elemento bajo la ruta base del módulo, con el identificador recibido

#### Scenario: Volver al índice desde el detalle
- **WHEN** el usuario pulsa el enlace de vuelta en la página de detalle
- **THEN** la aplicación muestra el índice del módulo
