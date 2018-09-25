import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    output: { file: 'lib/redux.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      babel()
    ]
  },
  {
    input: 'src/index.js',
    output: { file: 'es/redux.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      babel()
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/redux.js',
      format: 'umd',
      name: 'Redux',
      indent: false
    },
    plugins: [
      nodeResolve({
        jsnext: true
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/redux.min.js',
      format: 'umd',
      name: 'Redux',
      indent: false
    },
    plugins: [
      nodeResolve({
        jsnext: true
      }),
      babel({
        exclude: 'node_modules/**',
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
