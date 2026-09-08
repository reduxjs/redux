import {
  SyntaxKind,
  getLeadingCommentRanges,
  getTrailingCommentRanges,
} from '../ts7.cjs';
import type { CommentRange, Node } from 'typescript/unstable/ast';
import * as tsdoc from '@microsoft/tsdoc';

/**
 * Retrieves the JSDoc-style comments associated with a specific AST node.
 *
 * Based on ts.getJSDocCommentRanges() from the compiler.
 * https://github.com/Microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L924
 */
export function getJSDocCommentRanges(node: Node, text: string) {
  const commentRanges: CommentRange[] = [];

  switch (node.kind) {
    case SyntaxKind.Parameter:
    case SyntaxKind.TypeParameter:
    case SyntaxKind.FunctionExpression:
    case SyntaxKind.ArrowFunction:
    case SyntaxKind.ParenthesizedExpression:
    case SyntaxKind.VariableDeclaration:
    case SyntaxKind.VariableStatement:
      commentRanges.push(...(getTrailingCommentRanges(text, node.pos) || []));
      break;
  }
  commentRanges.push(...(getLeadingCommentRanges(text, node.pos) || []));

  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter(
    (comment) =>
      text.charCodeAt(comment.pos + 1) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 2) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */
  );
}

export function renderDocNode(
  docNode?: tsdoc.DocNode | tsdoc.DocNode[]
): string {
  if (!docNode) {
    return '';
  }
  if (Array.isArray(docNode)) {
    return docNode.map((node) => renderDocNode(node)).join('');
  }

  let result = '';
  if (docNode) {
    if (docNode instanceof tsdoc.DocFencedCode) {
      let code: string = docNode.code.toString();
      let meta: string = '';
      code = code.replace(
        /^\s*\/\/\s*codeblock-meta(\s.*?)$\n?/gm,
        (_line, metaMatch) => {
          meta += metaMatch;
          return '';
        }
      );
      return '```' + docNode.language + meta + '\n' + code + '\n```';
    }
    if (docNode instanceof tsdoc.DocExcerpt) {
      result += docNode.content.toString();
    }

    for (const childNode of docNode.getChildNodes()) {
      result += renderDocNode(childNode);
    }
  }
  return result;
}
