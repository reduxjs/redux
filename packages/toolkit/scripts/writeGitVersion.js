const path = require('path')
const fs = require('fs')

const gitRev = process.argv[2]

const packagePath = path.join(__dirname, '../package.json')
const pkg = require(packagePath)

pkg.version = `${pkg.version}-${gitRev}`
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
