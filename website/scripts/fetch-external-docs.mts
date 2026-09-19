/**
 * Pulls the docs folders of the other Redux library repos into `website/external/`
 * so the combined site can build them as extra docs-plugin instances.
 *
 * Usage: node --experimental-strip-types scripts/fetch-external-docs.ts [--force] [name...]
 *
 * Per library, in order of precedence:
 *   DOCS_SOURCE_<NAME>  local repo checkout whose listed dirs are copied as-is (for per-PR previews)
 *   DOCS_REPO_<NAME>    git URL or local path to clone (default: GitHub)
 *   DOCS_REF_<NAME>     branch or tag to clone (default: master)
 *
 * An existing `external/<name>` is left alone unless `--force` is passed.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface ExternalSource {
  repo: string
  ref: string
  /** Directories to check out, relative to the repo root. The first one is the docs folder. */
  dirs: string[]
}

const sources: Record<string, ExternalSource> = {
  'react-redux': {
    repo: 'https://github.com/reduxjs/react-redux.git',
    ref: 'master',
    dirs: ['docs'],
  },
  'redux-toolkit': {
    repo: 'https://github.com/reduxjs/redux-toolkit.git',
    ref: 'master',
    dirs: [
      'docs',
      // linkDocblocks reads doc comments straight from the library source
      'packages/toolkit/src',
      // images referenced from docs as /img/usage/...
      'website/static/img/usage',
    ],
  },
}

const websiteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const externalDir = join(websiteDir, 'external')

const args = process.argv.slice(2)
const force = args.includes('--force')
const requested = args.filter(arg => !arg.startsWith('--'))
const names = requested.length > 0 ? requested : Object.keys(sources)

function envKey(name: string, suffix: string) {
  return `DOCS_${suffix}_${name.toUpperCase().replaceAll('-', '_')}`
}

function git(cwd: string, ...gitArgs: string[]) {
  execFileSync('git', gitArgs, { cwd, stdio: 'inherit' })
}

for (const name of names) {
  const source = sources[name]
  if (!source) {
    console.error(`Unknown external docs source "${name}"`)
    process.exit(1)
  }

  const target = join(externalDir, name)
  if (existsSync(target)) {
    if (!force) {
      console.log(`[external-docs] ${name}: ${target} exists, skipping (use --force to refetch)`)
      continue
    }
    rmSync(target, { recursive: true, force: true })
  }
  mkdirSync(externalDir, { recursive: true })

  const localSource = process.env[envKey(name, 'SOURCE')]
  if (localSource) {
    for (const dir of source.dirs) {
      const from = join(resolve(localSource), dir)
      console.log(`[external-docs] ${name}: copying ${from}`)
      cpSync(from, join(target, dir), { recursive: true })
    }
    continue
  }

  const repo = process.env[envKey(name, 'REPO')] ?? source.repo
  const ref = process.env[envKey(name, 'REF')] ?? source.ref
  console.log(`[external-docs] ${name}: cloning ${repo}@${ref} (${source.dirs.join(', ')} only)`)
  git(
    externalDir,
    'clone',
    '--depth',
    '1',
    '--filter=blob:none',
    '--sparse',
    '--branch',
    ref,
    repo,
    name,
  )
  git(target, 'sparse-checkout', 'set', ...source.dirs)
}
