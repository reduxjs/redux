<p align="center">
  <img src="https://raw.githubusercontent.com/rtk-incubator/rtk-query/main/logo.png" width="400" />
</p>
<h2 align="center">
Code Generator
</h2>

<p align="center">
   <a href="https://discord.gg/0ZcbPKXt5bZ6au5t" target="_blank">
    <img src="https://img.shields.io/badge/chat-online-green" alt="Discord server" />
  </a>
</p>

### Introduction

This is a utility library meant to be used with [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) that will generate a typed API client from an OpenAPI schema.

### Usage

Create an empty api using `createApi` like

```ts
// Or from '@reduxjs/toolkit/query' if not using the auto-generated hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// initialize an empty api service that we'll inject endpoints into later as needed
export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: () => ({}),
});
```

Generate a config file (json, js or ts) with contents like

```ts
import { ConfigFile } from '@rtk-incubator/rtk-query-codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'https://petstore3.swagger.io/api/v3/openapi.json',
  apiFile: './src/store/emptyApi.ts',
  apiImport: 'emptyApi',
  outputFile: './src/store/petApi.ts',
  exportName: 'petApi',
  hooks: true,
};

export default config;
```

and then call the code generator:

```bash
npx @rtk-incubator/rtk-query-codegen-openapi openapi-config.ts
```

### Programmatic usage

```ts
import { generateEndpoints } from '@rtk-incubator/rtk-query-codegen-openapi';

const api = await generateEndpoints({
  apiFile: './fixtures/emptyApi.ts',
  schemaFile: resolve(__dirname, 'fixtures/petstore.json'),
  filterEndpoints: ['getPetById', 'addPet'],
  hooks: true,
});
```

### Config file options

#### Simple usage

```ts
interface SimpleUsage {
  apiFile: string;
  schemaFile: string;
  apiImport?: string;
  exportName?: string;
  argSuffix?: string;
  responseSuffix?: string;
  hooks?: boolean;
  outputFile: string;
  filterEndpoints?: string | RegExp | (string | RegExp)[];
  endpointOverrides?: EndpointOverrides[];
}
```

#### Filtering endpoints

If you only want to include a few endpoints, you can use the `filterEndpoints` config option to filter your endpoints.

```ts
const filteredConfig: ConfigFile = {
  // ...
  // should only have endpoints loginUser, placeOrder, getOrderById, deleteOrder
  filterEndpoints: ['loginUser', /Order/],
};
```

#### Endpoint overrides

If an endpoint is generated as a mutation instead of a query or the other way round, you can override that:

```ts
const withOverride: ConfigFile = {
  // ...
  endpointOverrides: [
    {
      pattern: 'loginUser',
      type: 'mutation',
    },
  ],
};
```

#### Multiple output files

```ts
const config: ConfigFile = {
  schemaFile: 'https://petstore3.swagger.io/api/v3/openapi.json',
  apiFile: './src/store/emptyApi.ts',
  outputFiles: {
    './src/store/user.js': {
      filterEndpoints: [/user/i],
    },
    './src/store/order.js': {
      filterEndpoints: [/order/i],
    },
    './src/store/pet.js': {
      filterEndpoints: [/pet/i],
    },
  },
};
```

### Documentation

[View the RTK Query Code Generation docs](https://redux-toolkit.js.org/rtk-query/usage/code-generation)

TODO these need to be updated!
