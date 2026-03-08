import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        Math: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        Worker: 'readonly',
        URL: 'readonly',
        self: 'readonly',
      },
    },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z]' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
]
