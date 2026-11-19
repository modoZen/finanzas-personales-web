# Proposal

## Why

La aplicación todavía no tiene identidad visual: usa la paleta por defecto de Tailwind (`sky-*`, `red-*`) sin nombres con significado. El Design System «Yupana» ya define sus tokens, y todo lo que sigue (componentes y vistas) se construye sobre ellos. Es el primero de los changes previos a las vistas; se hace ahora porque ningún componente puede escribirse sin tokens a los que apuntar.

## What Changes

- Añadir la dependencia `@fontsource-variable/plus-jakarta-sans` para autoalojar la tipografía (sin Google Fonts por CDN).
- `src/index.css` pasa a ser el archivo de tokens. Orden: `@import 'tailwindcss'`, el import de la fuente y un bloque `@theme` con:
  - los 20 colores del DS por propósito (`bg`, `surface`, `ink`, `primary`, `income`, `credit`, `error`…), como `--color-*`;
  - los 5 radios (`sm`, `md`, `lg`, `xl`, `pill`);
  - las 4 sombras (`card`, `raised`, `fab`, `modal`);
  - los 7 estilos de texto (`display`, `title`, `heading`, `body-strong`, `body`, `caption`, `small`) con su interlineado, peso e interletraje;
  - `--font-sans` con Plus Jakarta Sans.
- No se definen tokens de espaciado: la escala nativa de Tailwind (`p-1` = 4 px … `p-8` = 32 px) coincide con `space-1…8` del DS.
- No se reinicia la paleta por defecto de Tailwind: las clases `sky-*` y `red-*` que usan hoy los componentes siguen funcionando hasta que el change de componentes las sustituya.
- `docs/architecture.md` incorpora la regla de tokens por propósito: el color se nombra por su significado y no por su valor, y los componentes usan las utilidades de los tokens en lugar de la paleta por defecto.
- El Design System no se versiona en el repo. Tras importar los tokens, `src/index.css` es la fuente de verdad y el DS queda como referencia.

Efecto visible aceptado: la fuente cambia en toda la app y `rounded-md` pasa de 6 px a 14 px (8 usos, en `ErrorMessage`, `ErrorFallback` y el módulo temporal `example/`). Se corrige al restilizar los componentes en los changes siguientes.

Fuera de alcance: componentes del DS, restyling de `Spinner`, `ErrorMessage`, `ErrorFallback` y `RootLayout`, vistas, modo oscuro, una carpeta `styles/` y el reset de la paleta por defecto.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

Ninguna. El change es de configuración de estilos y no cambia el comportamiento de ninguna spec existente (`app-navigation`, `form-validation`, `remote-data`); por eso `.openspec.yaml` declara `skip_specs: true`.

## Impact

- `package.json` y `package-lock.json`: una dependencia nueva.
- `src/index.css`: de un solo import a los tokens.
- `docs/architecture.md`: regla de tokens por propósito y nota sobre dónde viven.
- Aspecto de la app existente: nueva tipografía y radios de `rounded-sm/md/lg/xl`. Ningún test depende de estos valores.
- Sin cambios de API, rutas ni lógica.
