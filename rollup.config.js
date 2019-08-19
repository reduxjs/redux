import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

export default [
  // CommonJS
  {
    input: 'src/index.ts',
    output: { file: 'lib/redux.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      babel()
    ]
  },

  // ES
  {
    input: 'src/index.ts',
    output: { file: 'es/redux.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      babel()
    ]
  },

  // ES for Browsers
  {
    input: 'src/index.ts',
    output: { file: 'es/redux.mjs', format: 'es', indent: false },
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  },

  // UMD Development
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/redux.js',
      format: 'umd',
      name: 'Redux',
      indent: false
    },
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },

  // UMD Production
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/redux.min.js',
      format: 'umd',
      name: 'Redux',
      indent: false
    },
    plugins: [
      nodeResolve({
        extensions: ['.ts']
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
]
