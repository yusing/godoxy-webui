import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  fixupConfigRules([
    ...compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:prettier/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'plugin:react-hooks/recommended',
      'next',
      'next/core-web-vitals',
      'next/typescript'
    ),
  ]),
  reactRefresh.configs.recommended,
  reactRefresh.configs.next,
  {
    ignores: [
      'components/ui/**',
      'public/**',
      '.next/**',
      'postcss.config.mjs',
      'eslint.config.mjs',
      'next-env.d.ts',
    ],
  },
])
