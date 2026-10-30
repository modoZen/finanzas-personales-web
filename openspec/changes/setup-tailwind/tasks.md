# Tasks

## 1. Instalación de Tailwind

- [x] 1.1 Consultar la documentación oficial de Tailwind v4 para Vite (versión estable, instalación, registro del plugin, sintaxis de importación del CSS, requisitos de navegador) y registrar versiones y pasos en "Compatibilidad verificada" de `design.md`; verificar que la sección lista versión, comando de instalación y requisito de navegadores
- [x] 1.2 Instalar `tailwindcss` y `@tailwindcss/vite` como devDependencies y verificar que `npm ls tailwindcss @tailwindcss/vite` no reporta conflictos de peers con Vite 8
- [x] 1.3 Registrar el plugin en `vite.config.ts` junto al de React y verificar que `npm run build` sigue pasando

## 2. Estilos y cascarón

- [x] 2.1 Reemplazar el contenido de `src/index.css` por la importación de Tailwind (`@import 'tailwindcss';`) y verificar que no queda ninguna variable ni regla global del template
- [x] 2.2 Reducir `App` a un cascarón con un `h1` "Finanzas personales" y unas pocas clases de Tailwind (centrado, tamaño, peso, color), quitando el import de `App.css` y los assets; verificar que `npx tsc -b` compila y que `npm run lint` pasa
- [x] 2.3 Buscar referencias con `grep` y luego eliminar `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg` y `public/icons.svg`; verificar que el grep no devuelve referencias previas al borrado y que `npm run build` pasa tras borrar (`favicon.svg` se mantiene)
- [x] 2.4 Reescribir `src/App.test.tsx` con un test que compruebe el `h1` (rol `heading`, nivel 1) y verificar que `npm test` pasa y que `npm run test:coverage` mantiene al menos 80 % en los cuatro indicadores
- [x] 2.5 Verificar que Tailwind aplica estilos: tras `npm run build`, el CSS de `dist/assets/` contiene las utilidades usadas (por ejemplo `.text-center`) y, con `npm run dev`, Max confirma a simple vista que el título se ve centrado, grande y con color
- [x] 2.6 Documentar en `README.md` que los estilos se escriben con Tailwind v4 y que los tokens, el dark mode y la estructura de componentes vendrán en changes posteriores; verificar que los comandos mencionados funcionan tal como están escritos

## 3. Orden de clases con Prettier

- [x] 3.1 Consultar la documentación de `prettier-plugin-tailwindcss` para Tailwind v4 (cómo indicarle la hoja de estilos de entrada) y registrarla en "Compatibilidad verificada" de `design.md`; verificar que la sección lista la versión y la opción de configuración
- [x] 3.2 Instalar `prettier-plugin-tailwindcss` como devDependency y verificar que `npm ls prettier prettier-plugin-tailwindcss` no reporta conflictos de peers
- [x] 3.3 Registrar el plugin en `prettier.config.ts` con la opción de la hoja de entrada y verificar que `npx tsc -b` sigue cubriendo el archivo y que `npx prettier --check prettier.config.ts` carga la config sin error
- [x] 3.4 Verificar con un archivo temporal con clases desordenadas (sin commitearlo) que `npx prettier --check` lo señala y `--write` las reordena, y que `npm run format:check` pasa en todo el repo
- [x] 3.5 Mencionar el plugin en la sección de Prettier del `README.md` y verificar que el texto coincide con lo configurado

## 4. Integración

- [x] 4.1 Con el árbol limpio, verificar que `npm run lint`, `npm run format:check`, `npm run build` y `npm run test:coverage` pasan, y que un commit de prueba con una clase desordenada en un `.tsx` staged pasa por el pre-commit y queda reordenada (sin conservar el commit)

## Workflow follow-up

- Archivar el change con `/opsx:archive` una vez verificado.
