import type { VirtualFiles } from './plugin.js';
import type { FormatConfig } from 'oxfmt';
import { makeModuleSynchronized } from 'make-synchronized';
import { dirname, join, parse } from 'node:path';
import { readFileSync } from 'node:fs';

/**
 * `oxfmt`'s `format` is async because it crosses a napi boundary, but the
 * remark pipeline that drives post-processing is synchronous. `make-synchronized`
 * runs it in a worker and blocks with `Atomics.wait` — the same technique
 * `@prettier/sync` used to use for Prettier.
 */
const oxfmt: typeof import('oxfmt') = makeModuleSynchronized('oxfmt');

const CONFIG_FILENAMES = ['.oxfmtrc.json', '.oxfmtrc', 'oxfmt.json'];

export function defaultPostProcessTs(
  files: VirtualFiles,
  parentFile?: string
): VirtualFiles {
  return fromEntries(
    Object.entries(files).map(([name, file]) => {
      const prettyCode = formatCode(file.code, name, parentFile || name);

      return [
        name,
        {
          ...file,
          code: prettyCode.trim(),
        },
      ];
    })
  );
}

export function defaultPostProcessTranspiledJs(
  files: VirtualFiles,
  parentFile?: string
): VirtualFiles {
  return fromEntries(
    Object.entries(files).map(([name, file]) => {
      const mangledCode = file.code.replace(
        /(\n\s*|)\/\/ (@ts-ignore|@ts-expect-error).*$/gm,
        ''
      );
      const prettyCode = formatCode(mangledCode, name, parentFile || name);

      return [
        name.replace(/.t(sx?)$/, '.j$1'),
        {
          ...file,
          code: prettyCode.trim(),
        },
      ];
    })
  );
}

const configCache = new Map<string, FormatConfig>();

/**
 * Walk up from `parentFile` looking for an oxfmt config, so code blocks are
 * formatted in the same style as the repository they are documented in.
 *
 * Unlike the previous Prettier-based implementation, a missing config is not a
 * reason to skip formatting — `oxfmt`'s defaults are applied instead. Emitting
 * unformatted compiler output into the docs is worse than formatting it with
 * defaults, and the old behaviour failed silently apart from a log line.
 */
function resolveFormatConfig(parentFile: string): FormatConfig {
  let dir = dirname(parentFile);
  const cached = configCache.get(dir);
  if (cached) return cached;

  const visited: Array<string> = [];
  const { root } = parse(dir);

  for (;;) {
    visited.push(dir);
    const hit = configCache.get(dir);
    if (hit) {
      for (const seen of visited) configCache.set(seen, hit);
      return hit;
    }

    for (const fileName of CONFIG_FILENAMES) {
      let contents: string;
      try {
        contents = readFileSync(join(dir, fileName), 'utf8');
      } catch {
        continue;
      }
      const { $schema, ignorePatterns, ...config } = JSON.parse(
        contents
      ) as FormatConfig & { $schema?: string; ignorePatterns?: Array<string> };
      for (const seen of visited) configCache.set(seen, config);
      return config;
    }

    if (dir === root) break;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  const empty: FormatConfig = {};
  for (const seen of visited) configCache.set(seen, empty);
  return empty;
}

function formatCode(
  sourceCode: string,
  fileName: string,
  parentFile: string
): string {
  if (!sourceCode.trim()) return sourceCode;

  const { code, errors } = oxfmt.format(
    fileName,
    sourceCode,
    resolveFormatConfig(parentFile)
  ) as unknown as { code: string; errors: Array<unknown> };

  if (errors.length) {
    console.error(
      `oxfmt could not format ${fileName} (from ${parentFile}), leaving it unformatted:\n` +
        errors.map((error) => `  ${String(error)}`).join('\n')
    );
    return sourceCode;
  }

  return code;
}

function fromEntries<T>(entries: Array<[string, T]>): Record<string, T> {
  const ret: Record<string, T> = {};
  for (const [key, value] of entries) {
    ret[key] = value;
  }
  return ret;
}
