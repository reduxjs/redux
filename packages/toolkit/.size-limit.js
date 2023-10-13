const webpack = require('webpack')
let { join } = require('path')

const suffixes = ['cjs.production.min.js', 'esm.js']

function withRtkPath(suffix) {
  return (config) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@reduxjs\/toolkit\/query\/react/,
        join(__dirname, `query/react`)
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@reduxjs\/toolkit\/query/,
        join(__dirname, `query`)
      ),
      new webpack.NormalModuleReplacementPlugin(
        /@reduxjs\/toolkit/,
        join(__dirname)
      ),
      new webpack.NormalModuleReplacementPlugin(
        /rtk-query-react.esm.js/,
        (r) => {
          const old = r.request
          r.request = r.request.replace(
            /rtk-query-react.esm.js$/,
            `rtk-query-react.${suffix}`
          )
          // console.log(old, '=>', r.request)
        }
      ),
      new webpack.NormalModuleReplacementPlugin(/rtk-query.esm.js/, (r) => {
        const old = r.request
        r.request = r.request.replace(
          /rtk-query.esm.js$/,
          `rtk-query.${suffix}`
        )
        // console.log(old, '=>', r.request)
      }),
      new webpack.NormalModuleReplacementPlugin(
        /redux-toolkit.esm.js$/,
        (r) => {
          const old = r.request
          r.request = r.request.replace(
            /redux-toolkit.esm.js$/,
            `redux-toolkit.${suffix}`
          )
          // console.log(old, '=>', r.request)
        }
      )
    )
    if (suffix === 'cjs.production.min.js') {
      config.resolve.mainFields = ['main', 'module']
    }
    config.optimization.nodeEnv = 'production'
    return config
  }
}

const ignoreAll = [
  '@reduxjs/toolkit',
  '@reduxjs/toolkit/query',
  'immer',
  'redux',
  'reselect',
  'redux-thunk',
]

module.exports = [
  {
    name: `1. entry point: @reduxjs/toolkit`,
    path: 'dist/redux-toolkit.esm.js',
  },
  {
    name: `1. entry point: @reduxjs/toolkit/query`,
    path: 'dist/query/rtk-query.esm.js',
  },
  {
    name: `1. entry point: @reduxjs/toolkit/query/react`,
    path: 'dist/query/react/rtk-query-react.esm.js',
  },
  {
    name: `2. entry point: @reduxjs/toolkit (without dependencies)`,
    path: 'dist/redux-toolkit.esm.js',
    ignore: ignoreAll,
  },
  {
    name: `2. entry point: @reduxjs/toolkit/query (without dependencies)`,
    path: 'dist/query/rtk-query.esm.js',
    ignore: ignoreAll,
  },
  {
    name: `2. entry point: @reduxjs/toolkit/query/react (without dependencies)`,
    path: 'dist/query/react/rtk-query-react.esm.js',
    ignore: ignoreAll,
  },
]
  .flatMap((e) =>
    suffixes.map((suffix) => ({
      ...e,
      name: e.name + ` (${suffix})`,
      modifyWebpackConfig: withRtkPath(suffix),
    }))
  )
  .concat(
    ...[
      {
        name: `3. createSlice`,
        import: { '@reduxjs/toolkit': '{ createSlice }' },
      },
      {
        name: `3. createEntityAdapter`,
        import: { '@reduxjs/toolkit': '{ createEntityAdapter }' },
      },
      {
        name: `3. configureStore`,
        import: { '@reduxjs/toolkit': '{ configureStore }' },
      },
      {
        name: `3. createApi`,
        import: { '@reduxjs/toolkit/query': '{ createApi }' },
      },
      {
        name: `3. createApi (react)`,
        import: { '@reduxjs/toolkit/query/react': '{ createApi }' },
      },
      {
        name: `3. fetchBaseQuery`,
        import: { '@reduxjs/toolkit/query': '{ fetchBaseQuery }' },
      },
      {
        name: `3. setupListeners`,
        import: { '@reduxjs/toolkit/query': '{ setupListeners }' },
      },
      {
        name: `3. ApiProvider`,
        import: { '@reduxjs/toolkit/query/react': '{ ApiProvider }' },
      },
    ].map((e) => ({
      ...e,
      name: e.name + ` (esm.js)`,
      modifyWebpackConfig: withRtkPath('esm.js'),
    }))
  )
