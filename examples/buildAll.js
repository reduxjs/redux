/**
 * Runs an ordered set of commands within each of the build directories.
 */

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

var exampleDirs = fs.readdirSync(__dirname).filter((file) => {
  return fs.statSync(path.join(__dirname, file)).isDirectory()
})

for (const dir of exampleDirs) {
  // declare opts in this scope to avoid https://github.com/joyent/node/issues/9158
  const opts = {
    cwd: path.join(__dirname, dir),
    stdio: 'inherit'
  }

  let result = {}
  if (process.platform === 'win32') {
    result = spawnSync('npm.cmd', [ 'install' ], opts)
  } else {
    result = spawnSync('npm', [ 'install' ], opts)
  }
  if (result.status !== 0) {
    throw new Error('Building examples exited with non-zero')
  }
}
