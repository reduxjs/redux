import nodeResolve from 'rollup-plugin-node-resolve'
import nodeGlobals from 'rollup-plugin-node-globals'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV
const config = {
  input: 'src/index.js',
  plugins: []
}

if (env === 'es' || env === 'cjs') {
  config.output = { format: env, indent: false }
  config.external = ['symbol-observable']
  if (env === 'es') config.paths = { 'symbol-observable': 'https://unpkg.com/symbol-observable?module' }
  config.plugins.push(
    nodeGlobals(),
    babel({
      plugins: ['external-helpers'],
    })
  )
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
    uglify({
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
