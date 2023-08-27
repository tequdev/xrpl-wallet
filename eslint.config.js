const typescriptEslitPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptEslintParser = require('@typescript-eslint/parser')
const eslintConfigPrettier = require('eslint-config-prettier')
const eslintPluginImport = require('eslint-plugin-import')
const eslintPluginUnusedImports = require('eslint-plugin-unused-imports')

// @ts-check

/** @typedef {import('eslint').ESLint.ConfigData} ConfigData */

/** @type {ConfigData} */
const config = [
  eslintConfigPrettier,
  {
    plugins: { import: eslintPluginImport, 'unused-imports': eslintPluginUnusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'import/order': [
        'warn',
        {
          alphabetize: {
            order: 'asc',
          },
          'newlines-between': 'always',
        },
      ],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': typescriptEslitPlugin },
    languageOptions: {
      parser: typescriptEslintParser,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['**/dist', '**/.next'],
  },
]

module.exports = config
