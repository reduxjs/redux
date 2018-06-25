const { copyFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const { spawnSync } = require('child_process')

const packages = {
  cjs: 'lib/redux.js',
  es: 'es/redux.js',
  umd: 'dist/redux.js',
  'umd-min': 'dist/redux.min.js'
}

const { version } = require('../package.json')
let packageJSON

Object.entries(packages).forEach(([pkgName, source]) => {
  copyFileSync(
    resolve(__dirname, `../${source}`),
    resolve(__dirname, `./${pkgName}/redux.js`)
  )

  packageJSON = require(`./${pkgName}/package.json`)
  packageJSON.version = version
  writeFileSync(
    resolve(__dirname, `./${pkgName}/package.json`),
    JSON.stringify(packageJSON)
  )

  spawnSync('npm', ['publish'], {
    cwd: resolve(__dirname, pkgName),
    stdio: 'inherit'
  })
})
