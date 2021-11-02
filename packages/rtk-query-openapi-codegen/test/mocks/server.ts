import { setupServer } from 'msw/node';
import { rest } from 'msw';

import petstoreJSON from '../fixtures/petstore.json';
import petstoreYAML from '../fixtures/petstore.yaml.mock';

// This configures a request mocking server with the given request handlers.

export const server = setupServer(
  rest.get('http://example.com/echo', (req, res, ctx) =>
    res(ctx.json({ ...req, headers: req.headers.getAllHeaders() }))
  ),
  rest.post('http://example.com/echo', (req, res, ctx) =>
    res(ctx.json({ ...req, headers: req.headers.getAllHeaders() }))
  ),

  rest.get('https://petstore3.swagger.io/api/v3/openapi.json', (req, res, ctx) => res(ctx.json(petstoreJSON))),
  rest.get('https://petstore3.swagger.io/api/v3/openapi.yaml', (req, res, ctx) => res(ctx.json(petstoreYAML)))
);
