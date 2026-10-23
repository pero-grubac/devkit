import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results', '.lighthouseci', '_site']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Remaining cases sync with external systems (async digests, canvas drawing,
      // lazy-loaded libs, timers) or reset editable state, so keep them visible as warnings.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Tooling and tests run in Node.
    files: ['*.config.js', 'tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
])
