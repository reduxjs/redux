import { resolve } from 'path';
import { generateEndpoints } from '../src';

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
  expect(api).toContain('`/api/v1/list/${queryArg["item.id"]}`');
  expect(api).toMatchSnapshot();
});
