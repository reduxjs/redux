/**
 * Pulls the docs folders of the other Redux library repos into `website/external/`
 * so the combined site can build them as extra docs-plugin instances.
 *
 * Usage: node --experimental-strip-types scripts/fetch-external-docs.mts [--force] [--watch] [name...]
 *
 * Per library, in order of precedence:
 *   DOCS_SOURCE_<NAME>  local repo checkout whose listed dirs are copied as-is (for per-PR previews
 *                       and local editing); `optionalLinks` dirs are symlinked instead when present
 *   DOCS_REPO_<NAME>    git URL or local path to clone (default: GitHub)
 *   DOCS_REF_<NAME>     branch or tag to clone (default: master)
 *
 * An existing clone in `external/<name>` is left alone unless `--force` is passed.
 * DOCS_SOURCE copies are always refreshed.
 *
 * `--watch` keeps copying changed files from every DOCS_SOURCE checkout and runs
 * `docusaurus start`, so edits in a library repo show up in the dev server.
 */
import { execFileSync, spawn } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  symlinkSync,
  watch,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface ExternalSource {
  repo: string
  ref: string
  /** Directories to check out, relative to the repo root. The first one is the docs folder. */
  dirs: string[]
  /**
   * Root-level files the site reads. Sparse checkout always includes files at
   * the repo root, so these only matter for the DOCS_SOURCE copy path.
   */
  files?: string[]
  /**
   * DOCS_SOURCE only: directories symlinked (not copied) from the local checkout
   * when they exist. Linking keeps module resolution inside the source repo, so
   * imports from these files find that repo's node_modules.
   */
  optionalLinks?: string[]
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
    ],
    // src/pages/toolkit/errors.tsx
    files: ['errors.json'],
    // A built package in the source checkout makes RTK's docs/tsconfig.json
    // `paths` resolve, so code blocks type-check against that branch. Without
    // it they fall back to the published @reduxjs/toolkit in website/node_modules.
    optionalLinks: ['packages/toolkit/dist'],
  },
  reselect: {
    repo: 'https://github.com/reduxjs/reselect.git',
    ref: 'master',
    // The TS/JS example tabs are committed into the .mdx files, so Reselect's
    // `docs:examples` script does not need to run here.
    dirs: ['docs'],
  },
}

const websiteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const externalDir = join(websiteDir, 'external')

const args = process.argv.slice(2)
const force = args.includes('--force')
const watchMode = args.includes('--watch')
const requested = args.filter(arg => !arg.startsWith('--'))
const names = requested.length > 0 ? requested : Object.keys(sources)

function log(name: string, message: string) {
  console.log(`[external-docs] ${name}: ${message}`)
}

function envKey(name: string, suffix: string) {
  return `DOCS_${suffix}_${name.toUpperCase().replaceAll('-', '_')}`
}

function git(cwd: string, ...gitArgs: string[]) {
  execFileSync('git', gitArgs, { cwd, stdio: 'inherit' })
}

function copyLocalSource(name: string, source: ExternalSource, from: string, target: string) {
  for (const entry of [...source.dirs, ...(source.files ?? [])]) {
    log(name, `copying ${join(from, entry)}`)
    cpSync(join(from, entry), join(target, entry), { recursive: true })
  }
  for (const entry of source.optionalLinks ?? []) {
    const linkSource = join(from, entry)
    if (!existsSync(linkSource)) {
      log(name, `${linkSource} not found, skipping link`)
      continue
    }
    log(name, `linking ${linkSource}`)
    mkdirSync(dirname(join(target, entry)), { recursive: true })
    symlinkSync(linkSource, join(target, entry), 'junction')
  }
}

function cloneSource(name: string, source: ExternalSource, target: string) {
  const repo = process.env[envKey(name, 'REPO')] ?? source.repo
  const ref = process.env[envKey(name, 'REF')] ?? source.ref
  for (let attempt = 1; ; attempt++) {
    log(name, `cloning ${repo}@${ref} (${source.dirs.join(', ')} only)`)
    try {
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
      break
    } catch (error) {
      // A half-populated clone would be skipped by the next run without --force
      rmSync(target, { recursive: true, force: true })
      if (attempt === 2) throw error
      log(name, 'clone failed, retrying in 5 seconds')
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000)
    }
  }
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: target,
    encoding: 'utf8',
  }).trim()
  log(name, `checked out ${commit}`)
}

function watchLocalSource(name: string, source: ExternalSource, from: string, target: string) {
  const pending = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined

  function sync() {
    for (const changed of pending) {
      const dest = join(target, relative(from, changed))
      try {
        if (existsSync(changed)) {
          mkdirSync(dirname(dest), { recursive: true })
          cpSync(changed, dest, { recursive: true })
        } else {
          rmSync(dest, { recursive: true, force: true })
        }
        log(name, `synced ${relative(from, changed)}`)
      } catch (error) {
        log(name, `failed to sync ${relative(from, changed)}: ${error}`)
      }
    }
    pending.clear()
  }

  for (const entry of [...source.dirs, ...(source.files ?? [])]) {
    const root = join(from, entry)
    const isDir = statSync(root).isDirectory()
    watch(root, { recursive: isDir }, (_event, file) => {
      pending.add(isDir && file ? join(root, file) : root)
      clearTimeout(timer)
      // Editors often save by writing a temp file and renaming it
      timer = setTimeout(sync, 100)
    })
  }
  log(name, `watching ${from}`)
}

const watched: Array<() => void> = []

for (const name of names) {
  const source = sources[name]
  if (!source) {
    console.error(`Unknown external docs source "${name}"`)
    process.exit(1)
  }

  const target = join(externalDir, name)
  const localSource = process.env[envKey(name, 'SOURCE')]
  if (existsSync(target)) {
    if (!force && !localSource) {
      log(name, `${target} exists, skipping (use --force to refetch)`)
      continue
    }
    rmSync(target, { recursive: true, force: true })
  }
  mkdirSync(externalDir, { recursive: true })

  if (localSource) {
    const from = resolve(localSource)
    copyLocalSource(name, source, from, target)
    watched.push(() => watchLocalSource(name, source, from, target))
  } else {
    cloneSource(name, source, target)
  }
}

if (watchMode) {
  for (const startWatching of watched) startWatching()
  const server = spawn('pnpm', ['start'], {
    cwd: websiteDir,
    stdio: 'inherit',
    shell: true,
  })
  server.on('exit', code => process.exit(code ?? 0))
}
