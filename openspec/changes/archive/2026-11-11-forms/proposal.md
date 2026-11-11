# Proposal

## Why

El primer módulo real va a tener formularios (alta y edición de movimientos) y la app no tiene dónde apoyarse: ni librería de formularios, ni de esquemas, ni una regla de dónde viven las validaciones. `docs/architecture.md` deja abierta la decisión «dónde viven las validaciones compartidas entre módulos», y `data-layer` dejó fuera la validación en ejecución. Igual que `data-layer` probó el patrón de datos en `example`, este change prueba el de formularios con el formulario de crear un post, que hoy es un botón con un payload fijo.

## What Changes

- Instalar `react-hook-form`, `zod` y `@hookform/resolvers` como dependencias de producción.
- Crear en `src/app/example/` el patrón de formulario, con las capas de la regla 14:
  - `validation/post-form.schema.ts`: esquema Zod del formulario (`title`, `body` y `authorId`, todos como texto, tal como los escribe el usuario), con mensajes en español, y el tipo `PostFormValues` derivado del esquema. Con su test.
  - `mappers/post.mapper.ts`: `toNewPost`, que convierte los valores del formulario en `Omit<Post, 'id'>` (aquí `authorId` pasa de texto a número). Con su test.
  - `components/PostForm/PostForm.tsx`: formulario con React Hook Form (inputs no controlados con `register`) y el resolver de Zod. Recibe `onSubmit`, `onCancel` e `isPending` y no conoce hooks de datos. Valida antes de enviar, muestra el mensaje de cada campo, desactiva «Crear post» y «Cancelar» mientras espera y emite el modelo ya convertido; no hace `reset()`, porque la página lo desmonta. Con su test.
- `ExamplePage` sustituye el botón «Crear post» y su payload fijo por un botón «Nuevo post» que abre `PostForm` en línea (estado `isShow`) y se oculta mientras está abierto. El formulario se cierra al crear con éxito o con «Cancelar»; abrir y cancelar reinician la mutación para que no se vea un aviso anterior. Se conservan el mensaje de éxito y el `ErrorMessage` si la creación falla. Se actualiza su test.
- Actualizar `docs/architecture.md`: regla 22 nueva (las validaciones son por módulo y suben según la regla 6; un esquema de formulario valida los valores del formulario, no el modelo), aclaración en la regla 14 y fuera la decisión abierta de las validaciones compartidas.
- Actualizar `docs/conventions.md`: convención 8 nueva con el patrón del formulario (recibe `onSubmit`, `onCancel` e `isPending`; la página pasa `mutate` y desmonta el formulario en `onSuccess`, así que no hace falta `reset()`; si el envío falla, el formulario sigue abierto con lo escrito).
- Fuera de alcance, quedan para changes posteriores:
  - El formulario en un modal real (capa, foco atrapado, `Escape`): se decide con el diseño. Aquí el formulario va en línea y el `isShow` de la página no cambia cuando llegue el modal.
  - `shared/validation/` y `core/validation/`: la regla 22 los prevé, pero no nacen hasta que un segundo módulo los necesite (regla 3).
  - Componentes de campo reutilizables en `shared/components/` (input con etiqueta y error): el marcado va dentro de `PostForm` hasta que haya un segundo formulario y el diseño.
  - La validación en ejecución de las respuestas del servidor, que sigue como pregunta abierta.
  - Edición, borrado y formularios con varios pasos.

## Capabilities

### New Capabilities

- `form-validation`: cómo se comporta un formulario ante lo que escribe el usuario: valida antes de enviar, señala cada campo inválido con un mensaje que dice qué corregir, no envía un formulario inválido ni dos veces el mismo, se cierra al terminar con éxito, se puede abrir y cancelar, y conserva lo escrito si el envío falla.

### Modified Capabilities

<!-- Ninguna: `remote-data` ya exige que crear un elemento refresque la lista y avise si falla, sin importar si se crea desde un botón o un formulario. -->

## Impact

- **Archivos nuevos**: `src/app/example/validation/` (esquema y test), `src/app/example/components/PostForm/` (componente y test) y el test de `toNewPost` en `mappers/__tests__/`.
- **Archivos modificados**: `src/app/example/mappers/post.mapper.ts`, `ExamplePage` y su test, `docs/architecture.md`, `docs/conventions.md`, `package.json` y `package-lock.json`.
- **Dependencias**: `react-hook-form`, `zod` y `@hookform/resolvers`. Aumentan el bundle del chunk de `example` y, cuando haya más formularios, el del resto; se comprueba en el build.
- **Estructura**: nacen `validation/` y `components/` dentro de `example`. No nace ninguna carpeta global.
- **Verificación**: lint, formato, build y tests con cobertura (umbral 80 %). Lo que solo se ve en un navegador (el lector de pantalla y el aspecto de los errores) queda sin verificar y se informa como tal.
