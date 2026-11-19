# Dominio

Qué es Yupana y cómo se mueve la plata. De aquí parten el contrato de la API, el backend y las
pantallas.

## Qué es

Yupana es un **flujo de caja personal**, no un presupuesto: registra qué entra y qué sale de la
caja, y la deuda de tarjetas que se va pateando. Tiene que poder contrastarse con los estados de
cuenta del banco, así que la precisión manda sobre la comodidad.

## Reglas generales

- **Caja única** en la interfaz: interesa el total, no cuánto hay en cada banco. Una transferencia
  entre bancos propios no es un movimiento.
- **Soles y dólares, sin conversión.** Cada movimiento tiene su moneda; caja, deuda y totales se
  muestran por moneda.
- **La caja es la plata en el banco.** Lo que se hace con el efectivo después de retirarlo no se
  registra.
- **Tipo y categoría son dos ejes independientes.** El tipo responde «¿cómo se movió la plata?» (qué
  cuentas toca); la categoría, «¿en qué se fue?». Unas zapatillas compradas con tarjeta son tipo
  Gasto a crédito y categoría Deporte.

Cada campo del movimiento responde una pregunta distinta:

| Campo       | Pregunta                    |
| ----------- | --------------------------- |
| Tipo        | ¿Cómo afecta a mi caja?     |
| Categoría   | ¿En qué se me fue la plata? |
| Descripción | ¿Qué fue exactamente?       |

## Tipos de movimiento

| Tipo             | Qué es                                                                     | Caja                          | Deuda   | Categoría |
| ---------------- | -------------------------------------------------------------------------- | ----------------------------- | ------- | --------- |
| Saldo inicial    | La plata que se tiene o la deuda que se trae al empezar. Uno por cuenta.   | Arranca                       | Arranca | No        |
| Ingreso          | Entra a la caja.                                                           | Sube                          | —       | Sí        |
| Gasto            | Sale de la caja en el momento: débito, transferencia, Yape o Plin, retiro. | Baja                          | —       | Sí        |
| Gasto a crédito  | Compra con tarjeta de crédito. No toca la caja.                            | —                             | Sube    | Sí        |
| Pago de deuda    | Pago de la tarjeta, en la misma moneda de la deuda.                        | Baja                          | Baja    | No        |
| Cambio de moneda | Soles a dólares o al revés, sin salir del sistema bancario.                | Una moneda baja, la otra sube | —       | No        |

- **Saldo inicial** no cuenta en Ingresos ni en Gastos del resumen.
- **Pago de deuda** cuenta en Gastos del resumen (para la caja es una salida), pero no lleva
  categoría: el consumo ya se registró en su categoría al comprar con la tarjeta.
- **Cambio de moneda** registra el monto que sale y el que entra. El tipo de cambio se calcula de
  los dos; no se ingresa.

### Casos especiales

- **Retiro de efectivo:** es un Gasto de la categoría «Retiro de efectivo».
- **Depósito de efectivo:** es un Ingreso de la categoría «Otros ingresos».
- **Cambiar plata en efectivo** (retirar soles, cambiarlos en la calle, depositar dólares): no es un
  Cambio de moneda. Es un Gasto (retiro) y un Ingreso (depósito).
- **Pago de deuda en efectivo:** es un Pago de deuda **sin cuenta de origen**. La deuda baja y la
  caja no se toca, porque esa plata ya salió con el retiro. No suma en Gastos. El modelo lo soporta
  desde ya; la opción en el formulario llega después del MVP.

## Saldo inicial

- Se registra una vez, en la pantalla de bienvenida: caja en soles y en dólares, deuda de tarjetas
  en soles y en dólares. Lo que quede vacío vale 0.
- **Fecha:** hoy por defecto, editable. Se copian los saldos que hoy muestra el banco; no hace falta
  reconstruir el mes.
- **No aparece en la lista de movimientos.** Se ve en el saldo en caja, en la deuda pendiente y en
  la fila «Saldo inicial» del primer mes de la vista anual.
- **No se edita ni se elimina desde la interfaz.** El modelo sí permite corregirlo (los saldos se
  recalculan); mientras no haya una vía en la app, se corrige en la base.

## Categorías

Una categoría responde «¿en qué se me va la plata?» y solo existe si vale la pena verla como fila
propia en la vista anual. Ninguna categoría duplica un tipo: no hay «Tarjeta de crédito», «Pago de
deuda» ni «Transferencia».

- **Ingresos (9):** Sueldo · Honorarios · Gratificación · Bonos y utilidades · CTS · Liquidación e
  indemnización · Intereses · Reembolsos · Otros ingresos.
- **Gastos (19):** Alimentación · Restaurantes y delivery · Vivienda · Servicios · Suscripciones ·
  Transporte · Salud · Cuidado personal · Hogar · Educación · Entretenimiento · Deporte · Viajes ·
  Ropa y compras · Regalos · Apoyo familiar · Comisiones e impuestos · Retiro de efectivo · Otros
  gastos.

Criterios para casos dudosos:

- **Vivienda y Servicios** son solo del hogar propio.
- **Apoyo familiar:** todo lo que va a familiares fuera del hogar propio, en efectivo o pagando sus
  cuentas (la luz de la casa de la madre va aquí, no en Servicios).
- **Viajes** incluye el alojamiento fuera de casa (hotel).
- Una categoría por movimiento, obligatoria en Ingreso, Gasto y Gasto a crédito. Sin subcategorías:
  el detalle va en la descripción.

## Campos del movimiento

- **Tipo**, **monto**, **moneda**, **fecha** (solo el día) y **categoría** según el tipo.
- **Descripción:** obligatoria, hasta ~60 caracteres; funciona como título.
- **Sueldo bruto:** opcional, solo en la categoría Sueldo. Es solo un dato: a la caja entra el neto,
  que es el monto del movimiento.
- **Eliminar:** solo con confirmación. Sin papelera.

## Modelo de entidades

Cuatro tablas.

### Usuario

`id`, `nombre`, `email`, `passwordHash`, `creadoEn`.

### Cuenta

`id`, `usuarioId`, `clase` (`caja` | `deuda`), `moneda` (`PEN` | `USD`), `nombre`, `creadoEn`.

- Una moneda por cuenta. **Caja** es donde está la plata; **deuda** es lo que se debe. La deuda es
  su propia cuenta, para que cualquier caja pueda pagarla.
- Cada usuario arranca con cuatro cuentas: Caja S/, Caja US$, Deuda S/ y Deuda US$. La interfaz
  muestra una caja única por moneda.
- **Sin saldo guardado:** el saldo se calcula de los movimientos (el saldo inicial es un movimiento
  más). La API devuelve `saldoActual`; cómo se calcula es interno del backend.
- **La cuenta de deuda guarda su saldo en negativo por dentro:** comprar a crédito le saca plata (se
  debe más) y pagarla le mete plata (se debe menos). Así el saldo de cualquier cuenta es lo que
  entró menos lo que salió. En pantalla se muestra como «Deuda pendiente», en positivo.

### Categoria

`id` (slug estable, p. ej. `alimentacion`), `clase` (`ingreso` | `gasto`), `nombre`, `icono`,
`orden`.

- Tabla sembrada con las 9 + 19 categorías, sin CRUD. `clase` dice en qué lista aparece; no es el
  tipo del movimiento.

### Movimiento

`id`, `usuarioId`, `tipo`, `fecha`, `descripcion`, `cuentaOrigenId?`, `cuentaDestinoId?`, `monto`,
`montoDestino?`, `categoriaId?`, `montoBruto?`, `creadoEn`, `actualizadoEn`.

- **Origen y destino** son campos que apuntan a una Cuenta: de qué cuenta sale la plata y a cuál
  llega. Uno de los dos puede faltar cuando la plata viene de afuera o se va afuera.
- **`monto` en céntimos (entero), siempre positivo.** La interfaz muestra y recibe soles con
  decimales (S/ 18.50); por dentro se guarda `1850` para que las sumas sean exactas. La dirección la
  dan origen y destino.
- **El movimiento no guarda moneda:** la pone la cuenta.
- **`montoDestino`** solo cuando origen y destino tienen monedas distintas (cambio de moneda).
  `monto` es lo que sale, en la moneda del origen; `montoDestino`, lo que llega, en la del destino.
  El tipo de cambio se calcula de los dos.
- `categoriaId` solo en Ingreso, Gasto y Gasto a crédito. `montoBruto` solo en la categoría Sueldo.

### Tipos

Constante en el código (objeto `as const`), no tabla: cada tipo trae reglas (qué cuentas acepta, si
lleva categoría, si las monedas pueden diferir, cómo cuenta en el resumen), así que un tipo nuevo
exige código de todas formas. En la base, la columna `tipo` lleva un `CHECK` o enum con los valores
permitidos. La regla tipo → origen y destino vive en el backend; el formulario envía la intención.

| Tipo             | Origen → Destino                             |
| ---------------- | -------------------------------------------- |
| Saldo inicial    | — → caja, o deuda → —                        |
| Ingreso          | — → caja                                     |
| Gasto            | caja → —                                     |
| Gasto a crédito  | deuda → —                                    |
| Pago de deuda    | caja → deuda (sin origen si fue en efectivo) |
| Cambio de moneda | caja → caja de la otra moneda                |
