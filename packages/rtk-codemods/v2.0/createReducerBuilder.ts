// @ts-nocheck

function wrapInAddCaseExpression(j, member, arrowArguments) {
  return j.callExpression(
    j.memberExpression(member, j.identifier('addCase'), false),
    arrowArguments
  )
}

export function reducerPropsToBuilderExpression(j, defNode) {
  const [firstCase, ...restOfCases] = defNode.properties

  const expressionStatement = restOfCases.reduce((acc, c) => {
    return wrapInAddCaseExpression(j, acc, [c.key, c.value])
  }, wrapInAddCaseExpression(j, j.identifier('builder'), [firstCase.key, firstCase.value]))

  return j.arrowFunctionExpression(
    [j.identifier('builder')],
    j.blockStatement([j.expressionStatement(expressionStatement)])
  )
}

export default function transformer(file, api) {
  const j = api.jscodeshift

  return j(file.source)
    .find(j.CallExpression, {
      callee: { name: 'createReducer' },
      arguments: { 1: { type: 'ObjectExpression' } },
    })
    .forEach((path) => {
      j(path).replaceWith(
        j.callExpression(j.identifier('createReducer'), [
          path.node.arguments[0],
          reducerPropsToBuilderExpression(j, path.node.arguments[1]),
        ])
      )
    })
    .toSource()
}
