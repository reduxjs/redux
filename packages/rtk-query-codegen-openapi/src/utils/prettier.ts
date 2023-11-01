import * as prettier from 'prettier';
import * as path from 'path';

const EXTENSION_TO_PARSER: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'babylon',
  jsx: 'babylon',
  'js.flow': 'flow',
  flow: 'flow',
  gql: 'graphql',
  graphql: 'graphql',
  css: 'postcss',
  scss: 'postcss',
  less: 'postcss',
  stylus: 'postcss',
  markdown: 'markdown',
  md: 'markdown',
  json: 'json',
};

export async function prettify(filePath: string | null, content: string): Promise<string> {
  let config = null;
  let parser = 'typescript';

  if (filePath) {
    const fileExtension = path.extname(filePath).slice(1);
    parser = EXTENSION_TO_PARSER[fileExtension];
    config = await prettier.resolveConfig(process.cwd(), {
      useCache: true,
      editorconfig: true,
    });
  }

  return prettier.format(content, {
    parser,
    ...config,
  });
}
