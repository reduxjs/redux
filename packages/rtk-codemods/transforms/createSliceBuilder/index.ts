import { namedTypes } from 'ast-types';
import { ExpressionKind, PatternKind } from 'ast-types/gen/kinds';
import {
  BlockStatement,
  CallExpression,
  Expression,
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
  key: ObjectKey,
  params: PatternKind[],
  body: BlockStatement | ExpressionKind
) {
  const identifier = j.identifier('builder');
  return j.expressionStatement(
    j.callExpression(j.memberExpression(identifier, j.identifier('addCase'), false), [
      key,
      j.arrowFunctionExpression(params, body),
    ])
  );
}

export function reducerPropsToBuilderExpression(j: JSCodeshift, defNode: ObjectExpression) {
  const caseExpressions: ExpressionStatement[] = [];
  for (let property of defNode.properties) {
    let key: ObjectKey = null as any;
    let params: PatternKind[] = [];
    let body: BlockStatement | ExpressionKind = null as any;
    switch (property.type) {
      case 'ObjectMethod': {
        key = property.key;
        params = property.params;
        body = property.body;
        break;
      }
      case 'ObjectProperty': {
        switch (property.value.type) {
          case 'ArrowFunctionExpression':
          case 'FunctionExpression': {
            key = property.key;
            params = property.value.params;
            body = property.value.body;
            break;
          }
        }
      }
    }
    if (!body) {
      continue;
    }
    caseExpressions.push(wrapInAddCaseExpression(j, key, params, body));
  }

  return j.arrowFunctionExpression([j.identifier('builder')], j.blockStatement(caseExpressions));
}

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;

  return (
    j(file.source)
      // @ts-ignore some expression mismatch
      .find(j.CallExpression, {
        callee: { name: 'createSlice' },
        // @ts-ignore some expression mismatch
        arguments: { 0: { type: 'ObjectExpression' } },
      })

      .filter((path) => {
        const createSliceArgsObject = path.node.arguments[0] as ObjectExpression;
        return createSliceArgsObject.properties.some(
          (p) =>
            p.type === 'ObjectProperty' &&
            p.key.type === 'Identifier' &&
            p.key.name === 'extraReducers' &&
            p.value.type === 'ObjectExpression'
        );
      })
      .forEach((path) => {
        const createSliceArgsObject = path.node.arguments[0] as ObjectExpression;
        j(path).replaceWith(
          j.callExpression(j.identifier('createSlice'), [
            j.objectExpression(
              createSliceArgsObject.properties.map((p) => {
                if (
                  p.type === 'ObjectProperty' &&
                  p.key.type === 'Identifier' &&
                  p.key.name === 'extraReducers' &&
                  p.value.type === 'ObjectExpression'
                ) {
                  const expressionStatement = reducerPropsToBuilderExpression(
                    j,
                    p.value as ObjectExpression
                  );
                  return j.objectProperty(p.key, expressionStatement);
                }
                return p;
              })
            ),
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
