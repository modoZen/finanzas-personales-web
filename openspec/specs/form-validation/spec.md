# form-validation Specification

## Purpose

Define cómo se comporta un formulario ante lo que escribe el usuario y cómo se abre, se cierra y se cancela: valida antes de enviar, señala qué campo corregir, no envía datos inválidos ni dos veces el mismo, se cierra al terminar con éxito y conserva lo escrito si el envío falla.

## Requirements

### Requirement: Un formulario valida lo escrito antes de enviarlo
Un formulario SHALL comprobar los valores de sus campos al intentar enviarlo, SHALL no enviarlos mientras alguno sea inválido y SHALL mostrar junto a cada campo inválido un mensaje en español que diga qué corregir, asociado a ese campo para las tecnologías de apoyo.

#### Scenario: Se envía con campos inválidos
- **WHEN** el usuario intenta enviar el formulario con uno o más campos inválidos
- **THEN** no se envía nada y cada campo inválido muestra su mensaje de error

#### Scenario: Se corrige un campo inválido
- **WHEN** el usuario corrige un campo que mostraba un error
- **THEN** el mensaje de ese campo desaparece sin esperar a un nuevo envío

#### Scenario: Se envía con todos los campos válidos
- **WHEN** el usuario envía el formulario con todos los campos válidos
- **THEN** se envían los valores escritos y no se muestra ningún mensaje de error

### Requirement: El formulario de crear un post exige título, texto y autor válidos
El formulario de crear un post SHALL exigir un título de al menos 3 caracteres, un texto de al menos 10 y un autor que sea un número entero positivo, sin contar los espacios al principio ni al final de ningún campo.

#### Scenario: Título o texto vacíos o demasiado cortos
- **WHEN** el usuario envía el formulario con el título o el texto vacíos, solo con espacios o más cortos que el mínimo
- **THEN** el campo afectado muestra un mensaje que indica el mínimo exigido

#### Scenario: Autor que no es un número entero positivo
- **WHEN** el usuario envía el formulario con un autor vacío, solo con espacios, con letras, con decimales, cero o negativo
- **THEN** el campo del autor muestra un mensaje que indica que debe ser un número entero positivo

### Requirement: Un formulario no se envía ni se cancela mientras espera
Un formulario SHALL impedir un nuevo envío y su cancelación mientras el envío anterior no haya terminado.

#### Scenario: El envío está en curso
- **WHEN** el usuario ha enviado un formulario válido y el servidor aún no ha respondido
- **THEN** los botones de enviar y de cancelar quedan desactivados hasta que la petición termina

### Requirement: Un envío con éxito cierra el formulario
Un formulario SHALL desaparecer cuando el envío termina con éxito, y SHALL mostrarse vacío y sin mensajes de error cuando el usuario lo abra de nuevo.

#### Scenario: El envío tiene éxito
- **WHEN** el servidor acepta lo enviado
- **THEN** el formulario desaparece, vuelve a mostrarse el botón para abrirlo y se avisa de que el elemento se creó

#### Scenario: Se abre de nuevo tras un envío con éxito
- **WHEN** el usuario abre el formulario después de un envío con éxito
- **THEN** los campos están vacíos, no hay mensajes de error y el aviso de la creación anterior ya no se muestra

### Requirement: Un envío fallido conserva lo escrito
Un formulario SHALL seguir abierto y conservar los valores de sus campos cuando el envío falla, para que el usuario pueda reintentar sin volver a escribirlos.

#### Scenario: El envío falla
- **WHEN** el servidor rechaza lo enviado o no se puede llegar a él
- **THEN** el formulario sigue abierto con lo que el usuario había escrito y el botón de enviar vuelve a estar activo

### Requirement: El formulario se abre y se cancela a petición del usuario
La pantalla SHALL ofrecer un botón para abrir el formulario y ocultarlo mientras el formulario está abierto, SHALL ofrecer «Cancelar» para cerrarlo sin enviar nada, y SHALL no mostrar avisos de una creación anterior al abrir o al cancelar.

#### Scenario: Se abre el formulario
- **WHEN** el usuario pulsa el botón para abrir el formulario
- **THEN** se muestra el formulario y el botón para abrirlo deja de mostrarse

#### Scenario: Se cancela el formulario
- **WHEN** el usuario pulsa «Cancelar»
- **THEN** el formulario desaparece sin enviar nada y vuelve a mostrarse el botón para abrirlo

#### Scenario: Se cancela tras un envío fallido
- **WHEN** el envío ha fallado y el usuario cancela y vuelve a abrir el formulario
- **THEN** el formulario está vacío y no se muestra el error de la creación anterior
