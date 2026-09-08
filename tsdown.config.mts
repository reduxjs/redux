import * as babel from '@babel/core'
import type { Plugin } from 'rolldown'
import type { UserConfig } from 'tsdown'
import { defineConfig } from 'tsdown'
import type { MangleErrorsPluginOptions } from './scripts/mangleErrors.mjs'
import { mangleErrorsPlugin } from './scripts/mangleErrors.mjs'

// Extract error strings, replace them with error codes, and write messages to a file
const mangleErrorsTransform: Plugin = {
  name: mangleErrorsPlugin.name,
  transform: {
    filter: { id: /\.tsx?$/ },
    async handler(code, id) {
      try {
        const res = await babel.transformAsync(code, {
          filename: id,
          babelrc: false,
          configFile: false,
          sourceMaps: true,
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
    }
  }
}

export default defineConfig((options): UserConfig[] => {
  const commonOptions = {
    entry: {
      redux: 'src/index.ts'
    },
    plugins: [mangleErrorsTransform],
    sourcemap: true,
    // `pnpm clean` already removes `dist/`; letting each of the builds clean
    // would race them against each other.
    clean: false,
    hash: false,
    report: false,
    target: ['esnext'],
    tsconfig: 'tsconfig.build.json',
    dts: false,
    // esbuild dropped JSDoc from the bundles; Rolldown keeps it by default,
    // which inflates every output file several times over. Legal and
    // annotation comments stay so `@__PURE__` survives for consumers.
    outputOptions: {
      comments: { jsdoc: false }
    },
    ...options
  } satisfies UserConfig

  return [
    // Standard ESM, embedded `process.env.NODE_ENV` checks
    {
      ...commonOptions,
      name: 'Modern ESM',
      format: ['esm'],
      outExtensions: () => ({ js: '.mjs' })
    },
    // Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
    {
      ...commonOptions,
      name: 'Legacy ESM, Webpack 4',
      entry: { 'redux.legacy-esm': 'src/index.ts' },
      format: ['esm'],
      target: ['es2017'],
      outExtensions: () => ({ js: '.js' })
    },
    // Browser-ready ESM, production + minified
    {
      ...commonOptions,
      name: 'Browser-ready ESM',
      entry: {
        'redux.browser': 'src/index.ts'
      },
      platform: 'browser',
      env: {
        NODE_ENV: 'production'
      },
      format: ['esm'],
      outExtensions: () => ({ js: '.mjs' }),
      minify: true
    },
    {
      ...commonOptions,
      name: 'CJS',
      format: ['cjs'],
      outDir: './dist/cjs/',
      outExtensions: () => ({ js: '.cjs' })
    },
    {
      ...commonOptions,
      name: 'Type definitions',
      format: ['esm'],
      dts: { emitDtsOnly: true, sourcemap: false },
      outExtensions: () => ({ dts: '.d.mts' })
    }
  ]
})
