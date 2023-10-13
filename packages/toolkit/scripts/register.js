const esbuild = require('esbuild')
const fs = require('fs')
require.extensions['.ts'] = (mod, filename) => {
  const ts = fs.readFileSync(filename, 'utf-8')
  const { code } = esbuild.transformSync(ts, {
    loader: 'ts',
    target: 'es2017',
    format: 'cjs',
  })
  mod._compile(code, filename)
}
