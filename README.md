# Finanzas personales (web)

Aplicación web de finanzas personales hecha con React 19, TypeScript y Vite.

## Requisitos

- Node.js 24 o superior.
- npm.

## Instalación

```bash
npm install
```

`npm install` también ejecuta el script `prepare`, que activa los hooks de Git con Husky. No hace
falta ningún paso manual adicional.

## Scripts

| Script                  | Qué hace                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| `npm run dev`           | Servidor de desarrollo con Vite.                                         |
| `npm run build`         | Verifica los tipos (`tsc -b`) y genera el build de producción.           |
| `npm run preview`       | Sirve localmente el build generado.                                      |
| `npm run lint`          | Ejecuta ESLint sobre todo el proyecto.                                   |
| `npm run format`        | Formatea el proyecto con Prettier.                                       |
| `npm run format:check`  | Comprueba el formato sin modificar archivos.                             |
| `npm test`              | Ejecuta los tests una vez con Vitest.                                    |
| `npm run test:watch`    | Ejecuta los tests en modo observación.                                   |
| `npm run test:coverage` | Ejecuta los tests con cobertura; falla si algún indicador baja del 80 %. |

## Estilos

Los estilos se escriben con clases de [Tailwind CSS](https://tailwindcss.com/) v4, que se integra
con Vite mediante `@tailwindcss/vite`. La hoja de entrada es `src/index.css` y no hay
`tailwind.config.js`: la configuración de Tailwind vive en el CSS. Para ver los estilos aplicados,
levantá el servidor con `npm run dev`.

Los tokens de diseño (paleta y tipografía), el dark mode y la estructura de componentes se definirán
en changes posteriores. Hasta entonces, los colores que aparecen en las clases son provisionales.

## Hook de pre-commit

Cada `git commit` ejecuta, en este orden y deteniéndose en el primer fallo:

1. **lint-staged**: sobre los archivos staged, `eslint --fix` y `prettier --write` para `.ts` y
   `.tsx`, y `prettier --write` para `.json`, `.css`, `.html` y `.md`. Las correcciones se añaden al
   commit.
2. **`npm run build`**: compila el proyecto y verifica los tipos.
3. **`npm run test:coverage`**: ejecuta los tests y exige un 80 % de cobertura en statements,
   branches, functions y lines.

Si alguno de los pasos falla, el commit se rechaza. En una emergencia se puede saltar el hook con
`git commit --no-verify`.

Prettier no formatea los archivos generados por herramientas externas: `openspec/` y `.claude/` (ver
`.prettierignore`).
