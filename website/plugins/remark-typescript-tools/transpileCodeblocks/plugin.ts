import { visit } from 'unist-util-visit';
// @ts-ignore
import flatMap from 'unist-util-flatmap';
import { Compiler } from './compiler.js';
import type { CompilerSettings, TranspiledFile } from './compiler.js';
import {
  defaultPostProcessTranspiledJs,
  defaultPostProcessTs,
} from './postProcessing.js';
import type { Plugin } from 'unified';
import type { Node, Parent } from 'unist';
import type { VFile } from 'vfile';
import type { ImportDeclaration } from 'estree';
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

export interface VirtualFile {
  code: string;
  skip?: boolean;
}
export type VirtualFiles = Record<string, VirtualFile>;

interface CodeNode extends Node {
  lang: string;
  meta: string | null;
  value: string;
  indent: number[];
}

type PostProcessor = (
  files: VirtualFiles,
  parentFile?: string,
  defaultProcessor?: PostProcessor
) => VirtualFiles;

export interface TranspileCodeblocksSettings {
  compilerSettings: CompilerSettings;
  postProcessTranspiledJs?: PostProcessor;
  postProcessTs?: PostProcessor;
  assembleReplacementNodes?: typeof defaultAssembleReplacementNodes;
  fileExtensions?: string[];
}

const compilers = new WeakMap<CompilerSettings, Compiler>();

export const transpileCodeblocks: Plugin<[TranspileCodeblocksSettings]> =
  function ({
    compilerSettings,
    postProcessTranspiledJs = defaultPostProcessTranspiledJs,
    postProcessTs = defaultPostProcessTs,
    assembleReplacementNodes = defaultAssembleReplacementNodes,
    fileExtensions = ['.mdx'],
  }) {
    if (!compilers.has(compilerSettings)) {
      compilers.set(compilerSettings, new Compiler(compilerSettings));
    }
    const compiler = compilers.get(compilerSettings)!;

    return function transformer(tree, file) {
      if (!file.extname || !fileExtensions.includes(file.extname)) {
        return tree;
      }

      const virtualFilepath =
        compilerSettings.transformVirtualFilepath?.(file.path ?? '') ??
        file.path;

      let hasTabsImport = false;
      let hasTabItemImport = false;

      visit(tree, 'ImportDeclaration', (node: ImportDeclaration) => {
        if (
          node.source.value === '@theme/Tabs' &&
          node.specifiers.some(
            (sp) => sp.type === 'ImportSpecifier' && sp.local.name === 'Tabs'
          )
        ) {
          hasTabsImport = true;
        }
        if (
          node.source.value === '@theme/TabItem' &&
          node.specifiers.some(
            (sp) => sp.type === 'ImportSpecifier' && sp.local.name === 'TabItem'
          )
        ) {
          hasTabItemImport = true;
        }
      });

      visit(tree, 'root', (node: Parent) => {
        if (!hasTabsImport) {
          node.children.unshift({
            type: 'mdxjsEsm',
            value: "import Tabs from '@theme/Tabs'",
            data: {
              estree: {
                type: 'Program',
                body: [
                  {
                    type: 'ImportDeclaration',
                    specifiers: [
                      {
                        type: 'ImportDefaultSpecifier',
                        local: {
                          type: 'Identifier',
                          name: 'Tabs',
                        },
                      },
                    ],
                    source: {
                      type: 'Literal',
                      value: '@theme/Tabs',
                    },
                  },
                ],
                sourceType: 'module',
              },
            },
          } satisfies MdxjsEsm as MdxjsEsm);
        }
        if (!hasTabItemImport) {
          node.children.unshift({
            type: 'mdxjsEsm',
            value: "import TabItem from '@theme/TabItem'",
            data: {
              estree: {
                type: 'Program',
                body: [
                  {
                    type: 'ImportDeclaration',
                    specifiers: [
                      {
                        type: 'ImportDefaultSpecifier',
                        local: {
                          type: 'Identifier',
                          name: 'TabItem',
                        },
                      },
                    ],
                    source: {
                      type: 'Literal',
                      value: '@theme/TabItem',
                    },
                  },
                ],
                sourceType: 'module',
              },
            },
          } satisfies MdxjsEsm as MdxjsEsm);
        }
      });

      let codeBlock = 0;

      return flatMap(tree, function mapper(node: CodeNode) {
        if (node.type === 'code') {
          codeBlock++;
        }
        if (!(node.type === 'code' && ['ts', 'tsx'].includes(node.lang))) {
          return [node];
        }
        const tags = node.meta ? node.meta.split(' ') : [];
        if (tags.includes('no-transpile')) {
          return [node];
        }

        const virtualFolder = `${virtualFilepath}/codeBlock_${codeBlock}`;
        const virtualFiles = splitFiles(node.value, virtualFolder);

        //console.time(virtualFolder)
        const transpilationResult = compiler.compile(virtualFiles);
        //console.timeEnd(virtualFolder)

        for (const [fileName, result] of Object.entries(transpilationResult)) {
          for (const diagnostic of result.diagnostics) {
            if (diagnostic.line && node.position) {
              const lines = result.code
                .split('\n')
                .map(
                  (line, lineNo) =>
                    `${String(lineNo).padStart(3, ' ')}  ${line}`
                );

              file.fail(
                `
TypeScript error in code block in line ${diagnostic.line} of ${fileName}
${diagnostic.message}

${lines.slice(Math.max(0, diagnostic.line - 5), diagnostic.line + 6).join('\n')}
            `,
                {
                  line: diagnostic.line + node.position.start.line,
                  column: diagnostic.character,
                }
              );
            } else {
              file.fail(diagnostic.message, node);
            }
          }
        }

        return assembleReplacementNodes(
          node,
          file,
          virtualFolder,
          virtualFiles,
          transpilationResult,
          postProcessTs,
          postProcessTranspiledJs
        );
      });
    };
  };

export function defaultAssembleReplacementNodes(
  node: CodeNode,
  file: VFile,
  virtualFolder: string,
  virtualFiles: Record<string, VirtualFile>,
  transpilationResult: Record<string, TranspiledFile>,
  postProcessTs: PostProcessor,
  postProcessTranspiledJs: PostProcessor
): Node[] {
  return [
    {
      type: 'mdxJsxFlowElement',
      name: 'Tabs',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'groupId', value: 'language' },
        { type: 'mdxJsxAttribute', name: 'defaultValue', value: 'ts' },
        {
          type: 'mdxJsxAttribute',
          name: 'values',
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value:
              "[{ label: 'TypeScript', value: 'ts', }, { label: 'JavaScript', value: 'js', } ]",
            data: {
              estree: {
                type: 'Program',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'ArrayExpression',
                      elements: [
                        {
                          type: 'ObjectExpression',
                          properties: [
                            {
                              type: 'Property',
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: 'Identifier',
                                name: 'label',
                              },
                              value: {
                                type: 'Literal',
                                value: 'TypeScript',
                              },
                              kind: 'init',
                            },
                            {
                              type: 'Property',
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: 'Identifier',
                                name: 'value',
                              },
                              value: {
                                type: 'Literal',
                                value: 'ts',
                              },
                              kind: 'init',
                            },
                          ],
                        },
                        {
                          type: 'ObjectExpression',
                          properties: [
                            {
                              type: 'Property',
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: 'Identifier',
                                name: 'label',
                              },
                              value: {
                                type: 'Literal',
                                value: 'JavaScript',
                              },
                              kind: 'init',
                            },
                            {
                              type: 'Property',
                              method: false,
                              shorthand: false,
                              computed: false,
                              key: {
                                type: 'Identifier',
                                name: 'value',
                              },
                              value: {
                                type: 'Literal',
                                value: 'js',
                              },
                              kind: 'init',
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
                sourceType: 'module',
                comments: [],
              },
            },
          },
        },
      ],
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'TabItem',
          attributes: [{ type: 'mdxJsxAttribute', name: 'value', value: 'ts' }],
          children: [
            {
              ...node,
              value: rearrangeFiles(
                postProcessTs(virtualFiles, file.path, defaultPostProcessTs),
                virtualFolder
              ),
            } satisfies CodeNode as any,
          ],
        },
        {
          type: 'mdxJsxFlowElement',
          name: 'TabItem',
          attributes: [{ type: 'mdxJsxAttribute', name: 'value', value: 'js' }],
          children: [
            {
              ...node,
              lang: 'js',
              ...(typeof node.meta === 'string' && {
                meta: node.meta.replace(
                  /(title=['"].*)\.t(sx?)(.*")/,
                  '$1.j$2$3'
                ),
              }),
              value: rearrangeFiles(
                postProcessTranspiledJs(
                  transpilationResult,
                  file.path,
                  defaultPostProcessTranspiledJs
                ),
                virtualFolder
              ),
            } satisfies CodeNode as any,
          ],
        },
      ],
    } satisfies MdxJsxFlowElement as MdxJsxFlowElement,
  ];
}

function splitFiles(fullCode: string, folder: string) {
  const regex = /^\/\/ file: ([\w\-./\[\]]+)(?: (.*))?\s*$/gm;
  let match = regex.exec(fullCode);

  const files: VirtualFiles = {};

  do {
    const start = match ? match.index + match[0].length + 1 : 0;
    const fileName = match ? match[1] : 'index.ts';
    const flags = (match ? match[2] || '' : '').split(' ');
    const skip = flags.includes('noEmit');
    match = regex.exec(fullCode);
    const end = match ? match.index : fullCode.length;
    const code = fullCode.substring(start, end);
    files[`${folder}/${fileName}`] = { code, skip };
  } while (match);

  return files;
}

function rearrangeFiles(files: VirtualFiles, folder: string) {
  const filteredFiles = Object.entries(files).filter(([, { skip }]) => !skip);

  if (filteredFiles.length === 1) {
    const [[, { code }]] = filteredFiles;
    return code;
  }

  return filteredFiles
    .map(
      ([fileName, { code }]) => `// file: ${fileName.replace(folder + '/', '')}
${code.trim()}`
    )
    .join('\n\n\n');
}
