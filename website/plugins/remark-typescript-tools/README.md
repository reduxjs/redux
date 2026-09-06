# Vendored `remark-typescript-tools`

This is a vendored copy of the `src/` tree from
[`phryneas/remark-typescript-tools`](https://github.com/phryneas/remark-typescript-tools),
ported to TypeScript 7 and oxfmt.

## Why it is here

TypeScript 7's main export is `{ version, versionMajorMinor }`. There is no
`typescript.js` and no `typescript.d.ts`, so any tool driving the classic `ts.*`
API stops working. `remark-typescript-tools` drives it heavily — a hand-written
`LanguageServiceHost`, `getEmitOutput` for transpilation, and AST walking for
docblock extraction.

The port replaces all of that:

- `transpileCodeblocks/compiler.ts` uses one `API` instance from
  `typescript/unstable/sync` with an overlay filesystem. Emit moves to
  `oxc-transform`, because the TS 7 API has no emit at all.
- `linkDocblocks/extract.ts` and `linkDocblocks/utils.ts` use the same program
  construction, with AST helpers from `typescript/unstable/ast`.
- `transpileCodeblocks/postProcessing.ts` formats with `oxfmt` instead of
  Prettier, wrapped in `make-synchronized` because oxfmt's `format` crosses a
  napi boundary and is async while the remark walk is sync. A missing config
  falls back to defaults rather than skipping formatting.

## Why vendored rather than a published release

The only unfinished part of the port is declaration output: `rollup-plugin-dts`
drives the classic TypeScript API and crashes under TS 7, so the upstream
package cannot ship a release yet. Vendored here, no declarations are needed —
`website/docusaurus.config.ts` imports this source directly.

## This is a bridge, not a fork

Do not develop features here. An upstream PR carries the same port. When an
upstream release lands, delete this directory and depend on the package again.

Keep this copy formatter-clean against upstream so the two stay diffable:
`website/plugins/**` is in `ignorePatterns` in `.oxfmtrc.json` for that reason.

The copy has no `package.json`. Its runtime dependencies (`@microsoft/tsdoc`,
`make-synchronized`, `mdast-util-mdx-jsx`, `mdast-util-mdxjs-esm`,
`oxc-transform`, `oxfmt`, `typescript`, `unified`, `unist-util-flatmap`,
`unist-util-visit`, `vfile`) and type packages (`@types/estree`, `@types/unist`)
are declared in `website/package.json`.

Upstream base: `main` @ `5c375b1`. Port: branch `feat/typescript-7-and-oxfmt`
@ `b2ce7f2`.
