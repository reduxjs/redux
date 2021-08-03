import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const extensions = ['.js']

const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(
  /^[^0-9]*/,
  ''
)

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return (id) => pattern.test(id)
}

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: { file: 'lib/redux.js', format: 'cjs', indent: false },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        plugins: [
          ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
          ['./scripts/mangleErrors.js', { minify: false }],
        ],
        babelHelpers: 'runtime',
      }),
    ],
  },

  // ES
  {
    input: 'src/index.js',
    output: { file: 'es/redux.js', format: 'es', indent: false },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]),
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            { version: babelRuntimeVersion, useESModules: true },
          ],
          ['./scripts/mangleErrors.js', { minify: false }],
        ],
        babelHelpers: 'runtime',
      }),
    ],
  },

  // ES for Browsers
  {
    input: 'src/index.js',
    output: { file: 'es/redux.mjs', format: 'es', indent: false },
    plugins: [
      nodeResolve({
        extensions,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: false,
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        plugins: [['./scripts/mangleErrors.js', { minify: true }]],
        skipPreflightCheck: true,
        babelHelpers: 'bundled',
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // UMD Development
  {
    input: 'src/index.js',
    output: {
      file: 'dist/redux.js',
      format: 'umd',
      name: 'Redux',
      indent: false,
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        plugins: [['./scripts/mangleErrors.js', { minify: false }]],
        babelHelpers: 'bundled',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        preventAssignment: false,
      }),
    ],
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/redux.min.js',
      format: 'umd',
      name: 'Redux',
      indent: false,
    },
    plugins: [
      nodeResolve({
        extensions,
      }),
      babel({
        extensions,
        exclude: 'node_modules/**',
        plugins: [['./scripts/mangleErrors.js', { minify: true }]],
        skipPreflightCheck: true,
        babelHelpers: 'bundled',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: false,
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
]
