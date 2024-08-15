import * as babel from '@babel/core'
import type { Plugin } from 'esbuild'
import { getBuildExtensions } from 'esbuild-extra'
import type { Options } from 'tsup'
import { defineConfig } from 'tsup'
import type { MangleErrorsPluginOptions } from './scripts/mangleErrors.mjs'
import { mangleErrorsPlugin } from './scripts/mangleErrors.mjs'

const tsconfig = 'tsconfig.build.json' satisfies Options['tsconfig']

// Extract error strings, replace them with error codes, and write messages to a file
const mangleErrorsTransform: Plugin = {
  name: mangleErrorsPlugin.name,
  setup(build) {
    const { onTransform } = getBuildExtensions(build, mangleErrorsPlugin.name)

    onTransform({ loaders: ['ts', 'tsx'] }, async args => {
      try {
        const res = await babel.transformAsync(args.code, {
          parserOpts: {
            plugins: ['typescript']
          },
          plugins: [
            [
              mangleErrorsPlugin,
              { minify: false } satisfies MangleErrorsPluginOptions
            ]
          ]
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

export default defineConfig((options): Options[] => {
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
      outExtension: () => ({ js: '.mjs' }), // Add dts: '.d.ts' when egoist/tsup#1053 lands
      dts: true,
      clean: true
    },
    // Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
    {
      ...commonOptions,
      format: ['esm'],
      target: ['es2017'],
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
      format: ['cjs'],
      outDir: './dist/cjs/',
      outExtension: () => ({ js: '.cjs' })
    }
  ]
})
