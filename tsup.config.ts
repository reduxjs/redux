import babel from '@babel/core'
import type { Plugin } from 'esbuild'
import { getBuildExtensions } from 'esbuild-extra'
import fs from 'node:fs/promises'
import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

const tsconfig = 'tsconfig.build.json' satisfies Options['tsconfig']

// Extract error strings, replace them with error codes, and write messages to a file
const mangleErrorsTransform: Plugin = {
  name: 'mangle-errors-plugin',
  setup(build) {
    const { onTransform } = getBuildExtensions(build, 'mangle-errors-plugin')

    onTransform({ loaders: ['ts', 'tsx'] }, async args => {
      try {
        const res = await babel.transformAsync(args.code, {
          parserOpts: {
            plugins: ['typescript']
          },
          plugins: [['./scripts/mangleErrors.cjs', { minify: false }]]
        })

        if (res == null) {
          throw new Error('Babel transformAsync returned null')
        }

        return {
          code: res.code!,
          map: res.map!
        }
      } catch (err) {
        console.error('Babel mangleErrors error: ', err)
        return null
      }
    })
  }
}

export default defineConfig(options => {
  const commonOptions: Options = {
    entry: {
      redux: 'src/index.ts'
    },
    esbuildPlugins: [mangleErrorsTransform],
    sourcemap: true,
    tsconfig,
    ...options
  }

  return [
    // Standard ESM, embedded `process.env.NODE_ENV` checks
    {
      ...commonOptions,
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
      dts: true,
      clean: true,
      async onSuccess() {
        // Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
        await fs.copyFile('dist/redux.mjs', 'dist/redux.legacy-esm.js')
      }
    },
    // Browser-ready ESM, production + minified
    {
      ...commonOptions,
      entry: {
        'redux.browser': 'src/index.ts'
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify('production')
      },
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }),
      minify: true
    },
    {
      ...commonOptions,
      format: 'cjs',
      outDir: './dist/cjs/',
      outExtension: () => ({ js: '.cjs' })
    }
  ]
})
