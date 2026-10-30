# Proposal

## Why

Los estilos actuales son los del template de Vite: CSS global con clases como `.hero`, `.counter` y `#center`, pensado solo para la página demo. Antes de construir cualquier pantalla conviene tener definida la herramienta de estilos, para que todo componente nuevo nazca con ella en lugar de migrarlo después.

## What Changes

- Agregar Tailwind CSS v4 con su plugin oficial de Vite (`@tailwindcss/vite`), registrado en `vite.config.ts`.
- Reemplazar el contenido de `src/index.css` por la importación de Tailwind y eliminar los estilos globales del template.
- Eliminar `src/App.css`, los assets del demo (`hero.png`, `react.svg`, `vite.svg`) y `public/icons.svg`, que solo los usa la página demo. `favicon.svg` se mantiene.
- Reducir `App` a un cascarón mínimo: un título centrado con unas pocas clases de Tailwind (tamaño, peso, color), para comprobar a simple vista que Tailwind funciona sin cargar con el demo.
- Ajustar `src/App.test.tsx` al nuevo contenido, ya que hoy prueba el contador del demo.
- Agregar `prettier-plugin-tailwindcss` a la configuración de Prettier para ordenar las clases de forma consistente.
- Como primera tarea, revisar la documentación oficial de Tailwind v4 contra las versiones instaladas, para no depender de supuestos de versiones anteriores.
- Fuera de alcance, queda para changes posteriores: tokens de diseño y paleta, dark mode (hook y toggle), utilidad `cn()` y `cva`, primitivas headless y la estructura de carpetas (`shared/components` y módulos).

## Capabilities

### New Capabilities
<!-- Ninguna: es infraestructura de desarrollo, no comportamiento del producto. -->

### Modified Capabilities
<!-- Ninguna. El change declara `skip_specs: true`. -->

## Impact

- **Dependencias**: `tailwindcss` y `@tailwindcss/vite` (dependencias de desarrollo, dado que se procesan en el build) y `prettier-plugin-tailwindcss` (dev).
- **Archivos modificados**: `package.json`, `vite.config.ts`, `prettier.config.ts`, `src/index.css`, `src/App.tsx`, `src/App.test.tsx` y `README.md` si menciona los estilos.
- **Archivos eliminados**: `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg`.
- **Flujo de trabajo**: el pre-commit existente (lint, build y tests con cobertura) sigue aplicando sin cambios.
