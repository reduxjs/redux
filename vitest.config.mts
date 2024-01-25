import { defineConfig } from 'vitest/config'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

// No __dirname under Node ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  test: {
    globals: true,
    include: ['./test/**/*.(spec|test).[jt]s?(x)'],
    alias: {
      redux: path.join(__dirname, './src/index.ts'), // @remap-prod-remove-line

      // this mapping is disabled as we want `dist` imports in the tests only to be used for "type-only" imports which don't play a role for jest
      '@internal': path.join(__dirname, 'src')
    }
  }
})
