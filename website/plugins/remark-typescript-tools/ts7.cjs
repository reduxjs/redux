// TypeScript 7 is ESM-only. Docusaurus loads `docusaurus.config.ts` through
// jiti, and jiti transpiles everything it reaches - including this package's
// dependencies - down to CommonJS. That transpile leaves TypeScript's
// `import.meta` in place, and loading the result throws
// "Cannot use 'import.meta' outside a module".
//
// Node's own require(esm) loads TypeScript 7 without complaint. This file is
// plain CommonJS with no ESM syntax, so jiti has nothing to transform and
// hands it to Node, whose native `require` then does the right thing.
//
// Only value imports need to come through here. `import type` is erased
// before runtime, so the rest of the port still imports its types straight
// from `typescript/unstable/ast`.

const { API } = require('typescript/unstable/sync')
const {
  SyntaxKind,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
  isIdentifier,
  isVariableDeclaration,
  isVariableStatement,
} = require('typescript/unstable/ast')

module.exports = {
  API,
  SyntaxKind,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
  isIdentifier,
  isVariableDeclaration,
  isVariableStatement,
}
