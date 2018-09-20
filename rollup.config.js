import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

const nodeEnv = process.env.NODE_ENV
const env = nodeEnv === 'es-browser' ? 'es' : nodeEnv;
const config = {
  input: 'src/index.js',
  plugins: []
}

if (env === 'es' || env === 'cjs') {
  config.output = { format: env, indent: false }

  if (nodeEnv === 'es-browser') {
    config.plugins.push(
      replace({
        'process.env.NODE_ENV': '"production"'
      }),
      nodeResolve({
        jsnext: true
      })
    )
  } else {
    config.external = ['symbol-observable']
    config.plugins.push(
      babel({
        plugins: ['external-helpers'],
      })
    )
  }
}

if (env === 'development' || env === 'production') {
  config.output = { format: 'umd', name: 'Redux', indent: false }
  config.plugins.push(
    nodeResolve({
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  )
}

if (env === 'production') {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
