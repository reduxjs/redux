// @ts-ignore
import flatMap from 'unist-util-flatmap';
import { Extractor } from './extract.js';
import type { ExtractorSettings } from './extract.js';
import { renderDocNode } from './utils.js';
import { URL } from 'node:url';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

import type { Plugin } from 'unified';
import type { DocNode } from '@microsoft/tsdoc';

type Comment = NonNullable<ReturnType<Extractor['getComment']>>;
type RenderFunction = (c: Comment) => import('unist').Node[];

type RenderableKey = {
  [K in keyof Comment]: NonNullable<Comment[K]> extends DocNode | DocNode[]
    ? K
    : never;
}[keyof Comment];

export interface LinkDocblocksSettings {
  extractorSettings: ExtractorSettings;
}

const extractors = new WeakMap<ExtractorSettings, Extractor>();

export const linkDocblocks: Plugin<[LinkDocblocksSettings]> = function ({
  extractorSettings,
}) {
  if (!extractors.has(extractorSettings)) {
    extractors.set(extractorSettings, new Extractor(extractorSettings));
  }
  const extractor = extractors.get(extractorSettings)!;

  const parseNodes = (markdown: string): Node[] => {
    return (this.parse(markdown) as Parent).children;
  };

  function renderAsMarkdown(
    key: RenderableKey,
    prepare = (str: string) => str
  ): RenderFunction {
    function render(comment: Comment) {
      const docBlock = comment[key];
      const rendered = renderDocNode(docBlock);
      return parseNodes(prepare(rendered));
    }
    return render;
  }

  const sectionMapping = {
    summary: renderAsMarkdown('summarySection', (s) =>
      s.replace(/@summary/g, '')
    ),
    remarks: renderAsMarkdown('remarksBlock', (s) =>
      s.replace(/@remarks/g, '')
    ),
    overloadSummary: renderAsMarkdown('overloadSummary', (s) =>
      s.replace(/@overloadSummary/g, '')
    ),
    overloadRemarks: renderAsMarkdown('overloadRemarks', (s) =>
      s.replace(/@overloadRemarks/g, '')
    ),
    examples: renderAsMarkdown('examples', (s) => s.replace(/@example/g, '')),
    params: renderAsMarkdown('params', (s) =>
      s.replace(/@param (.*) -/g, '* **$1**')
    ),
  };

  return function transformer(tree) {
    return flatMap(tree, function mapper(parent: Parent): Node[] {
      if (!(parent.type === 'paragraph' && parent.children.length === 1)) {
        return [parent];
      }

      const node = parent.children[0] as Node & {
        url: string;
        children: [import('unist').Node & { value: string }];
      };

      if (node.type !== 'link' || !node.url.startsWith('docblock://')) {
        return [parent];
      }

      if (node.children.length !== 1 || node.children[0].type !== 'text') {
        throw new Error('invalid meta content for docblock link');
      }
      const meta = node.children[0].value;
      const sections = meta.split(',').map((s) => s.trim());

      const url = new URL(node.url);
      const fileName = url.host + url.pathname;
      const args = url.searchParams;

      const token = args.get('token');
      const overload = Number.parseInt(args.get('overload') || '0');

      if (!token) {
        throw new Error(
          'token name must be provided as query parameter `token`'
        );
      }

      const comment = extractor.getComment(token, fileName, overload);
      if (!comment) {
        return [];
      }

      const retVal = sections.reduce<Node[]>((acc, section) => {
        if (!(section in sectionMapping)) {
          throw new Error(
            `invalid comment section reference. valid references are ${Object.keys(
              sectionMapping
            ).concat(',')}`
          );
        }
        acc.push(
          ...sectionMapping[section as keyof typeof sectionMapping](comment)
        );
        return acc;
      }, []);

      visit(
        { type: 'fakeRoot', children: retVal },
        'code',
        (node: Node & { value: string }) => {
          node.value = node.value.trimEnd();
        }
      );

      return retVal;
    });
  };
};
