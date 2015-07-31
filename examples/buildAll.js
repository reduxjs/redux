/**
 * Runs an ordered set of commands within each of the build directories.
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

var exampleDirs = fs.readdirSync(__dirname).filter((file) => {
  return fs.statSync(path.join(__dirname, file)).isDirectory();
});

// Ordering is important here. `npm install` must come first.
var cmdArgs = [
  { cmd: 'npm', args: ['install'] },
  { cmd: 'webpack', args: ['index.js'] }
];

for (let dir of exampleDirs) {
  let opts = {
    cwd: path.join(__dirname, dir),
    stdio: 'inherit'
  };

  for (let cmdArg of cmdArgs) {
    let result = spawnSync(cmdArg.cmd, cmdArg.args, opts);
    if (result.status !== 0) {
      throw new Error('Building examples exited with non-zero');
    }
  }
}
