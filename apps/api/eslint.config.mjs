import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const eslintConfig = tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'eslint.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['src/**/*.ts', 'vitest.config.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);

export default eslintConfig;
