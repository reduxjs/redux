import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// No __dirname under Node ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  test: {
    globals: true,
    dir: 'test',
    alias: {
      redux: path.join(
        __dirname,
        process.env.TEST_DIST ? 'node_modules/redux' : 'src/index.ts'
      ),

      // this mapping is disabled as we want `dist` imports in the tests only to be used for "type-only" imports which don't play a role for jest
      '@internal': path.join(__dirname, 'src')
    }
  }
})
