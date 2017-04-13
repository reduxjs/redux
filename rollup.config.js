import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV
const config = {
  output: {
    format: 'umd',
    name: 'Redux'
  },
  entry: 'src/index.js',
  plugins: []
}

if (env === 'es' || env === 'cjs') {
  config.format = env
  config.external = [
    'lodash/isPlainObject',
    'lodash-es/isPlainObject',
    'symbol-observable'
  ];
  config.plugins.push(
    babel()
  )
}

if (env === 'development' || env === 'production') {
  config.format = 'umd'
  config.moduleName = 'Redux'
  config.plugins.push(
    nodeResolve({
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**'
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
