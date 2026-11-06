# remote-data Specification

## Purpose

Define cómo trata la aplicación los datos que vienen de un servidor: qué cuenta como una petición fallida, cómo se resuelve la dirección del servidor, qué ve el usuario mientras se cargan o si fallan, y que crear un elemento refresca los datos afectados.

## Requirements

### Requirement: Una respuesta fallida es un error que identifica la petición
La aplicación SHALL tratar como error toda petición cuya respuesta no sea de éxito, SHALL conservar para quien la haya pedido el código de estado, su texto, el método, la dirección y el cuerpo recibido, y SHALL describir en el mensaje del error el método, la dirección y el estado. Una respuesta de éxito sin contenido no es un error.

#### Scenario: El servidor responde con un código de error
- **WHEN** el servidor responde a una petición con un código que no es de éxito, por ejemplo 404 o 500
- **THEN** la petición falla y el error indica ese código de estado, su texto, el método, la dirección pedida y el cuerpo de la respuesta, si lo hay, y su mensaje menciona el método, la dirección y el estado

#### Scenario: La respuesta es de éxito pero sin contenido
- **WHEN** el servidor responde con éxito y sin contenido
- **THEN** la petición termina sin error y no devuelve datos

#### Scenario: No se puede llegar al servidor
- **WHEN** la petición no consigue comunicarse con el servidor
- **THEN** la petición falla y el error no indica ningún código de estado

### Requirement: La dirección del servidor se configura por entorno
La aplicación SHALL resolver las rutas relativas contra una dirección base configurable por entorno, de modo que cambiar de servidor no obligue a cambiar el código de las peticiones.

#### Scenario: Ruta relativa con dirección configurada
- **WHEN** se pide una ruta relativa y hay una dirección base configurada
- **THEN** la petición se envía a esa dirección base más la ruta

#### Scenario: Ruta relativa sin dirección configurada
- **WHEN** se pide una ruta relativa y no hay dirección base configurada
- **THEN** la petición falla sin enviarse, con un mensaje que indica que falta la configuración

### Requirement: Las pantallas con datos remotos muestran su estado
Una pantalla que depende de datos de un servidor SHALL mostrar un indicador de carga mientras espera, un mensaje de error si la petición falla y los datos cuando llegan, sin mezclar los tres estados.

#### Scenario: Cargando
- **WHEN** la pantalla está esperando los datos
- **THEN** se muestra un indicador de carga en el área de contenido y no se muestran datos ni error

#### Scenario: La carga falla
- **WHEN** la petición de los datos falla
- **THEN** se muestra un mensaje de error, anunciado a las tecnologías de apoyo como una alerta, y no se muestran datos ni indicador de carga

#### Scenario: Los datos llegan
- **WHEN** la petición termina con éxito
- **THEN** se muestran los datos y no se muestra indicador de carga ni error

### Requirement: Crear un elemento refresca los datos afectados
La aplicación SHALL volver a pedir los datos que dependen de un elemento tras crearlo con éxito, y SHALL avisar al usuario con un mensaje de error si la creación falla, sin perder los datos que ya se muestran.

#### Scenario: La creación tiene éxito
- **WHEN** el usuario crea un elemento y el servidor lo acepta
- **THEN** la lista de elementos se vuelve a pedir al servidor

#### Scenario: La creación falla
- **WHEN** el usuario crea un elemento y la petición falla
- **THEN** se muestra un mensaje de error anunciado como una alerta y los datos que ya se mostraban se mantienen
