import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      curly: 'error',
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/no-shadow': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      camelcase: ['error', { ignoreDestructuring: true, properties: 'never' }],
      'no-underscore-dangle': ['error', { allowAfterThis: true }],
      'no-nested-ternary': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/setup-tests.ts', '**/test-utils/**'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
]);
