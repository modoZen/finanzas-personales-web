# Visual

Reglas para que el código respete el diseño. Los valores exactos (colores, radios, sombras,
tipografía) están en los tokens del Design System «Yupana»; aquí va el criterio de uso.

## Dirección

**Celeste aireada:** fondo celeste muy claro, tarjetas blancas muy redondeadas (24 px), botones
píldora, tipografía Plus Jakarta Sans. Sin modo oscuro por ahora.

## Color por significado

**Neutro es lo normal; el color es la señal.**

| Color                  | Token     | Se usa para                                                                                                                        | No se usa para              |
| ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Azul marino casi negro | `ink`     | Texto. Gastos y cambio de moneda en la lista (son la mayoría de las filas).                                                        | —                           |
| Azul                   | `primary` | **Solo lo interactivo o activo:** botones, enlaces, la opción elegida, filtros activos, conceptos que se pueden tocar en Análisis. | Nada que no se pueda tocar. |
| Verde                  | `income`  | Ingresos.                                                                                                                          | —                           |
| Ámbar oscuro           | `credit`  | Crédito y deuda, siempre, aunque el monto sea cero.                                                                                | —                           |
| Rojo                   | `error`   | Errores y la acción de eliminar.                                                                                                   | Montos negativos o gastos.  |

- Si algo es azul, se tiene que poder tocar. Un concepto de Análisis cuya tabla de detalle aún no
  existe va en neutro.
- El pago de deuda se ve igual que un gasto (mismo ícono, mismo neutro): para la caja es una salida.
  Se distingue por el subtítulo «Pago de deuda».

## Íconos por tipo

**El ícono muestra el efecto en la caja.**

| Ícono   | Tipo                                      |
| ------- | ----------------------------------------- |
| ↑       | Ingreso (la caja sube)                    |
| ↓       | Gasto y Pago de deuda (la caja baja)      |
| Tarjeta | Gasto a crédito (todavía no toca la caja) |
| ⇄       | Cambio de moneda                          |

Las categorías se muestran con monograma (dos letras) hasta que tengan íconos propios.

## Tablas

- Sin sangría salvo que una fila dependa jerárquicamente de otra. Conceptos, subtotales y totales
  van al mismo nivel; los totales se distinguen por peso y línea, no por sangría.
- Cifras con números tabulares, alineadas a la derecha.

## Errores

- **Validación de un campo:** bajo su input, en rojo, con ícono.
- **Error del servidor al enviar** (iniciar sesión, guardar un movimiento): aviso `ErrorNotice` en
  línea, encima del formulario o junto a su botón. El formulario sigue lleno.
- **Error al cargar datos de una pantalla:** `ErrorNotice` en lugar del contenido, con «Reintentar».
  La navegación sigue visible.
- **Modal global de error:** solo para errores inesperados. Las mutaciones y consultas que su
  pantalla ya maneja se excluyen con `meta`.
- **Lista vacía:** `EmptyState` con título, una línea de texto y la acción que la resuelve.

## Design System

- Design System «Yupana»: https://claude.ai/artifact/K3d1i96WPBc55sCp4PaHwV
- Tokens con nombres por propósito: `bg`, `surface`, `surface-muted`, `ink`, `ink-muted`, `line`,
  `control-border`, `primary` (y `-hover`, `-soft`, `-tint`), `on-primary`, `income` (y `-soft`,
  `-surface`), `credit` (y `-soft`), `error` (y `-soft`), `overlay`.
- 16 componentes: Logo, Button (primary, secondary, ghost, danger), IconButton, Fab, TextField,
  AmountField, DescriptionField, CurrencyToggle, CategoryGrid, TypeIcon, MovementRow, SummaryCard,
  Modal, LoadingBar, EmptyState, ErrorNotice.
- Faltan dos componentes que aparecieron en las pantallas: un **selector segmentado** genérico (el
  tipo del formulario reusa hoy el estilo de CurrencyToggle) y las **tarjetas de «¿Cómo lo
  pagaste?»**. Se crean cuando se implemente el formulario.
- A cada change se le lleva solo lo suyo: al de tokens, `tokens.json`; al de componentes, el README
  y el CSS de los componentes que toque.
