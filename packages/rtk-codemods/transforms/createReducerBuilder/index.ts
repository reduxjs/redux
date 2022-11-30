import { ExpressionKind, SpreadElementKind } from 'ast-types/gen/kinds';
import {
  ExpressionStatement,
  JSCodeshift,
  ObjectExpression,
  ObjectMethod,
  ObjectProperty,
  Transform,
} from 'jscodeshift';

type ObjectKey = ObjectMethod['key'] & ObjectProperty['key'];

function wrapInAddCaseExpression(
  j: JSCodeshift,
  addCaseArgs: (ExpressionKind | SpreadElementKind)[]
) {
  const identifier = j.identifier('builder');
  return j.expressionStatement(
    j.callExpression(j.memberExpression(identifier, j.identifier('addCase'), false), addCaseArgs)
  );
}

export function reducerPropsToBuilderExpression(j: JSCodeshift, defNode: ObjectExpression) {
  const caseExpressions: ExpressionStatement[] = [];
  for (let property of defNode.properties) {
    let addCaseArgs: (ExpressionKind | SpreadElementKind)[] = [];
    switch (property.type) {
      case 'ObjectMethod': {
        const { key, params, body } = property;
        if (body) {
          addCaseArgs = [key, j.arrowFunctionExpression(params, body)];
        }
        break;
      }
      case 'ObjectProperty': {
        const { key } = property;

        switch (property.value.type) {
          case 'ArrowFunctionExpression':
          case 'FunctionExpression': {
            const { params, body } = property.value;
            if (body) {
              addCaseArgs = [key, j.arrowFunctionExpression(params, body)];
            }
            break;
          }
          case 'Identifier':
          case 'MemberExpression': {
            const { value } = property;
            addCaseArgs = [key, value];
            break;
          }
        }
      }
    }
    if (!addCaseArgs.length) {
      continue;
    }
    caseExpressions.push(wrapInAddCaseExpression(j, addCaseArgs));
  }

  return j.arrowFunctionExpression([j.identifier('builder')], j.blockStatement(caseExpressions));
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
        const reducerObjectExpression = path.node.arguments[1] as ObjectExpression;
        j(path).replaceWith(
          j.callExpression(j.identifier('createReducer'), [
            path.node.arguments[0],
            reducerPropsToBuilderExpression(j, reducerObjectExpression),
          ])
        );
      })
      .toSource({
        arrowParensAlways: true,
      })
  );
};

export const parser = 'tsx';

export default transform;
