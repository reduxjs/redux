import { namedTypes } from 'ast-types';
import { ExpressionKind } from 'ast-types/gen/kinds';
import { JSCodeshift, Transform } from 'jscodeshift';

function wrapInAddCaseExpression(
  j: JSCodeshift,
  member: namedTypes.Identifier,
  arrowArguments: any[]
) {
  return j.callExpression(
    j.memberExpression(member, j.identifier('addCase'), false),
    arrowArguments
  );
}

export function reducerPropsToBuilderExpression(
  j: JSCodeshift,
  defNode: namedTypes.SpreadElement | ExpressionKind
) {
  // @ts-ignore
  const [firstCase, ...restOfCases] = defNode.properties;

  const expressionStatement = restOfCases.reduce((acc: any, c: any) => {
    return wrapInAddCaseExpression(j, acc, [c.key, c.value]);
  }, wrapInAddCaseExpression(j, j.identifier('builder'), [firstCase.key, firstCase.value]));

  return j.arrowFunctionExpression(
    [j.identifier('builder')],
    j.blockStatement([j.expressionStatement(expressionStatement)])
  );
}

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;

  return (
    j(file.source)
      // @ts-ignore some expression mismatch
      .find(j.CallExpression, {
        callee: { name: 'createReducer' },
        // @ts-ignore some expression mismatch
        arguments: { 1: { type: 'ObjectExpression' } },
      })
      .forEach((path) => {
        j(path).replaceWith(
          j.callExpression(j.identifier('createReducer'), [
            path.node.arguments[0],
            reducerPropsToBuilderExpression(j, path.node.arguments[1]),
          ])
        );
      })
      .toSource()
  );
};

export default transform;
