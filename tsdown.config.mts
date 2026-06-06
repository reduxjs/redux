import * as babel from '@babel/core'
import * as path from 'node:path'
import type { InlineConfig, Rolldown, UserConfig } from 'tsdown'
import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }
import type {
  MangleErrorsPluginOptions,
  Simplify
} from './scripts/mangleErrors.mjs'
import { mangleErrorsPlugin } from './scripts/mangleErrors.mjs'

/**
 * @internal
 */
const cwd = import.meta.dirname

/**
 * @internal
 */
const packageJsonPath = path.join(cwd, 'package.json')

/**
 * @internal
 */
const sourceRootDirectory = path.join(cwd, 'src')

/**
 * @internal
 */
const RE_NODE_MODULES = /[\\/]node_modules[\\/]/

/**
 * @internal
 */
const RE_TS = /\.([cm]?)tsx?$/

/**
 * @internal
 */
const RE_DTS = /\.d\.([cm]?)ts$/

/**
 * Extract error strings, replace them with error codes, and write messages to
 * a file.
 *
 * @param [mangleErrorsPluginOptions={}] - Options forwarded to the {@linkcode mangleErrorsPlugin()}. Supported options include {@linkcode MangleErrorsPluginOptions.minify | minify} to indicate whether error messages should be further minified.
 * @returns A {@linkcode Rolldown.Plugin | Rolldown plugin} that applies the Babel transformation to TypeScript/TSX sources matching the configured filter and returns transformed code and source maps.
 * @internal
 */
const mangleErrorsTransform = (
  mangleErrorsPluginOptions: MangleErrorsPluginOptions = {}
): Rolldown.Plugin => {
  const { minify = false } = mangleErrorsPluginOptions

  return {
    name: `${packageJson.name}:mangle-errors`,
    transform: {
      filter: {
        code: {
          include: ['throw']
        },
        id: {
          exclude: [RE_DTS, RE_NODE_MODULES],
          include: [RE_TS]
        },
        moduleType: {
          include: ['ts', 'tsx']
        }
      },

      async handler(code, id, meta) {
        try {
          const res = await babel.transformAsync(code, {
            ast: true,
            cwd,
            filename: id,
            filenameRelative: path.relative(sourceRootDirectory, id),
            parserOpts: {
              createParenthesizedExpressions: true,
              errorRecovery: true,
              plugins: [['typescript', { dts: false }], 'jsx'],
              ranges: true,
              sourceFilename: id,
              sourceType: 'module'
            },
            plugins: [
              [
                mangleErrorsPlugin,
                { minify } satisfies MangleErrorsPluginOptions
              ]
            ],
            sourceFileName: id,
            sourceMaps: 'both',
            sourceType: 'module'
          })

          if (res == null) {
            throw new Error('Babel transformAsync returned null')
          }

          return {
            code: res.code ?? code,
            map: {
              ...res.map,
              mappings: res.map?.mappings ?? '',
              names: [...(res.map?.names ?? [])],
              sources: [...(res.map?.sources ?? [])],
              sourcesContent: [...(res.map?.sourcesContent ?? [])],
              x_google_ignoreList: [...(res.map?.ignoreList ?? [])]
            },
            meta,
            moduleSideEffects: false,
            moduleType: meta.moduleType,
            packageJsonPath
          }
        } catch (err) {
          console.error('Babel mangleErrors error: ', err)
          return null
        }
      }
    }
  }
}

/**
 * @internal
 */
type GenerateBundleObjectHook = Simplify<
  Pick<
    Extract<
      NonNullable<Rolldown.Plugin['generateBundle']>,
      { handler: unknown }
    >,
    'order'
  >
>

/**
 * A {@linkcode Rolldown.Plugin | Rolldown plugin} to remove generated CommonJS
 * (`.cjs`) JavaScript outputs from DTS-only builds. When generating type
 * definition builds we may still emit stray `.cjs` files; this plugin deletes
 * those entries from the generated bundle to ensure only declaration artifacts
 * remain.
 *
 * @param [pluginOptions={}] - Options forwarded to the plugin.
 * @returns A {@linkcode Rolldown.Plugin | Rolldown plugin} that prunes `.cjs` files from the bundle.
 * @internal
 */
const removeCJSOutputsFromDTSBuilds = (
  pluginOptions: GenerateBundleObjectHook = {}
): Rolldown.Plugin => {
  const { order = null } = pluginOptions

  return {
    name: `${packageJson.name}:remove-cjs-outputs-from-dts-builds`,
    generateBundle: {
      order,
      handler(outputOptions, bundle, isWrite): void {
        if (outputOptions.format === 'cjs' && isWrite) {
          Object.values(bundle).forEach(outputChunk => {
            if (
              outputChunk.type === 'chunk' &&
              outputChunk.isEntry &&
              !RE_DTS.test(outputChunk.fileName)
            ) {
              delete bundle[outputChunk.fileName]
              delete bundle[`${outputChunk.fileName}.map`]
            }
          })
        }
      }
    }
  }
}

export default defineConfig(cliOptions => {
  const commonOptions = {
    checks: {
      circularDependency: true
    },
    cjsDefault: false,
    clean: false,
    cwd,
    deps: {
      onlyBundle: []
    },
    devtools: {
      clean: true,
      enabled: true
    },
    dts: false,
    entry: {
      redux: 'src/index.ts'
    },
    failOnWarn: true,
    fixedExtension: false,
    format: ['esm'],
    hash: false,
    inputOptions: options => {
      const plugins = options.plugins
        ? Array.isArray(options.plugins)
          ? options.plugins.flat()
          : [options.plugins]
        : []

      return {
        ...options,
        experimental: {
          ...options.experimental,
          lazyBarrel: true,
          nativeMagicString: true
        },
        plugins: [...plugins, mangleErrorsTransform()],
        transform: {
          ...options.transform,
          typescript: {
            ...options.transform?.typescript,
            optimizeConstEnums: true,
            optimizeEnums: true
          }
        }
      } as const satisfies Rolldown.InputOptions
    },
    minify: false,
    name: packageJson.name,
    nodeProtocol: true,
    outDir: 'dist',
    outExtensions: ({ format, options }) => ({
      dts: format === 'es' ? '.d.mts' : '.d.ts',
      js:
        format === 'es' && options.transform?.target != null
          ? (Array.isArray(options.transform?.target) &&
              options.transform?.target.includes('es2017')) ||
            options.transform?.target === 'es2017'
            ? '.legacy-esm.js'
            : `${options.platform === 'browser' ? '.browser' : ''}.mjs`
          : '.cjs'
    }),
    outputOptions: (options, format, context) =>
      ({
        ...options,
        codeSplitting: false,
        comments: {
          annotation: true,
          jsdoc: false,
          legal: true
        },
        ...(format === 'cjs' && !context.cjsDts
          ? {
              externalLiveBindings: false
            }
          : {}),
        strict: true
      }) as const satisfies Rolldown.OutputOptions,
    platform: 'node',
    root: sourceRootDirectory,
    shims: true,
    sourcemap: true,
    target: ['esnext'],
    treeshake: {
      moduleSideEffects: false
    },
    tsconfig: path.join(cwd, 'tsconfig.build.json'),
    ...cliOptions
  } as const satisfies InlineConfig

  return [
    // Standard ESM, embedded `process.env.NODE_ENV` checks
    {
      ...commonOptions,
      name: `${packageJson.name}-Modern-ESM`
    },
    // Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
    // and optional chaining compiled away
    {
      ...commonOptions,
      name: `${packageJson.name}-Legacy-ESM`,
      target: ['es2017']
    },
    // Browser-ready ESM, production + minified
    // Meant to be served up via CDNs like `unpkg`.
    {
      ...commonOptions,
      define: {
        window: JSON.stringify('window')
      },
      env: {
        NODE_ENV: 'production'
      },
      minify: true,
      name: `${packageJson.name}-Browser-ESM`,
      platform: 'browser'
    },
    {
      ...commonOptions,
      entry: {
        'cjs/redux': 'src/index.ts'
      },
      format: ['cjs'],
      name: `${packageJson.name}-CJS`
    },
    {
      ...commonOptions,
      dts: {
        build: false,
        cjsDefault: false,
        cwd: commonOptions.cwd,
        dtsInput: false,
        eager: false,
        emitDtsOnly: true,
        emitJs: false,
        enabled: true,
        generator: 'tsc',
        incremental: false,
        logger: console,
        newContext: false,
        oxc: {},
        parallel: false,
        resolver: 'tsc',
        sideEffects: false,
        sourcemap: true,
        tsconfig: commonOptions.tsconfig,
        tsgo: {},
        vue: false
      },
      format: ['cjs', 'esm'],
      name: `${packageJson.name}-Type-Definitions`,
      outputOptions: (options, format, context) => {
        const plugins = options.plugins
          ? Array.isArray(options.plugins)
            ? options.plugins.flat()
            : [options.plugins]
          : []

        return {
          ...options,
          codeSplitting: false,
          comments: {
            annotation: true,
            jsdoc: true,
            legal: true
          },
          plugins: [
            ...plugins,
            ...(format === 'cjs' && !context.cjsDts
              ? [removeCJSOutputsFromDTSBuilds()]
              : [])
          ],
          strict: true
        } as const satisfies Rolldown.OutputOptions
      }
    }
  ] as const satisfies UserConfig[]
})
