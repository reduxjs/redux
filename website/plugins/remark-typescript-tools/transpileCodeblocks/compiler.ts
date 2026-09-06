import { API } from '../ts7.cjs';
import type { SourceFile } from 'typescript/unstable/ast';
import { transformSync } from 'oxc-transform';
import { basename, dirname, normalize } from 'node:path';

import type { VirtualFiles, VirtualFile } from './plugin.js';

export type Diagnostic =
  | { line: number; character: number; message: string }
  | { line?: undefined; character?: undefined; message: string };

export interface TranspiledFile extends VirtualFile {
  diagnostics: Array<Diagnostic>;
}

export type TranspiledFiles = Record<string, TranspiledFile>;

/**
 * Under TypeScript 7 the checker runs in a Go process that cannot call back into
 * a JavaScript module resolver, so `externalResolutions` is applied by injecting
 * `paths` entries into the generated tsconfig instead of via `resolveModuleNames`.
 * `packageId` has no equivalent and is ignored.
 */
export interface ExternalResolution {
  resolvedPath: string;
  packageId?: unknown;
}

export interface CompilerSettings {
  tsconfig: string;
  externalResolutions: Record<string, ExternalResolution>;
  /**
   * Allows transforming the virtual filepath for codeblocks.
   * This allows the files to resolve node modules from a different location
   * to their own directory.
   */
  transformVirtualFilepath?: (filepath: string) => string;
}

const slash = (p: string) => normalize(p).replace(/\\/g, '/');

/** Name of the generated tsconfig placed next to the user's real one. */
const GENERATED_TSCONFIG = '__remark_typescript_tools.tsconfig.json';

export class Compiler {
  private api: API;
  private configPath: string;
  private baseConfigName: string;
  private externalPaths: Record<string, string[]>;

  /** Virtual overlay: absolute forward-slash path -> file contents. */
  private virtual = new Map<string, string>();
  /** Directories that exist only in the overlay. */
  private virtualDirs = new Set<string>();
  /** Root files of the previous `compile()` call, for change notification. */
  private previousFiles: string[] = [];
  private firstSnapshot = true;

  constructor(settings: CompilerSettings) {
    const tsconfigDir = slash(dirname(settings.tsconfig));
    this.baseConfigName = basename(settings.tsconfig);
    this.configPath = `${tsconfigDir}/${GENERATED_TSCONFIG}`;

    this.externalPaths = Object.fromEntries(
      Object.entries(settings.externalResolutions).map(([name, resolution]) => [
        name,
        [resolution.resolvedPath],
      ])
    );

    this.api = new API({ fs: this.createOverlay(), cwd: tsconfigDir });
  }

  /**
   * A TS 7 `FileSystem` is an overlay: returning `undefined` from a callback
   * falls back to the real filesystem, so virtual code blocks and the real
   * `node_modules` tree coexist without a temp directory.
   */
  private createOverlay() {
    return {
      readFile: (fileName: string) => this.virtual.get(slash(fileName)),
      fileExists: (fileName: string) =>
        this.virtual.has(slash(fileName)) ? true : undefined,
      directoryExists: (dirName: string) =>
        this.virtualDirs.has(slash(dirName)) ? true : undefined,
      getAccessibleEntries: (dirName: string) => {
        const dir = slash(dirName);
        if (!this.virtualDirs.has(dir)) return undefined;
        const files: string[] = [];
        const directories = new Set<string>();
        for (const path of this.virtual.keys()) {
          if (!path.startsWith(dir + '/')) continue;
          const rest = path.slice(dir.length + 1);
          if (rest.includes('/')) directories.add(rest.split('/')[0]);
          else files.push(rest);
        }
        return { files, directories: [...directories] };
      },
    };
  }

  private addVirtualFile(fileName: string, contents: string) {
    const path = slash(fileName);
    this.virtual.set(path, contents);
    // Register every ancestor directory. Code blocks live under a path like
    // `docs/api/createAction.mdx/codeBlock_2/`, so `createAction.mdx` has to
    // report as a directory even though a real file of that name exists.
    let dir = slash(dirname(path));
    while (dir && !this.virtualDirs.has(dir)) {
      this.virtualDirs.add(dir);
      const parent = slash(dirname(dir));
      if (parent === dir) break;
      dir = parent;
    }
  }

  public compile(files: VirtualFiles): TranspiledFiles {
    const fileNames: string[] = [];

    for (const [fileName, { code }] of Object.entries(files)) {
      // Blank lines survive the round trip as comments; the marker is stripped
      // again after emit.
      this.addVirtualFile(fileName, code.replace(/^$/gm, '//__NEWLINE__'));
      fileNames.push(slash(fileName));
    }

    this.writeGeneratedConfig(fileNames);

    const previous = new Set(this.previousFiles);
    const current = new Set(fileNames);
    const fileChanges = this.firstSnapshot
      ? undefined
      : {
          created: fileNames.filter((f) => !previous.has(f)),
          deleted: this.previousFiles.filter((f) => !current.has(f)),
          changed: [
            this.configPath,
            ...fileNames.filter((f) => previous.has(f)),
          ],
        };
    this.previousFiles = fileNames;
    this.firstSnapshot = false;

    const snapshot = this.api.updateSnapshot({
      openProjects: [this.configPath],
      fileChanges,
    });
    const program = snapshot.getProject(this.configPath).program;

    const configDiagnostics = program
      .getConfigFileParsingDiagnostics()
      .concat(program.getProgramDiagnostics());

    const returnFiles: TranspiledFiles = {};

    for (const [fileName, file] of Object.entries(files)) {
      const path = slash(fileName);

      const diagnostics = [
        ...configDiagnostics,
        ...program.getSyntacticDiagnostics(path),
        ...program.getSemanticDiagnostics(path),
      ].map((diagnostic) => {
        const message = flattenMessage(diagnostic);
        const sourceFile = diagnostic.fileName
          ? program.getSourceFile(diagnostic.fileName)
          : undefined;
        if (sourceFile && typeof diagnostic.pos === 'number') {
          const { line, character } = (
            sourceFile as SourceFile
          ).getLineAndCharacterOfPosition(diagnostic.pos);
          return { line, character, message };
        }
        return { message };
      });

      returnFiles[fileName] = {
        ...file,
        code: this.emit(path, this.virtual.get(path)!),
        diagnostics,
      };
    }

    return returnFiles;
  }

  /**
   * TypeScript 7 exposes no programmatic emit, so type stripping and the JSX
   * transform are done by oxc. Checking already happened above, so this only
   * needs to be a syntactic transform.
   */
  private emit(fileName: string, source: string): string {
    const result = transformSync(fileName, source, { jsx: 'preserve' });
    return result.code.replace(/\/\/__NEWLINE__/g, '');
  }

  private writeGeneratedConfig(fileNames: string[]) {
    this.addVirtualFile(
      this.configPath,
      JSON.stringify({
        extends: `./${this.baseConfigName}`,
        compilerOptions: {
          noEmit: true,
          ...(Object.keys(this.externalPaths).length
            ? { paths: this.externalPaths }
            : {}),
        },
        // The user's tsconfig has no `files`/`include`, so it would otherwise
        // pull in the whole docs tree for every code block.
        include: [],
        files: fileNames,
      })
    );
  }

  public dispose() {
    this.api.close();
  }
}

function flattenMessage(diagnostic: {
  text?: string;
  messageChain?: Array<{ text?: string }>;
}): string {
  const parts = [diagnostic.text ?? ''];
  for (const child of diagnostic.messageChain ?? []) {
    if (child.text) parts.push(child.text);
  }
  return parts.filter(Boolean).join('\n');
}
