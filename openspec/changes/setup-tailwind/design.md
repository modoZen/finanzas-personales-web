# Design

## Context

Proyecto Vite 8 + React 19 + TypeScript con Prettier, ESLint 10, Vitest (cobertura mínima del 80 %) y un hook `pre-commit` que ejecuta lint-staged, build y tests. Los estilos son los del template de Vite: `src/index.css` (variables y reglas globales) y `src/App.css` (clases de la página demo). Motivación y alcance en `proposal.md`.

Restricciones: `prettier.config.ts` ya existe y el hook formatea con Prettier los `.css` staged; `src/main.tsx` está excluido de la cobertura; `App.test.tsx` hoy prueba el contador del demo.

## Goals / Non-Goals

**Goals:**
- Tailwind v4 funcionando en desarrollo y en el build de producción, con la menor configuración posible.
- Un cascarón de `App` que permita ver a simple vista que las clases se aplican.
- Que Prettier ordene las clases de Tailwind de forma consistente.
- Que el pre-commit existente siga pasando sin cambios.

**Non-Goals:**
- Tokens, paleta, tipografía de marca y dark mode: se definen en changes posteriores (`design-tokens` y `dark-mode`).
- Utilidades de componentes (`cn()`, `cva`) y primitivas headless: se agregan cuando exista el primer componente que las necesite.
- Estructura de carpetas (`shared/components`, módulos): se decide en el change de arquitectura.

## Decisions

**1. Tailwind v4 con `@tailwindcss/vite`, no con PostCSS.**
Es el plugin oficial para Vite: se registra en `plugins` de `vite.config.ts` junto al de React y no requiere `tailwind.config.js` ni `postcss.config.js`, porque en v4 la configuración vive en el CSS.
*Alternativas:* integración por PostCSS (`@tailwindcss/postcss`), descartada porque añade un archivo de configuración y el plugin de Vite es la vía recomendada para este stack; CLI independiente, descartada porque duplica el pipeline que Vite ya ofrece.

**2. `src/index.css` queda con la importación de Tailwind y nada más.**
Se reemplaza todo su contenido por `@import 'tailwindcss';`. Las variables propias del template (`--text`, `--bg`, `--accent`...) y los estilos globales se eliminan: Tailwind ya trae su capa base (Preflight) y los colores se definirán después como tokens. Una sola hoja de entrada, importada desde `main.tsx` como hoy.
*Alternativa:* conservar las variables del template como base. Descartada: son valores provisionales del demo y mantenerlas invita a usarlas por inercia, justo lo que los tokens vienen a evitar.

**3. `App` como cascarón con un título y clases crudas de Tailwind.**
`App` renderiza un `h1` con "Finanzas personales" y unas pocas clases (centrado, tamaño, peso, color) para comprobar a simple vista que Tailwind está aplicando estilos. Los colores crudos son una verificación provisional y se reemplazan por tokens cuando existan. `App.css` y los assets del demo se eliminan.
*Alternativa:* reescribir el demo completo con Tailwind. Descartada: es trabajo que se tira.

**4. `prettier-plugin-tailwindcss` agregado a `prettier.config.ts`.**
El plugin ordena las clases según el orden de Tailwind y se registra en `plugins`. Con Tailwind v4 el plugin necesita saber cuál es la hoja de estilos de entrada para leer la configuración del proyecto; la opción y su forma exacta se verifican en la documentación durante el apply antes de configurarla. Se instala como dependencia de desarrollo, igual que Prettier.
*Alternativa:* no ordenar clases. Descartada: con Tailwind las clases se acumulan en el JSX y un orden estable evita diffs ruidosos.

**5. Tailwind y su plugin como dependencias de desarrollo.**
El CSS se genera en el build y no se ejecuta nada de Tailwind en el navegador, igual que el resto de herramientas del build (Vite, TypeScript). Se instalan con `-D`.

**6. Verificación sin depender de jsdom.**
jsdom no procesa CSS, así que el test unitario solo comprueba que el título se renderiza (rol `heading`, nivel 1). Que Tailwind funciona de verdad se comprueba con el build: tras `npm run build` el CSS de `dist/` debe contener las utilidades usadas (por ejemplo `.text-center`), y se confirma a simple vista con `npm run dev`.

## Risks / Trade-offs

- [Preflight de Tailwind cambia estilos base (márgenes y tamaños de encabezados, listas, botones)] → no hay UI real que afectar; el cascarón se escribe ya con las clases necesarias.
- [El plugin de Prettier para v4 requiere configuración adicional y falla en silencio si la ruta es incorrecta] → verificarlo con un archivo de prueba desordenado antes de dar la tarea por terminada.
- [Tailwind v4 apunta a navegadores modernos] → es una app personal sin requisito de navegadores antiguos; se confirma el requisito exacto en la documentación durante el apply.
- [Compatibilidad de Tailwind y su plugin con Vite 8] → comprobar los peers antes de instalar; si hay conflicto, fijar la última versión compatible.
- [Eliminar `icons.svg` y los assets rompe referencias que se me hayan pasado] → buscar referencias antes de borrar; `tsc -b` y el build detectan imports rotos.
- [Las clases con colores crudos del cascarón (`text-blue-600`) se copian a componentes reales] → es explícito en el código y en las notas que es provisional; el change de tokens lo reemplaza.

## Migration Plan

1. Instalar Tailwind y registrar el plugin; verificar que el build pasa.
2. Reemplazar `index.css`, reducir `App` y borrar el CSS y los assets del demo.
3. Ajustar el test y agregar el plugin de Prettier.
4. Rollback: revertir los commits de este change; no hay datos ni migraciones.

## Compatibilidad verificada

Se completa durante el apply, una subsección por herramienta.

### Tailwind CSS v4 con Vite

- Versión estable: `tailwindcss` y `@tailwindcss/vite` 4.3.3 (comprobado con `npm view`). `@tailwindcss/vite` declara como peer `vite ^5.2.0 || ^6 || ^7 || ^8`, así que admite Vite 8.
- Instalación: la documentación usa `npm install tailwindcss @tailwindcss/vite`; este proyecto los instala con `-D` (decisión 5).
- Registro del plugin: `import tailwindcss from '@tailwindcss/vite'` y `tailwindcss()` dentro de `plugins` de `vite.config.ts`. No se necesita `tailwind.config.js` ni `postcss.config.js`.
- CSS de entrada: `@import "tailwindcss";`. En este proyecto se escribe con comillas simples por la configuración de Prettier (`singleQuote`).
- Navegadores: Tailwind v4 depende de Chrome 111, Safari 16.4 y Firefox 128 como mínimo. Tailwind incluye algunas utilidades con soporte limitado (`field-sizing: content`, `@starting-style`, `text-wrap: balance`) que se pueden evitar si hace falta.

### prettier-plugin-tailwindcss

- Versión estable: 0.8.1 (comprobado con `npm view`), con peer `prettier ^3.0` y Node >= 20.19. Es ESM-only, lo que no afecta a `prettier.config.ts`.
- Instalación: `npm install -D prettier-plugin-tailwindcss`.
- Registro: se agrega `'prettier-plugin-tailwindcss'` al arreglo `plugins` de la configuración de Prettier. Solo necesita ir último cuando hay otros plugins de Prettier, y aquí no hay ninguno.
- Opción para Tailwind v4: `tailwindStylesheet`, obligatoria con v4 según su README. Indica la hoja de entrada (aquí `./src/index.css`) y la ruta es relativa al archivo de configuración de Prettier, no al archivo que se formatea.
