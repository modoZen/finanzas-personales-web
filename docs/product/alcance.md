# Alcance

Qué entra en el MVP y en qué orden. Cada etapa se abre con su `/opsx:explore` y se parte en changes
chicos.

## Etapa 1 · Inicio

El núcleo: registrar y revisar el mes.

- Saldo y deuda inicial (sin él la caja no cuadra con el banco).
- Inicio: resumen, lista del mes, cambio de mes, selector de moneda, filtros por tipo y categoría,
  estados vacío, sin resultados y error.
- Formulario de movimiento: registrar, editar y eliminar, con los cinco tipos.
- Placeholder de descripción por categoría.
- Backend con un **usuario fijo**: las tablas ya llevan `usuarioId`, así que el login llega después
  sin tocar el modelo ni el contrato.

## Etapa 2 · Análisis

- Vista anual con sus tres pestañas: Flujo de caja, Gastos por categoría y Deuda de tarjetas.
- Tablas de detalle por categoría y de la tarjeta. Hasta que una tabla exista, su concepto en la
  vista anual va en neutro.

## Etapa 3 · Cuentas de usuario

- Iniciar sesión y crear cuenta. El usuario fijo pasa a ser el usuario de la sesión.

## Después del MVP

- **Sugerencias de descripción:** las 5 más usadas en la categoría, como botones bajo el campo (ya
  están en el diseño).
- **Cajas:** varias cajas renombrables («BBVA», «Efectivo»), cada una con su saldo inicial;
  transferencias entre cajas; varias tarjetas como varias cuentas de deuda.
- Opción «pagué en efectivo» en el pago de deuda (el modelo ya la soporta).
- Pagar en soles una deuda en dólares.
- Editar el saldo inicial desde la app.
- Recuperar contraseña y verificar el correo.
- Etiquetas («¿para quién, con quién, en qué contexto?»), papelera.
- Grupos con gasto compartido.
- Calendario de vencimientos (suscripciones, servicios, tarjeta) y gastos recurrentes.
- Exportar a Excel (con columnas Tipo y Categoría).
- Registro por voz o chat con IA, y sugerir la categoría según descripciones anteriores.
- Selector para saltar a un mes y año desde Inicio.
- Íconos por categoría.
- Inversiones y flujo proyectado.
