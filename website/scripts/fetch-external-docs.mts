/**
 * Pulls the docs folders of the other Redux library repos into `website/external/`
 * so the combined site can build them as extra docs-plugin instances.
 *
 * Usage: node --experimental-strip-types scripts/fetch-external-docs.ts [--force] [name...]
 *
 * Per library, in order of precedence:
 *   DOCS_SOURCE_<NAME>  local directory whose `<docsDir>` is copied as-is (for per-PR previews)
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
  docsDir: string
}

const sources: Record<string, ExternalSource> = {
  'react-redux': {
    repo: 'https://github.com/reduxjs/react-redux.git',
    ref: 'master',
    docsDir: 'docs',
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
    const from = join(resolve(localSource), source.docsDir)
    console.log(`[external-docs] ${name}: copying ${from}`)
    cpSync(from, join(target, source.docsDir), { recursive: true })
    continue
  }

  const repo = process.env[envKey(name, 'REPO')] ?? source.repo
  const ref = process.env[envKey(name, 'REF')] ?? source.ref
  console.log(`[external-docs] ${name}: cloning ${repo}@${ref} (${source.docsDir} only)`)
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
  git(target, 'sparse-checkout', 'set', source.docsDir)
}
