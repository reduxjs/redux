import path from 'path';
import fs from 'fs';
import type { CommonOptions, ConfigFile, GenerationOptions, OutputFileOptions } from './types';
import { generateApi } from './generate';
import { isValidUrl, prettify } from './utils';
export { ConfigFile } from './types';

export async function generateEndpoints(options: GenerationOptions): Promise<string | void> {
  const schemaLocation = options.schemaFile;

  const schemaAbsPath = isValidUrl(options.schemaFile)
    ? options.schemaFile
    : path.resolve(process.cwd(), schemaLocation);

  const sourceCode = await generateApi(schemaAbsPath, options);
  const outputFile = options.outputFile;
  if (outputFile) {
    fs.writeFileSync(path.resolve(process.cwd(), outputFile), await prettify(outputFile, sourceCode));
  } else {
    return await prettify(null, sourceCode);
  }
}

export function parseConfig(fullConfig: ConfigFile) {
  const outFiles: (CommonOptions & OutputFileOptions)[] = [];

  if ('outputFiles' in fullConfig) {
    const { outputFiles, ...commonConfig } = fullConfig;
    for (const [outputFile, specificConfig] of Object.entries(outputFiles)) {
      outFiles.push({
        ...commonConfig,
        ...specificConfig,
        outputFile,
      });
    }
  } else {
    outFiles.push(fullConfig);
  }
  return outFiles;
}
