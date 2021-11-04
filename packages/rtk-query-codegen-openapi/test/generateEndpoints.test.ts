import { resolve } from 'path';
import { generateEndpoints } from '../src';
import fs from 'fs';
import path from 'path';

test('calling without `outputFile` returns the generated api', async () => {
  const api = await generateEndpoints({
    apiFile: './fixtures/emptyApi.ts',
    schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
  });
  expect(api).toMatchSnapshot();
});

test('endpoint filtering', async () => {
  const api = await generateEndpoints({
    apiFile: './fixtures/emptyApi.ts',
    schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
    filterEndpoints: ['loginUser', /Order/],
  });
  expect(api).toMatchSnapshot('should only have endpoints loginUser, placeOrder, getOrderById, deleteOrder');
});

test('endpoint overrides', async () => {
  const api = await generateEndpoints({
    apiFile: './fixtures/emptyApi.ts',
    schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
    filterEndpoints: 'loginUser',
    endpointOverrides: [
      {
        pattern: 'loginUser',
        type: 'mutation',
      },
    ],
  });
  expect(api).not.toMatch(/loginUser: build.query/);
  expect(api).toMatch(/loginUser: build.mutation/);
  expect(api).toMatchSnapshot('loginUser should be a mutation');
});

test('hooks generation', async () => {
  const api = await generateEndpoints({
    apiFile: './fixtures/emptyApi.ts',
    schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
    filterEndpoints: ['getPetById', 'addPet'],
    hooks: true,
  });
  expect(api).toContain('useGetPetByIdQuery');
  expect(api).toContain('useAddPetMutation');
  expect(api).toMatchSnapshot(
    'should generate an `useGetPetByIdQuery` query hook and an `useAddPetMutation` mutation hook'
  );
});

test('hooks generation uses overrides', async () => {
  const api = await generateEndpoints({
    apiFile: './fixtures/emptyApi.ts',
    schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
    filterEndpoints: 'loginUser',
    endpointOverrides: [
      {
        pattern: 'loginUser',
        type: 'mutation',
      },
    ],
    hooks: true,
  });
  expect(api).not.toContain('useLoginUserQuery');
  expect(api).toContain('useLoginUserMutation');
  expect(api).toMatchSnapshot('should generate an `useLoginMutation` mutation hook');
});

test('should use brackets in a querystring urls arg, when the arg contains full stops', async () => {
  const api = await generateEndpoints({
    apiFile: './fixtures/emptyApi.ts',
    schemaFile: resolve(__dirname, 'fixtures/params.json'),
  });
  // eslint-disable-next-line no-template-curly-in-string
  expect(api).toContain('`/api/v1/list/${queryArg["item.id"]}`');
  expect(api).toMatchSnapshot();
});

test('apiImport builds correct `import` statement', async () => {
  const api = await generateEndpoints({
    apiFile: './fixtures/emptyApi.ts',
    schemaFile: resolve(__dirname, 'fixtures/params.json'),
    filterEndpoints: [],
    apiImport: 'myApi',
  });
  expect(api).toContain('myApi as api');
});

describe('import paths', () => {
  beforeEach(async () => {
    const dir = resolve(__dirname, 'tmp');
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
      if (!file.startsWith('.')) await fs.promises.unlink(path.join(dir, file));
    }
  });

  test('should create paths relative to `outFile` when `apiFile` is relative (different folder)', async () => {
    process.chdir(__dirname);
    await generateEndpoints({
      apiFile: './fixtures/emptyApi.ts',
      outputFile: './tmp/out.ts',
      schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
      filterEndpoints: [],
      hooks: true,
    });
    expect(await fs.promises.readFile('./tmp/out.ts', 'utf8')).toContain("import { api } from '../fixtures/emptyApi'");
  });

  test('should create paths relative to `outFile` when `apiFile` is relative (same folder)', async () => {
    process.chdir(__dirname);

    await fs.promises.writeFile('./tmp/emptyApi.ts', await fs.promises.readFile('./fixtures/emptyApi.ts'));

    await generateEndpoints({
      apiFile: './tmp/emptyApi.ts',
      outputFile: './tmp/out.ts',
      schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
      filterEndpoints: [],
      hooks: true,
    });
    expect(await fs.promises.readFile('./tmp/out.ts', 'utf8')).toContain("import { api } from './emptyApi'");
  });
});
