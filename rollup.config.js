import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const noDeclarationFiles = { compilerOptions: { declaration: false } };

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
      typescript({ useTsconfigDeclarationDir: true }),
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
      typescript({ tsconfigOverride: noDeclarationFiles }),
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
      typescript({ tsconfigOverride: noDeclarationFiles }),
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
      typescript({ tsconfigOverride: noDeclarationFiles }),
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
      typescript({ tsconfigOverride: noDeclarationFiles }),
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
