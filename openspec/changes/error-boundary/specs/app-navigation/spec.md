# Spec Delta

## ADDED Requirements

### Requirement: Fallo de un módulo con aviso y opción de recargar
La aplicación SHALL mostrar un aviso en español, con un botón para recargar la página, cuando un módulo falla al renderizarse o al descargarse, SHALL mantener visibles el header y la navegación, y SHALL NOT mostrar el texto técnico del error al usuario.

#### Scenario: Un módulo falla al renderizarse
- **WHEN** el usuario abre un módulo que lanza un error al renderizarse
- **THEN** el área de contenido muestra el aviso con el botón «Recargar página», se anuncia a las tecnologías de apoyo como una alerta, y el header y la navegación siguen visibles

#### Scenario: Un módulo falla al descargarse
- **WHEN** el usuario abre un módulo cuyo código no se puede descargar
- **THEN** se muestra el mismo aviso con el botón «Recargar página», y el header y la navegación siguen visibles

#### Scenario: El aviso no expone el error
- **WHEN** se muestra el aviso por cualquier fallo de un módulo
- **THEN** el texto del aviso es siempre el mismo y no incluye el mensaje ni la traza del error

#### Scenario: Recargar la página
- **WHEN** el usuario pulsa «Recargar página» en el aviso
- **THEN** el navegador vuelve a cargar la página actual

### Requirement: El aviso de fallo desaparece al cambiar de ruta
La aplicación SHALL quitar el aviso de fallo de un módulo cuando la ruta cambia, y SHALL mostrar el contenido de la nueva ruta.

#### Scenario: Navegar a otra ruta con el aviso visible
- **WHEN** el aviso de fallo está visible y el usuario sigue un enlace del header que lleva a una ruta distinta de la actual
- **THEN** el aviso desaparece y se muestra el contenido de la nueva ruta

#### Scenario: Pulsar el enlace de la ruta actual
- **WHEN** el aviso de fallo está visible y el usuario sigue un enlace que lleva a la misma ruta en la que está
- **THEN** el aviso permanece, porque la ruta no cambió, y la salida es «Recargar página» o volver atrás
