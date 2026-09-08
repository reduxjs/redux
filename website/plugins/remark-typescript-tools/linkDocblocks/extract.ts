import {
  API,
  isIdentifier,
  isVariableDeclaration,
  isVariableStatement,
} from '../ts7.cjs';
import type { Node, Program } from 'typescript/unstable/ast';
import * as path from 'node:path';
import * as tsdoc from '@microsoft/tsdoc';

import { getJSDocCommentRanges } from './utils.js';

export interface ExtractorSettings {
  tsconfig: string;
  basedir: string;
  rootFiles: string[];
}

const slash = (p: string) => path.normalize(p).replace(/\\/g, '/');

/** Name of the generated tsconfig placed next to the user's real one. */
const GENERATED_TSCONFIG = '__remark_typescript_tools.docblocks.tsconfig.json';

export class Extractor {
  program: Program;
  basedir: string;
  private api: API;

  constructor({ tsconfig, rootFiles, basedir }: ExtractorSettings) {
    this.basedir = basedir;

    const tsconfigDir = slash(path.dirname(tsconfig));
    const configPath = `${tsconfigDir}/${GENERATED_TSCONFIG}`;
    const files = rootFiles.map((file) =>
      slash(path.resolve(basedir, file))
    );

    // The user's tsconfig has no `files`/`include`, so a generated config that
    // extends it is what pins the program to just these root files. It is
    // served from an overlay rather than written to disk.
    const generated = JSON.stringify({
      extends: `./${path.basename(tsconfig)}`,
      compilerOptions: { noEmit: true },
      include: [],
      files,
    });

    // Returning `undefined` falls back to the real filesystem.
    this.api = new API({
      cwd: tsconfigDir,
      fs: {
        readFile: (fileName: string) =>
          slash(fileName) === configPath ? generated : undefined,
        fileExists: (fileName: string) =>
          slash(fileName) === configPath ? true : undefined,
      },
    });

    this.program = this.api
      .updateSnapshot({ openProjects: [configPath] })
      .getProject(configPath).program;
  }

  findTokens(token: string, node: Node) {
    const [lookFor, ...tail] = token.split('.');
    const found: Node[] = [];
    node.forEachChild((child: Node & { name?: Node }) => {
      if (isVariableStatement(child)) {
        found.push(...this.findTokens(token, child.declarationList));
        if (child.declarationList.declarations.length === 1) {
          const name = child.declarationList.declarations[0].name;
          if (name && isIdentifier(name) && name.text === lookFor) {
            // push the whole declarationList if it contains only one declaration, for "outside style"
            found.push(child);
          }
        }
        return;
      }

      const name = child.name;
      if (name && isIdentifier(name) && name.text === lookFor) {
        if (lookFor === token) {
          if (isVariableDeclaration(child) && child.initializer) {
            // push the initializer for "inside" style
            found.push(child.initializer);
          }
          found.push(child);
        } else {
          found.push(...this.findTokens(tail.join('.'), child));
        }
      }
    });
    return found;
  }

  getComment(token: string, fileName = 'index.ts', overload = 0) {
    const inputFileName = slash(path.resolve(this.basedir, fileName));
    const sourceFile = this.program.getSourceFile(inputFileName);
    if (!sourceFile) {
      throw new Error(
        `Error retrieving source file ${sourceFile} (looked for ${fileName} in ${this.basedir})`
      );
    }

    const foundComments = [];

    const buffer = sourceFile.text;

    for (const node of this.findTokens(token, sourceFile)) {
      const comments = getJSDocCommentRanges(node, buffer);

      if (comments.length > 0) {
        for (const comment of comments) {
          foundComments.push({
            compilerNode: node,
            textRange: tsdoc.TextRange.fromStringRange(
              buffer,
              comment.pos,
              comment.end
            ),
          });
        }
      }
    }

    const customConfiguration = new tsdoc.TSDocConfiguration();

    customConfiguration.addTagDefinition(
      new tsdoc.TSDocTagDefinition({
        tagName: '@overloadSummary',
        syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
      })
    );

    customConfiguration.addTagDefinition(
      new tsdoc.TSDocTagDefinition({
        tagName: '@overloadRemarks',
        syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag,
      })
    );

    const tsdocParser = new tsdoc.TSDocParser(customConfiguration);

    const selectedOverload = foundComments[overload];
    if (!selectedOverload) {
      console.warn(
        `could not find overload ${overload} for ${token} in ${fileName}`
      );
      return null;
    }

    const parserContext = tsdocParser.parseRange(selectedOverload.textRange);
    const docComment = parserContext.docComment;
    return Object.assign(docComment, {
      parserContext,
      buffer: selectedOverload.textRange.buffer,
      overloadSummary: docComment.customBlocks.find(
        this.byTagName('@overloadSummary')
      ),
      overloadRemarks: docComment.customBlocks.find(
        this.byTagName('@overloadRemarks')
      ),
      examples: docComment.customBlocks.filter(this.byTagName('@example')),
    });
  }

  byTagName(name: string) {
    return (block: tsdoc.DocBlock) => block.blockTag.tagName === name;
  }
}
