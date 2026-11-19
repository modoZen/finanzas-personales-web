# Pantallas

La versión final de cada pantalla. El diseño completo, interactivo, está en el lienzo de Claude
Design «Yupana» (ver «Referencias» al final). Los nombres entre corchetes son los tableros del
lienzo.

En escritorio, menú arriba con **Inicio · Análisis** y botón «Registrar movimiento». En el celular,
barra inferior con **Inicio · + · Análisis**.

## Inicio

Un mes calendario: registrar, revisar y buscar. [`InicioCelular`, `InicioEscritorio`]

- **Encabezado:** título «Noviembre 2026» con flechas ‹ › para cambiar de mes, y selector de moneda
  **S/ · US$**.
- **Resumen:**
  - **Balance del mes** con signo (= lo que cambió la caja).
  - **Ingresos** y **Gastos**. Gastos suma los gastos y los pagos de deuda que salieron de la caja.
  - **Saldo en caja** y **Deuda pendiente** (en ámbar). En escritorio, la deuda muestra además «A
    crédito este mes» y «Pagado este mes».
- **Movimientos:** lista plana del mes, del más reciente al más antiguo.
- **Tocar Ingresos o Gastos** del resumen filtra la lista por ese tipo. Saldo en caja y Deuda
  pendiente no se tocan.

### Fila de movimiento

- Ícono del **tipo** a la izquierda.
- Descripción arriba; debajo, fecha · categoría (o el nombre del tipo, si no lleva categoría).
- Monto con signo a la derecha y una nota opcional debajo: «A crédito, no toca tu caja», «− S/
  750.00 · TC 3.750», «Deuda − 850.00».
- Tocar la fila abre el formulario en modo edición.

### Filtros

[`InicioCelular-panel`, `InicioCelular-filtrado` y sus versiones de escritorio]

- Botón **«Filtrar»** junto al título «Movimientos». Abre un panel: hoja inferior en el celular,
  desplegable en escritorio.
- Dos campos: **Tipo** (Todos los tipos · Ingresos · Gastos · A crédito · Cambio de moneda) y
  **Categoría** (Todas las categorías y la lista). Botones Limpiar y Aplicar.
- **Con filtros activos:** el botón Filtrar pasa a azul relleno (sin contador), aparecen chips con ×
  por cada filtro, el enlace «Quitar filtros» y una línea con el total de lo filtrado.
- Los filtros solo afectan a la lista; el resumen siempre es del mes completo.

### Estados

- **Mes vacío** [`InicioCelular-vacio`]: resumen en cero, saldo y deuda reales (los que vienen de
  meses anteriores o del saldo inicial). Sin botón Filtrar. En lugar de la lista: «Aún no hay
  movimientos en noviembre» con el botón «Registrar movimiento».
- **Filtro sin resultados** [`InicioCelular-sinresultados`]: los chips siguen visibles. En lugar de
  la lista: «Ningún movimiento con estos filtros» con el botón «Quitar filtros».
- **Error al cargar** [`InicioCelular-error`]: título y navegación visibles. En lugar del resumen y
  la lista: aviso «No pudimos cargar tus movimientos — Tus datos están a salvo. Revisa tu conexión y
  vuelve a intentarlo.» con el botón «Reintentar».

## Formulario de movimiento

Página completa en el celular, modal en escritorio. El mismo formulario sirve para registrar, ver y
editar. [`FormCelular` y variantes, `FormEscritorio` y variantes]

### Qué elige la persona

1. **Tipo**, con un selector segmentado: **Ingreso · Gasto · Cambio de moneda**.
2. Si eligió Gasto, **«¿Cómo lo pagaste?»**, con tres tarjetas, cada una con el ícono de su tipo y
   una línea que dice qué le pasa a la caja:
   - **Débito o transferencia** — «Débito, transferencia, Yape o Plin: sale de tu caja ahora.»
   - **Tarjeta de crédito** — «No toca tu caja: suma a tu deuda.»
   - **Pago de tarjeta** — «Sale de tu caja y baja tu deuda. Sin categoría: la compra ya se registró
     cuando la hiciste.»

La app guarda el tipo exacto:

| Elección                       | Tipo guardado    |
| ------------------------------ | ---------------- |
| Ingreso                        | Ingreso          |
| Gasto · Débito o transferencia | Gasto            |
| Gasto · Tarjeta de crédito     | Gasto a crédito  |
| Gasto · Pago de tarjeta        | Pago de deuda    |
| Cambio de moneda               | Cambio de moneda |

### Campos y orden

Tipo → cómo lo pagaste (solo Gasto) → monto y moneda → categoría → sueldo bruto (solo Sueldo) →
descripción → fecha.

- **Por defecto:** Gasto, Débito o transferencia, S/ y la fecha de hoy.
- **Monto:** la etiqueta cambia según el caso: «Monto que recibiste», «Monto», «Monto de la compra»,
  «Monto pagado». Selector S/ · US$ al lado.
- **Categoría:** grilla en el celular, desplegable en escritorio. Solo en Ingreso, Débito o
  transferencia y Tarjeta de crédito.
- **Sueldo bruto (opcional):** solo con la categoría Sueldo. Pista: «Solo como dato: a tu caja entra
  el neto, el monto de arriba.»
- **Descripción:** obligatoria, con un placeholder según la categoría, de una lista fija en el
  código (Servicios «Ej.: Luz, Agua, Internet, Gas»; Transporte «Ej.: Taxi, Gasolina, Pasaje»…).
- **Fecha:** input con calendario. La etiqueta es «Fecha de compra» en Tarjeta de crédito y «Fecha
  del pago» en Pago de tarjeta.
- **Pago de tarjeta:** no muestra la deuda pendiente. Si el monto la supera, un aviso suave bajo el
  campo («Es más que tu deuda pendiente (S/ …). Revisa el monto.»); no impide guardar.
- **Cambio de moneda:** «Sale de tu caja en soles» y «Entra a tu caja en dólares», botón ⇄ para
  invertir la dirección y el **tipo de cambio calculado**, no editable. Aviso bajo el selector:
  «Solo si la plata no sale del banco. Si cambiaste en efectivo, registra el retiro como gasto y el
  depósito como ingreso.»

### Registrar

- Título «Registrar movimiento», botón «Guardar». En escritorio, además «Cancelar».

### Editar y eliminar

[`FormCelular-editar`, `FormCelular-eliminar`, `FormEscritorio-editar`, `FormEscritorio-eliminar`]

- Título «Editar movimiento», el formulario lleno y el botón «Guardar cambios».
- **Eliminar:** botón de texto en rojo. En el celular, debajo de «Guardar cambios»; en escritorio, a
  la izquierda del pie del modal.
- **Confirmación:** «¿Eliminar este movimiento?» con la descripción y el monto, y «No se puede
  deshacer: tu caja y tus totales se recalculan sin él.» Botones Cancelar y Eliminar (rojo). En
  escritorio reemplaza al modal del formulario.

### Error al guardar

[`FormCelular-error`, `FormEscritorio-error`]

- Aviso «No se guardó el movimiento — Tus datos siguen aquí. Revisa tu conexión y vuelve a
  intentarlo.» encima del botón Guardar. El formulario sigue lleno.

## Saldo y deuda inicial

Pantalla de bienvenida, una sola vez. Página completa en el celular; tarjeta centrada en escritorio.
[`SaldoInicialCelular`, `SaldoInicialEscritorio`]

- Campos: caja en soles, caja en dólares, deuda en soles, deuda en dólares (los de dólares y deuda
  pueden quedar vacíos), y «Fecha de tus saldos» (hoy por defecto).
- Botón «Empezar» → **modal de confirmación** con los cuatro montos (la deuda en ámbar) y la fecha:
  «Revisa que coincidan con tu banco: después no podrás cambiarlos.» Botones «Volver» y «Sí,
  empezar». [`SaldoInicialConfirmar…`]

## Análisis

El año, en tablas. [`AnualPestanasCelular`, `AnualPestanasEscritorio`]

- 12 meses en columnas más la columna del año. Flechas ‹ › para cambiar de año, mes actual
  resaltado, meses futuros vacíos. Selector S/ · US$.
- En el celular, la columna de conceptos queda fija y la tabla se desplaza en horizontal.
- Solo aparecen las categorías con movimientos en el año.

Tres pestañas:

### Flujo de caja

«¿Cómo se movió mi plata?» Cuadra con el banco.

- **Arriba:** Saldo inicial · Saldo final · Balance del mes (con signo), en ese orden.
- **Entradas:** una fila por categoría de ingreso → **Total ingresos** (igual al de Inicio) · Cambio
  de moneda (si entra plata en esa moneda) → **Total entradas**.
- **Salidas, por tipo:** Débito o transferencia · Retiro de efectivo · Pago de tarjeta → **Total
  gastos** (igual al de Inicio) · Cambio de moneda (si sale) → **Total salidas**.

### Gastos por categoría

«¿En qué se me va la plata?»

- Una fila por categoría de gasto, sumando **débito y crédito** por fecha de compra. Sin pagos de
  tarjeta (serían doble conteo).
- Total consumo y «Cómo se pagó» (débito / tarjeta).
- Nota: este total no coincide con el Total gastos de la caja, porque incluye lo comprado a crédito
  y excluye los pagos de tarjeta.

### Deuda de tarjetas

- Deuda al inicio · Compras a crédito · Crédito abonado · Deuda pendiente, todas al mismo nivel.

### Qué se toca

- Lo que está en azul se toca. Nombre de una fila → su tabla de detalle del año; celda → la misma
  tabla abierta en ese mes. En Deuda de tarjetas, Compras a crédito y Crédito abonado → la tabla de
  la tarjeta.
- Saldos y totales no se tocan.
- **Mientras una tabla de detalle no exista en el código, su concepto va en neutro**, sin azul.

## Tablas de detalle

Páginas propias, no modales. Mismo formato que la vista anual y el Excel. [`LibroAlimentacion…`,
`LibroTarjeta…`]

- Meses arriba, cada uno con tres columnas **Fecha · Descripción · Monto**; conceptos y totales a la
  izquierda, todos al mismo nivel; columna Año. Abre mostrando el mes actual.
- Ruta arriba para volver: «Análisis 2026 › Gastos por categoría › Alimentación».
- **Por categoría:** bloque «Débito o transferencia» → Total débito; bloque «Con tarjeta de crédito»
  (en ámbar) → Total con tarjeta; Total de la categoría.
- **Tarjeta de crédito:** Compras a crédito · Deuda pendiente anterior · Total crédito por abonar ·
  Crédito abonado · Total crédito abonado · Deuda pendiente.

## Iniciar sesión y crear cuenta

[`LoginCelular`, `LoginEscritorio`, `CrearCuentaCelular`, `CrearCuentaEscritorio` y sus versiones
con error]

- **Iniciar sesión:** Correo y Contraseña (con botón de texto «Mostrar» / «Ocultar»), botón «Iniciar
  sesión» y enlace «¿No tienes cuenta? Crea una».
  - Error del servidor: aviso «No pudimos iniciar sesión — Revisa tu correo y tu contraseña, y
    vuelve a intentarlo.» encima del formulario.
- **Crear cuenta:** Nombre, Correo, Contraseña («Al menos 8 caracteres.») y Repite la contraseña;
  enlace de vuelta a iniciar sesión.
  - Errores de campo bajo cada input.

## Navegación

**Provisional**: es la propuesta del diseño; se valida usando la app y se cierra en el explore de
cada módulo.

- **Inicio = un mes** (lista). **Análisis = el año** (tablas). Análisis no lleva a Inicio: desde
  Análisis se baja a sus tablas de detalle y se vuelve con la ruta.
- Para buscar o revisar movimientos se usa la lista de Inicio con filtros; para comparar y ver
  tendencias, las tablas de Análisis.

## Referencias

- Lienzo de pantallas: https://claude.ai/artifact/Kj6G2kzcY7CRnaPjwKBevm
- Design System «Yupana»: https://claude.ai/artifact/K3d1i96WPBc55sCp4PaHwV
- Los tableros marcados como descartados o alternativas en el lienzo son historial: no aplican.
