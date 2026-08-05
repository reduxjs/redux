import * as path from 'node:path'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined'
  },

  resolve: {
    tsconfigPaths: true
  },

  root: import.meta.dirname,

  test: {
    alias: process.env.TEST_DIST
      ? [
          {
            find: packageJson.name,
            replacement: path.join(
              import.meta.dirname,
              'node_modules',
              packageJson.name
            )
          }
        ]
      : [],

    chaiConfig: {
      truncateThreshold: 1000
    },

    dir: path.join(import.meta.dirname, 'test'),
    globals: true,

    name: {
      label: packageJson.name
    },

    root: import.meta.dirname,

    typecheck: {
      enabled: true,
      tsconfig: path.join(import.meta.dirname, 'tsconfig.json')
    },

    unstubEnvs: true,
    watch: false
  }
})
