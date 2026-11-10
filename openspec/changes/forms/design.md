# Design

## Context

`ExamplePage` crea un post con un botón y un payload fijo (`useCreatePost` + `postProxy.create`); no hay librería de formularios ni de esquemas. `docs/architecture.md` ya prevé `validation/` y el sufijo `.schema.ts` en el catálogo de un módulo, y deja abierta la decisión «dónde viven las validaciones compartidas entre módulos». La regla 14 dice que `validation/` se usa desde cualquier capa del módulo y solo importa de `domain/`. Motivación y alcance en `proposal.md`; el comportamiento exigible, en `specs/form-validation/spec.md`. El flujo de crear (refrescar la lista, avisar si falla) ya lo exige `remote-data` y no cambia.

Restricciones que condicionan el diseño:
- `erasableSyntaxOnly` y la regla `explicit-function-return-type` siguen activos.
- Los textos de la interfaz van en español y el código en inglés (convención 3), así que los mensajes de validación van en español dentro del esquema.
- Los tests no usan la red y se sustituye solo en las fronteras (convención 7): en las páginas, el proxy.
- Versiones al planificar: `react-hook-form` 7.91, `zod` 4.6 y `@hookform/resolvers` 7.0, cuyo peer acepta `zod ^3.25 || ^4` y expone el resolver en `@hookform/resolvers/zod`.

## Goals / Non-Goals

**Goals:**
- Dejar un patrón de formulario usable por el primer módulo real: esquema, conversión al modelo, componente y su conexión con un hook de datos.
- Cerrar la decisión abierta de las validaciones compartidas con una regla, sin crear carpetas que nadie usa.

**Non-Goals:**
- `shared/validation/`, `core/validation/` y los componentes de campo reutilizables.
- Validar las respuestas del servidor.
- Estilos definitivos de los campos: las clases de Tailwind son provisionales, como el resto hasta el diseño.

## Decisions

**1. React Hook Form + Zod + `@hookform/resolvers`.**
React Hook Form valida y mantiene el estado del formulario sin re-renderizar en cada tecla, Zod define el esquema en TypeScript y deriva el tipo, y el resolver los une. Se instalan como dependencias de producción.
*Alternativas:* los formularios con acciones de React 19 (`useActionState`), que no dan validación por campo con un esquema; Formik y TanStack Form, descartadas por no aportar nada que el par elegido no dé aquí.

**2. El esquema valida los valores del formulario, no el modelo; el mapper los convierte.**
Los valores de un formulario son lo que escribe el usuario, es decir, texto. `validation/post-form.schema.ts` define `postFormSchema` con `title`, `body` y `authorId`, los tres `string`, y exporta `PostFormValues = z.infer<typeof postFormSchema>`. Las reglas siguen la spec:
- `title`: recortado de espacios y de al menos 3 caracteres.
- `body`: recortado y de al menos 10.
- `authorId`: recortado y un entero positivo escrito con dígitos, sin ceros a la izquierda (`/^[1-9]\d*$/`).

Los mensajes, en español y con el mínimo o el formato exigido: «El título debe tener al menos 3 caracteres.», «El texto debe tener al menos 10 caracteres.» y «El autor debe ser un número entero positivo.» La conversión al modelo vive en `mappers/post.mapper.ts` como `toNewPost(values): Omit<Post, 'id'>`, que hace `Number(values.authorId)`. El `authorId` se escribe como texto a propósito: el patrón enseña una conversión real entre lo que se escribe y el modelo, y sigue valiendo cuando un campo sea un importe o una fecha.
*Alternativa:* `z.coerce.number()` o `valueAsNumber` para que el esquema ya devuelva un número. Descartada: mezcla en el esquema la conversión con la validación, y con Zod 4 el tipo de entrada de `coerce` es `unknown`, lo que complica el tipado del formulario. Con todos los campos de texto, la entrada y la salida del esquema son el mismo tipo.

**3. Dónde vive cada pieza.**
`validation/post-form.schema.ts` con un `validation/__tests__/` al nivel de la carpeta (regla 17); `mappers/post.mapper.ts` (ya existe) gana `toNewPost`, que importa el tipo `PostFormValues`, algo que la regla 14 permite porque `validation/` se usa desde cualquier capa; y `components/PostForm/PostForm.tsx` con su `__tests__/`. Nacen `validation/` y `components/` dentro de `example`; ninguna carpeta global.

**4. `PostForm` es un componente de presentación: emite los datos válidos y la página decide qué pasa después.**
Props: `onSubmit: (post: Omit<Post, 'id'>) => void`, `onCancel: () => void` e `isPending: boolean`. Usa `useForm` con `zodResolver(postFormSchema)` y valores iniciales vacíos, sin genéricos explícitos: el resolver infiere los tipos del esquema; el modo por defecto de React Hook Form (validar al enviar y revalidar en cada cambio) ya cumple el escenario de corregir un campo. Al enviar, valida y, si todo es válido, llama a `onSubmit(toNewPost(values))` sin esperar nada. Pinta dos botones: «Crear post» (de envío), desactivado mientras `isPending`, y «Cancelar» (`type='button'`), que llama a `onCancel` y también se desactiva mientras `isPending` (decisión 9). No hay `reset()`: el formulario se desmonta al cerrarse y su estado se descarta, y si el envío falla sigue montado con lo escrito.
*Alternativas descartadas:*
- Que el formulario espere una promesa (`mutateAsync`) y se vacíe él mismo con `reset()`. Dentro de `onValid` el `reset()` no basta: al terminar, `handleSubmit` marca `isSubmitted: true` sin tener en cuenta ese `reset()` (comprobado en `react-hook-form` 7.91.0) y la revalidación en cada tecla queda activa. Arreglarlo exige un `useEffect` sobre `isSubmitSuccessful` y capturar el rechazo fuera de `handleSubmit`, con un `catch` vacío para no dejar un rechazo sin manejar.
- Marcar el fallo dentro del formulario con `setError('root.server', …)`: traslada al formulario la responsabilidad de mostrar el error del servidor, que ya tiene la página.
- Que `PostForm` use `useCreatePost` por dentro: legítimo (la regla 14 deja a los componentes usar hooks), pero obliga a probar el formulario con el proxy y Query y reparte el estado de la creación entre dos sitios.

**5. Accesibilidad básica sin componente de campo.**
Cada campo lleva su `label` asociado, `aria-invalid` y `aria-describedby` apuntando a su mensaje de error. Los mensajes de campo no llevan `role="alert"`: el único `alert` de la página sigue siendo el `ErrorMessage` de la creación fallida, así que los tests y los lectores de pantalla no los confunden. El `form` lleva `noValidate` para que el navegador no se adelante al esquema. Los tres campos se pintan a partir de una constante de configuración dentro de `PostForm.tsx`, sin duplicar el marcado ni crear un componente de campo; un componente reutilizable en `shared/components/` nace con el segundo formulario y el diseño.

**6. Se prueba en tres niveles, sustituyendo solo en las fronteras (convención 7).**
- *Esquema y mapper*: tests unitarios de funciones puras; el del esquema recorre cada regla de la spec con valores válidos e inválidos.
- *`PostForm`*: con el esquema y el mapper reales, `userEvent` para escribir y `vi.fn()` como `onSubmit` y `onCancel` (son props, no sustituciones). Comprueba los escenarios de la spec: mensajes por campo y asociados, el foco en el primer campo inválido, que no envía inválido, que revalida al corregir, que envía el modelo convertido, los dos botones desactivados con `isPending` y que «Cancelar» llama a `onCancel` y no a `onSubmit`.
- *`ExamplePage`*: con los hooks reales y `vi.spyOn(postProxy, …)`: «Nuevo post» abre el formulario y se oculta; un envío válido llama a `postProxy.create` con el modelo (`authorId` numérico), cierra el formulario, vuelve a mostrar «Nuevo post» y muestra el mensaje de éxito; al reabrir tras el éxito el formulario está vacío y el mensaje ya no se ve; un envío inválido no llama a `postProxy.create`; un rechazo muestra el `ErrorMessage` y deja el formulario abierto con lo escrito; «Cancelar» cierra y vuelve a mostrar «Nuevo post»; y tras un fallo, cancelar y reabrir no muestra el error anterior.

**7. La regla va a `docs/architecture.md` sin crear carpetas (regla 3).**
Contenido acordado:
- Regla 22 nueva, en la sección «Contenido de las carpetas», tras la 21: «Las validaciones (`validation/`, archivos `*.schema.ts`) son por módulo. Si dos módulos necesitan la misma, sube según la regla 6: a `shared/validation/` si no conoce el negocio (reglas genéricas como obligatorio, email o longitud mínima, con sus mensajes), o a `core/validation/` si lo conoce (reglas que usan tipos de `domain/`, que `shared/` no puede importar por la regla 9). Un esquema de formulario valida los valores del formulario, no el modelo: la conversión de esos valores al modelo se hace en un mapper. Esas carpetas nacen cuando un segundo módulo las necesita (regla 3).»
- Regla 14: «`utils/` y `validation/` solo importan de `domain/`» pasa a añadir «(entre las capas del módulo; los esquemas pueden usar `shared/` y `core/` como cualquier otra capa)».
- Decisiones abiertas: se quita «Dónde viven las validaciones compartidas entre módulos».

El texto de la regla 22 dice «esquema de formulario» para no cerrar la validación de las respuestas del servidor, que sigue abierta.

**8. El patrón de formulario queda como convención 8 en `docs/conventions.md`.**
La regla 22 de `architecture.md` dice dónde viven el esquema y el mapper; la convención dice cómo se escribe el formulario. Va en `conventions.md` porque es una regla de código y no de carpetas. Contenido acordado, tras la convención 7:

> 8. **Formularios**: el formulario (`useForm` con el resolver del esquema, regla 22 de `architecture.md`) vive en un componente que recibe `onSubmit`, `onCancel` e `isPending` y no conoce los hooks de datos: emite los datos válidos y la página decide qué pasa después. La página pasa la función `mutate` de su mutación y, en su `onSuccess`, desmonta el formulario, de modo que el siguiente se abre nuevo y no hace falta `reset()`. Si el envío falla, el formulario sigue abierto con lo escrito y el error lo muestra la página a partir del estado de la mutación.

**9. La página controla cuándo se muestra el formulario: en línea ahora y en un modal después.**
`ExamplePage` guarda `isShow` (empieza en `false`). Con `false` muestra el botón «Nuevo post»; con `true` muestra `PostForm` y oculta ese botón.
- *Abrir*: «Nuevo post» llama a `createPost.reset()` y pone `isShow` en `true`.
- *Cancelar*: `onCancel` llama a `createPost.reset()` y pone `isShow` en `false`.
- *Éxito*: `onSubmit` llama a `createPost.mutate(post, { onSuccess: () => setIsShow(false) })`. Cierra sin `reset()`, para que el mensaje de éxito siga visible hasta la siguiente apertura.
- *Fallo*: no necesita código; el formulario sigue abierto y la página muestra el `ErrorMessage` desde `createPost.isError`.

El `reset()` de la mutación al abrir y al cancelar evita que un error o un éxito anteriores aparezcan al volver a abrir. `mutate` no lanza, así que no hay `catch`. Los callbacks que se pasan a una llamada de `mutate` no tienen garantizado dispararse si la mutación se reinicia antes de terminar; por eso «Cancelar» se desactiva mientras `isPending`.
Un modal posterior envuelve a `PostForm` y la página sigue controlando `isShow`, sin tocar el formulario. Un modal real (capa, foco atrapado, `Escape`, `aria-modal`) es un componente de `shared/` con su propio diseño y queda fuera de este change.
*Alternativa:* remontar el formulario cambiando su `key` tras el éxito. Descartada: es más implícito que ocultarlo con `isShow`, y no resuelve que haya un botón para abrirlo y otro para cancelar.

## Risks / Trade-offs

- [El tipado que infiere el resolver podría no encajar con Zod 4] → Con todos los campos de texto la entrada y la salida del esquema coinciden; se comprueba con `npx tsc -b` al instalar y, si no encajara, se pasan los tres genéricos (`useForm<z.input<…>, any, z.output<…>>`, como indica el README del resolver) y se anota aquí.
- [Los callbacks de `mutate` pueden no dispararse si la mutación se reinicia o el componente se desmonta antes de que termine] → «Cancelar» se desactiva mientras `isPending` y la página no cierra el formulario por otra vía mientras espera; el test del éxito comprueba que el formulario se cierra.
- [Un olvido del `createPost.reset()` al abrir o al cancelar dejaría a la vista un error o un éxito anteriores] → Los tests de la página cubren reabrir tras un fallo y tras un éxito.
- [Un autor con muchísimos dígitos pasa el esquema y `Number` pierde precisión] → Hoy no hay ningún autor real; se acota cuando el campo sea de verdad un identificador.
- [Los mensajes en español dentro del esquema acoplan la validación al idioma de la interfaz] → Es lo que mandan las convenciones (los textos de la interfaz van en español); si algún día hay varios idiomas, los mensajes salen del esquema.
- [Los tres campos comparten marcado y se pintan desde una constante, que podría quedarse corta con otro tipo de campo] → Se amplía con el segundo formulario; el componente de campo reutilizable se decide entonces, con el diseño.
- [Las dependencias engordan el chunk de `example`] → Viajan en el chunk de `ExampleRouter` (carga diferida); se anota el tamaño antes y después en la verificación.
- [El test de la página escribe en campos y es más lento que el del botón] → Son tres campos y un envío; se acepta.

## Migration Plan

1. Dependencias, esquema y mapper con sus tests, y la regla 22 en `architecture.md`.
2. `PostForm` con su test y la convención 8 en `conventions.md`.
3. `ExamplePage` conectada al formulario, con su test.
4. Verificación final: lint, formato, build, cobertura y comprobaciones de cumplimiento.

## Open Questions

- Qué componente de campo (etiqueta, entrada, error) llevará `shared/components/` cuando haya un segundo formulario: se decide con el diseño.
- Si validar las respuestas del servidor con esquemas: se decide con el primer módulo real.
- Cómo se presenta el formulario como modal (componente `Modal` en `shared/`, foco, `Escape`): se decide con el diseño; `PostForm` y el `isShow` de la página no cambian.
- Pendiente para `error-handling`: la creación de un post muestra su error en la propia página (`ErrorMessage`), así que esa mutación no debe abrir el modal global. Hay que excluirla, por ejemplo con `meta` en `useCreatePost`; el mecanismo (marcar lo que se excluye o lo que se incluye) se decide en ese change.
