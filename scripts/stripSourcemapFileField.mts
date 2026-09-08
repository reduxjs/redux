import fs from 'node:fs/promises'
import path from 'node:path'

const distDir = path.join(import.meta.dirname, '..', 'dist')

/**
 * Removes the optional `file` field from every emitted sourcemap.
 *
 * esbuild (tsup) omitted this field; Rolldown (tsdown) emits it. When it is
 * present, bundlers such as Next/Turbopack chain through our sourcemaps and
 * report the original `src/*.ts` files as the modules they bundled, instead of
 * the published artifact (`dist/redux.mjs` and friends).
 *
 * RTK's `examples/publish-ci/*` (which the `test-published-artifact` CI job
 * runs) exists to record which of our several published builds each bundler
 * actually resolves. That signal only survives if the artifact stays visible
 * in the consuming bundler's output, so we drop the field rather than lose the
 * ability to detect `exports`-map regressions.
 *
 * The field is optional per the source map spec, and every other field
 * (`sources`, `sourcesContent`, `mappings`, `names`) is left untouched, so
 * debugging into Redux still resolves to the original TypeScript.
 */
async function main() {
  const sourcemapPaths = (
    await fs.readdir(distDir, { recursive: true, withFileTypes: true })
  )
    .filter(entry => entry.isFile() && entry.name.endsWith('.map'))
    .map(entry => path.join(entry.parentPath, entry.name))

  let strippedCount = 0

  await Promise.all(
    sourcemapPaths.map(async sourcemapPath => {
      const sourcemap = JSON.parse(
        await fs.readFile(sourcemapPath, { encoding: 'utf-8' })
      )

      if (!('file' in sourcemap)) {
        return
      }

      delete sourcemap.file

      await fs.writeFile(sourcemapPath, JSON.stringify(sourcemap), {
        encoding: 'utf-8'
      })

      strippedCount++
    })
  )

  console.log(
    `Stripped \`file\` from ${strippedCount} of ${sourcemapPaths.length} sourcemaps.`
  )
}

void main()
