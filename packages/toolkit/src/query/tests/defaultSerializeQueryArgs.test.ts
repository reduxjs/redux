import { defaultSerializeQueryArgs } from '@internal/query/defaultSerializeQueryArgs'

const endpointDefinition: any = {}
const endpointName = 'test'

test('string arg', () => {
  expect(
    defaultSerializeQueryArgs({
      endpointDefinition,
      endpointName,
      queryArgs: 'arg',
    })
  ).toMatchInlineSnapshot(`"test(\\"arg\\")"`)
})

test('number arg', () => {
  expect(
    defaultSerializeQueryArgs({
      endpointDefinition,
      endpointName,
      queryArgs: 5,
    })
  ).toMatchInlineSnapshot(`"test(5)"`)
})

test('simple object arg is sorted', () => {
  expect(
    defaultSerializeQueryArgs({
      endpointDefinition,
      endpointName,
      queryArgs: { name: 'arg', age: 5 },
    })
  ).toMatchInlineSnapshot(`"test({\\"age\\":5,\\"name\\":\\"arg\\"})"`)
})

test('nested object arg is sorted recursively', () => {
  expect(
    defaultSerializeQueryArgs({
      endpointDefinition,
      endpointName,
      queryArgs: { name: { last: 'Split', first: 'Banana' }, age: 5 },
    })
  ).toMatchInlineSnapshot(
    `"test({\\"age\\":5,\\"name\\":{\\"first\\":\\"Banana\\",\\"last\\":\\"Split\\"}})"`
  )
})
