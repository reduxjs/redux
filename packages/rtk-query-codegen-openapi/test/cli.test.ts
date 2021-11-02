import { exec, ExecException } from 'child_process';
import * as fs from 'fs';
import path from 'path';
import del from 'del';

let id = 0;
const tmpDir = path.resolve(__dirname, 'tmp');

function getTmpFileName() {
  return path.resolve(tmpDir, `${++id}.test.generated.ts`);
}

function cli(args: string[], cwd: string): Promise<{ error: ExecException | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    exec(
      `ts-node -T -P ${path.resolve('./tsconfig.json')} ${path.resolve('./src/bin/cli.ts')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        resolve({
          error,
          stdout,
          stderr,
        });
      }
    );
  });
}

beforeAll(() => {
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
});

afterAll(() => {
  del.sync(`${tmpDir}/*.ts`);
});

describe('CLI options testing', () => {
  test('generation with `config.example.js`', async () => {
    await cli([`./config.example.js`], __dirname);
    expect(fs.readFileSync(path.resolve(tmpDir, 'example.ts'), 'utf-8')).toMatchSnapshot();
  });

  test('ts, js and json all work the same', async () => {
    await cli([`./config.example.js`], __dirname);
    const fromJs = fs.readFileSync(path.resolve(tmpDir, 'example.ts'), 'utf-8');
    await cli([`./config.example.ts`], __dirname);
    const fromTs = fs.readFileSync(path.resolve(tmpDir, 'example.ts'), 'utf-8');
    await cli([`./config.example.json`], __dirname);
    const fromJson = fs.readFileSync(path.resolve(tmpDir, 'example.ts'), 'utf-8');

    expect(fromTs).toEqual(fromJs);
    expect(fromJson).toEqual(fromJs);
  });
});

describe.skip('yaml parsing', () => {
  it('should parse a yaml schema from a URL', async () => {
    const result = await cli([`https://petstore3.swagger.io/api/v3/openapi.yaml`], '.');
    expect(result.stdout).toMatchSnapshot();
  });

  it('should be able to use read a yaml file and create a file with the output when --file is specified', async () => {
    const fileName = getTmpFileName();
    await cli([`--file ${fileName}`, `../fixtures/petstore.yaml`], tmpDir);

    expect(fs.readFileSync(fileName, { encoding: 'utf-8' })).toMatchSnapshot();
  });

  it("should generate params with non quoted keys if they don't contain special characters", async () => {
    const result = await cli([`./test/fixtures/fhir.yaml`], '.');

    const output = result.stdout;

    expect(output).toMatchSnapshot();

    expect(output).toContain('foo: queryArg.foo,');
    expect(output).toContain('_foo: queryArg._foo,');
    expect(output).toContain('_bar_bar: queryArg._bar_bar,');
    expect(output).toContain('foo_bar: queryArg.fooBar,');
    expect(output).toContain('namingConflict: queryArg.namingConflict,');
    expect(output).toContain('naming_conflict: queryArg.naming_conflict,');
  });

  it('should generate params with quoted keys if they contain special characters', async () => {
    const result = await cli([`./test/fixtures/fhir.yaml`], '.');

    const output = result.stdout;

    expect(output).toContain('"-bar-bar": queryArg["-bar-bar"],');
    expect(output).toContain('"foo:bar-foo.bar/foo": queryArg["foo:bar-foo.bar/foo"],');
  });
});
