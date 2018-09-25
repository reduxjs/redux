import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/index.js',
    output: { file: 'lib/redux.js', format: 'cjs', indent: false },
    external: ['symbol-observable'],
    plugins: [
      babel({
        plugins: ['external-helpers']
      })
    ]
  },
  {
    input: 'src/index.js',
    output: { file: 'es/redux.js', format: 'es', indent: false },
    external: ['symbol-observable'],
    plugins: [
      babel({
        env: 'es',
        plugins: ['external-helpers']
      })
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
        env: 'es',
        exclude: 'node_modules/**',
        plugins: ['external-helpers']
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
        env: 'es',
        exclude: 'node_modules/**',
        plugins: ['external-helpers']
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
