/**
 * Runs an ordered set of commands within each of the build directories.
 */

var fs = require('fs')
var path = require('path')
var { spawnSync } = require('child_process')

var exampleDirs = fs.readdirSync(__dirname).filter((file) => {
  return fs.statSync(path.join(__dirname, file)).isDirectory()
})

// Ordering is important here. `npm install` must come first.
var cmdArgs = [
  { cmd: 'npm', args: [ 'install' ] },
  { cmd: 'npm', args: [ 'test' ] }
]

for (const dir of exampleDirs) {
  for (const cmdArg of cmdArgs) {
    // declare opts in this scope to avoid https://github.com/joyent/node/issues/9158
    const opts = {
      cwd: path.join(__dirname, dir),
      stdio: 'inherit'
    }

    let result = {}
    if (process.platform === 'win32') {
      result = spawnSync(cmdArg.cmd + '.cmd', cmdArg.args, opts)
    } else {
      result = spawnSync(cmdArg.cmd, cmdArg.args, opts)
    }
    if (result.status !== 0) {
      throw new Error('Building examples exited with non-zero')
    }
  }
}
