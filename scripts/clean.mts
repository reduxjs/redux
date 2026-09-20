import { rmSync } from 'node:fs'

for (const path of ['dist', 'coverage']) {
  rmSync(path, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 100
  })
}
