import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  reactRefresh.configs.recommended,
  reactRefresh.configs.next,
  globalIgnores([
    'components/ui/**',
    'wiki/**',
    '.next/**',
    'postcss.config.mjs',
    'eslint.config.mjs',
    'next-env.d.ts',
  ]),
])
