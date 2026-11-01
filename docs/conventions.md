# Convenciones de código

Reglas de código y estilo que no son de carpetas ni archivos (esas viven en `architecture.md`).

1. **Componentes**: `const X: FC<Props> = () => ...`, con `FC` importado como tipo desde `react`. No
   se usa `function X` ni se tipa el retorno con `JSX.Element`. Excepción: los componentes
   genéricos, que necesitan `function` para declarar el parámetro de tipo.
2. **Sin `enum`**: el `tsconfig` activa `erasableSyntaxOnly`. Las constantes se declaran como
   objetos `as const`.
3. **Idioma**: código, nombres de archivo y commits en inglés; textos de la interfaz en español.
4. **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `build:`…).
5. **Imports sin extensión**: `@/App`, no `@/App.tsx`. Los assets conservan la suya (`./index.css`).
