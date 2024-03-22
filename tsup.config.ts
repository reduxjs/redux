import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

import * as babel from '@babel/core'
import type { Plugin } from 'esbuild'
import { getBuildExtensions } from 'esbuild-extra'

// Extract error strings, replace them with error codes, and write messages to a file
const mangleErrorsTransform: Plugin = {
  name: 'mangle-errors-plugin',
  setup(build) {
    const { onTransform } = getBuildExtensions(build, 'mangle-errors-plugin')

    onTransform({ loaders: ['ts', 'tsx'] }, async args => {
      const res = babel.transformSync(args.code, {
        parserOpts: {
          plugins: ['typescript']
        },
        plugins: [['./scripts/mangleErrors.cjs', { minify: false }]]
      })!
      return {
        code: res.code!,
        map: res.map!
      }
    })
  }
}

export default defineConfig(options => {
  const commonOptions: Partial<Options> = {
    entry: {
      redux: 'src/index.ts'
    },
    esbuildPlugins: [mangleErrorsTransform],
    sourcemap: true,
    ...options
  }

  return [
    // Standard ESM, embedded `process.env.NODE_ENV` checks
    {
      ...commonOptions,
      format: ['esm'],
      outExtension: () => ({ js: '.mjs' }), // Add dts: '.d.ts' when egoist/tsup#1053 lands
      dts: true,
      clean: true
    },
    // Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
    {
      ...commonOptions,
      format: ['esm'],
      target: 'es2017',
      dts: false,
      outExtension: () => ({ js: '.js' }),
      entry: { 'redux.legacy-esm': 'src/index.ts' }
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
