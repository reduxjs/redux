// @ts-nocheck
import { reducerPropsToBuilderExpression } from './createReducerBuilder'

export default function transformer(file, api) {
  const j = api.jscodeshift

  return j(file.source)
    .find(j.CallExpression, {
      callee: { name: 'createSlice' },
      arguments: { 0: { type: 'ObjectExpression' } },
    })
    .filter((path) =>
      path.node.arguments[0].properties.some(
        (p) =>
          p.key.name === 'extraReducers' && p.value.type === 'ObjectExpression'
      )
    )
    .forEach((path) => {
      j(path).replaceWith(
        j.callExpression(j.identifier('createSlice'), [
          j.objectExpression(
            path.node.arguments[0].properties.map((p) => {
              if (p.key.name === 'extraReducers') {
                const expressionStatement = reducerPropsToBuilderExpression(
                  j,
                  p.value
                )
                return j.objectProperty(p.key, expressionStatement)
              }
              return p
            })
          ),
        ])
      )
    })
    .toSource()
}
