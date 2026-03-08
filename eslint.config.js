import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'
import boundaries from 'eslint-plugin-boundaries'

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      boundaries,
    },
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/*' },
        { type: 'app', pattern: 'src/app/*' },
        { type: 'ui', pattern: 'src/ui/*' },
        { type: 'workers', pattern: 'src/workers/*' },
        { type: 'themes', pattern: 'src/themes/*' },
      ],
    },
    rules: {
      // ── React ──
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off',

      // ── Hooks ──
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── General — disable base rules in favor of TypeScript-aware equivalents ──
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // ── CLEAN Architecture Boundaries ──
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'domain', allow: ['domain'] },
            { from: 'app', allow: ['domain', 'app'] },
            { from: 'ui', allow: ['domain', 'app', 'ui'] },
            { from: 'workers', allow: ['domain'] },
            { from: 'themes', allow: [] },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'electron/', 'android/'],
  },
]
