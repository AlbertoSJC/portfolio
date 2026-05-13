import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('eslint:recommended', 'plugin:vue/vue3-recommended', 'plugin:@typescript-eslint/recommended', 'prettier', '@vue/eslint-config-typescript/recommended'),
  ...compat.extends('plugin:vue/strongly-recommended', 'eslint:recommended', '@vue/typescript/recommended', 'prettier').map((config) => ({
    ...config,
    files: ['./src/**/*.vue', './src/**/*.ts', './tests/**/*.test.ts'],
    ignores: [],
  })),
  {
    files: ['./src/**/*.vue', './src/**/*.ts', './tests/**/*.test.ts'],
    ignores: [],

    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
      vue,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },

    rules: {
      'prettier/prettier': 'error',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'no-undef': 'off',
      'no-shadow': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'class-methods-use-this': 'off',
      'no-underscore-dangle': 'off',

      'vue/component-tags-order': [
        'error',
        {
          order: [['script', 'template'], 'style'],
        },
      ],

      'vue/padding-line-between-blocks': ['error', 'always'],

      'lines-between-class-members': [
        'error',
        'always',
        {
          exceptAfterSingleLine: true,
        },
      ],

      'import/prefer-default-export': 'off',
      'vue/no-setup-props-destructure': 'off',
      'vue/no-dupe-keys': 'off',
      'vue/valid-v-model': 'off',
      'vue/no-v-model-argument': 'off',
      'vue/multi-word-component-names': 'off',
      'import/no-extraneous-dependencies': 'off',
      radix: 'off',
      'vue/no-v-for-template-key': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/valid-v-bind': 'off',
    },
  },
];
