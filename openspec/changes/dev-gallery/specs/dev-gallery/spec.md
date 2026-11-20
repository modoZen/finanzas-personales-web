# Spec Delta

## Purpose

Ofrecer a quien desarrolla una página donde ver los tokens de diseño y los componentes compartidos con sus variantes y estados, para compararlos con el Design System sin montar una página real. Existe solo en desarrollo.

## ADDED Requirements

### Requirement: La galería solo existe en desarrollo
La aplicación SHALL ofrecer la galería en la ruta `/gallery`, con un enlace en la navegación, únicamente en el entorno de desarrollo. En producción la ruta SHALL tratarse como cualquier URL inexistente y el código de la galería SHALL NOT formar parte de los archivos generados.

#### Scenario: Abrir la galería en desarrollo
- **WHEN** el usuario abre `/gallery` en el entorno de desarrollo
- **THEN** se muestra la galería bajo el header, y la navegación incluye un enlace a ella que se identifica como la página actual

#### Scenario: Abrir la ruta en producción
- **WHEN** el usuario abre `/gallery` en una versión de producción
- **THEN** se muestra la página de ruta no encontrada, y la navegación no incluye ningún enlace a la galería

#### Scenario: El código de la galería no llega a producción
- **WHEN** se genera la versión de producción
- **THEN** ningún archivo generado contiene el código ni los textos de la galería

#### Scenario: Carga diferida en desarrollo
- **WHEN** el usuario abre la galería por primera vez en desarrollo
- **THEN** se muestra el indicador de carga mientras se descarga y el header y la navegación permanecen visibles

### Requirement: La galería muestra los tokens de diseño
La galería SHALL mostrar en una sección propia los colores, los estilos de texto, los radios y las sombras definidos como tokens de diseño, cada uno con su nombre, aplicado con la utilidad que usan los componentes.

#### Scenario: Colores
- **WHEN** el usuario abre la galería
- **THEN** la sección de tokens muestra cada color con su nombre y una muestra de ese color

#### Scenario: Estilos de texto
- **WHEN** el usuario abre la galería
- **THEN** la sección de tokens muestra un texto de ejemplo por cada estilo de texto, con su nombre

#### Scenario: Radios y sombras
- **WHEN** el usuario abre la galería
- **THEN** la sección de tokens muestra una muestra por cada radio y por cada sombra, con su nombre

### Requirement: La galería muestra los componentes compartidos con sus estados
La galería SHALL tener una sección por cada componente compartido que ya exista, identificada con un encabezado, con sus variantes y estados visibles a la vez y sin pedir datos a ningún servidor.

#### Scenario: Una sección por componente
- **WHEN** el usuario abre la galería
- **THEN** hay una sección con encabezado para el indicador de carga, para el mensaje de error y para el aviso de fallo de página

#### Scenario: Variantes del mensaje de error
- **WHEN** el usuario abre la galería
- **THEN** la sección del mensaje de error muestra el mensaje con el título por defecto y con un título propio

#### Scenario: Sin peticiones de red
- **WHEN** el usuario abre la galería
- **THEN** la galería no realiza ninguna petición HTTP

#### Scenario: Secciones para recorrer con tecnologías de apoyo
- **WHEN** una tecnología de apoyo recorre la galería
- **THEN** cada sección se expone como una región con el nombre de su encabezado
