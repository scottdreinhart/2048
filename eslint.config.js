import js from '@eslint/js'
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
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      boundaries,
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
        AudioContext: 'readonly',
        OscillatorNode: 'readonly',
        GainNode: 'readonly',
        HTMLElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        MediaQueryList: 'readonly',
        MutationObserver: 'readonly',
        ResizeObserver: 'readonly',
        IntersectionObserver: 'readonly',
        fetch: 'readonly',
        performance: 'readonly',
        queueMicrotask: 'readonly',
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

      // ── General ──
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z]' }],
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // ── CLEAN Architecture Boundaries ──
      // domain/ must NOT import from app/, ui/, or workers/
      // app/ may import domain/ but NOT ui/
      // ui/ may import domain/ and app/ (hooks)
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
    ignores: ['dist/', 'node_modules/'],
  },
]
