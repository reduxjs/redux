import { setupServer } from 'msw/node'
import { rest } from 'msw'

// This configures a request mocking server with the given request handlers.

export type Post = {
  id: number
  title: string
  body: string
}

export const posts: Record<number, Post> = {
  1: { id: 1, title: 'hello', body: 'extra body!' },
}

export const server = setupServer(
  rest.get('https://example.com/echo', (req, res, ctx) =>
    res(ctx.json({ ...req, headers: req.headers.all() }))
  ),
  rest.post('https://example.com/echo', (req, res, ctx) =>
    res(ctx.json({ ...req, headers: req.headers.all() }))
  ),
  rest.get('https://example.com/success', (_, res, ctx) =>
    res(ctx.json({ value: 'success' }))
  ),
  rest.post('https://example.com/success', (_, res, ctx) =>
    res(ctx.json({ value: 'success' }))
  ),
  rest.get('https://example.com/empty', (_, res, ctx) => res(ctx.body(''))),
  rest.get('https://example.com/error', (_, res, ctx) =>
    res(ctx.status(500), ctx.json({ value: 'error' }))
  ),
  rest.post('https://example.com/error', (_, res, ctx) =>
    res(ctx.status(500), ctx.json({ value: 'error' }))
  ),
  rest.get('https://example.com/nonstandard-error', (_, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        success: false,
        message: 'This returns a 200 but is really an error',
      })
    )
  ),
  rest.get('https://example.com/mirror', (req, res, ctx) =>
    res(ctx.json(req.params))
  ),
  rest.post('https://example.com/mirror', (req, res, ctx) =>
    res(ctx.json(req.params))
  ),
  rest.get('https://example.com/posts/random', (req, res, ctx) => {
    // just simulate an api that returned a random ID
    const { id, ..._post } = posts[1]
    return res(ctx.json({ id }))
  }),
  rest.get<Post, any, { id: number }>(
    'https://example.com/post/:id',
    (req, res, ctx) => {
      return res(ctx.json(posts[req.params.id]))
    }
  )
)
