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
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
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
   * TEMPORARY local rewrites applied after fetching, so the combined site builds
   * before the matching upstream docs changes land. Each patch should go away
   * once the library repo has been updated.
   */
  patch?: (target: string) => void
}

function walk(dir: string, matches: (file: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = join(dir, entry.name)
    return entry.isDirectory() ? walk(file, matches) : matches(file) ? [file] : []
  })
}

function rewriteFile(file: string, rewrite: (content: string) => string) {
  const before = readFileSync(file, 'utf8')
  const after = rewrite(before)
  if (after !== before) {
    writeFileSync(file, after)
    console.log(`[external-docs] patched ${file}`)
  }
}

function patchReselect(target: string) {
  const docsDir = join(target, 'website', 'docs')
  const staticImgDir = join(target, 'website', 'static', 'img')
  for (const file of walk(docsDir, f => f.endsWith('.mdx'))) {
    rewriteFile(file, content =>
      content
        // `@site/static/img/...` resolves against this site, not Reselect's.
        // Upstream fix: reference the images relative to the doc file.
        .replaceAll('@site/static/img/', `${relative(dirname(file), staticImgDir).replaceAll('\\', '/')}/`)
        // Site-absolute markdown links and `<Link to='/...'>` assume Reselect
        // owns the URL root. Upstream fix: use relative links (`./api/weakMapMemoize`).
        .replaceAll(/\]\(\/(api|introduction|usage)\//g, '](/reselect/$1/')
        .replaceAll(/(<Link to=['"])\/(api|introduction|usage)\//g, '$1/reselect/$2/'),
    )
  }
  // InternalLinks hard-codes site-absolute `to="/..."` paths.
  // Upstream fix: derive the prefix from the docs plugin's routeBasePath.
  rewriteFile(join(target, 'website', 'src', 'components', 'InternalLinks.tsx'), content =>
    content.replaceAll('to="/', 'to="/reselect/'),
  )
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
    // src/pages/toolkit/errors.tsx
    files: ['errors.json'],
  },
  reselect: {
    repo: 'https://github.com/reduxjs/reselect.git',
    ref: 'master',
    dirs: [
      // Reselect keeps its docs inside website/. The TS/JS example tabs are
      // committed into the .mdx files, so compileExamples.ts does not need to run.
      'website/docs',
      // docs import these via @site/src/components/*; aliased in docusaurus.config.ts
      'website/src/components',
      'website/static/img',
    ],
    patch: patchReselect,
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
    for (const entry of [...source.dirs, ...(source.files ?? [])]) {
      const from = join(resolve(localSource), entry)
      console.log(`[external-docs] ${name}: copying ${from}`)
      cpSync(from, join(target, entry), { recursive: true })
    }
    source.patch?.(target)
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
  source.patch?.(target)
}
