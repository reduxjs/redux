import ts from 'typescript';
import { factory } from './utils/factory';

const defaultEndpointBuilder = factory.createIdentifier('build');

export type ObjectPropertyDefinitions = Record<string, ts.Expression | undefined>;
export function generateObjectProperties(obj: ObjectPropertyDefinitions) {
  return Object.entries(obj)
    .filter(([_, v]) => v)
    .map(([k, v]) => factory.createPropertyAssignment(factory.createIdentifier(k), v as ts.Expression));
}

export function generateImportNode(pkg: string, namedImports: Record<string, string>, defaultImportName?: string) {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      defaultImportName !== undefined ? factory.createIdentifier(defaultImportName) : undefined,
      factory.createNamedImports(
        Object.entries(namedImports).map(([propertyName, name]) =>
          factory.createImportSpecifier(
            name === propertyName ? undefined : factory.createIdentifier(propertyName),
            factory.createIdentifier(name)
          )
        )
      )
    ),
    factory.createStringLiteral(pkg)
  );
}

export function generateCreateApiCall({
  endpointBuilder = defaultEndpointBuilder,
  endpointDefinitions,
  tag,
}: {
  endpointBuilder?: ts.Identifier;
  endpointDefinitions: ts.ObjectLiteralExpression;
  tag: boolean;
}) {
  const injectEndpointsObjectLiteralExpression = factory.createObjectLiteralExpression(
    generateObjectProperties({
      endpoints: factory.createArrowFunction(
        undefined,
        undefined,
        [
          factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            endpointBuilder,
            undefined,
            undefined,
            undefined
          ),
        ],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        factory.createParenthesizedExpression(endpointDefinitions)
      ),
      overrideExisting: factory.createFalse(),
    }),
    true
  );
  if (tag) {
    const enhanceEndpointsObjectLiteralExpression = factory.createObjectLiteralExpression(
      [factory.createShorthandPropertyAssignment(factory.createIdentifier('addTagTypes'), undefined)],
      true
    )
    return factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(
          factory.createIdentifier("injectedRtkApi"),
          undefined,
          undefined,
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createCallExpression(
                factory.createPropertyAccessExpression(
                  factory.createIdentifier("api"),
                  factory.createIdentifier("enhanceEndpoints")
                ),
                undefined,
                [enhanceEndpointsObjectLiteralExpression]
              ),
              factory.createIdentifier("injectEndpoints")
            ),
            undefined,
            [injectEndpointsObjectLiteralExpression]
          )
        )],
        ts.NodeFlags.Const
      )
    );
  }

  return factory.createVariableStatement(
    undefined,
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('injectedRtkApi'),
          undefined,
          undefined,
          factory.createCallExpression(
            factory.createPropertyAccessExpression(
              factory.createIdentifier('api'),
              factory.createIdentifier('injectEndpoints')
            ),
            undefined,
            [injectEndpointsObjectLiteralExpression]
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}

export function generateEndpointDefinition({
  operationName,
  type,
  Response,
  QueryArg,
  queryFn,
  endpointBuilder = defaultEndpointBuilder,
  extraEndpointsProps,
  tags,
}: {
  operationName: string;
  type: 'query' | 'mutation';
  Response: ts.TypeReferenceNode;
  QueryArg: ts.TypeReferenceNode;
  queryFn: ts.Expression;
  endpointBuilder?: ts.Identifier;
  extraEndpointsProps: ObjectPropertyDefinitions;
  tags: string[];
}) {
  const objectProperties = generateObjectProperties({ query: queryFn, ...extraEndpointsProps });
  if (tags.length > 0) {
    objectProperties.push(
      factory.createPropertyAssignment(
        factory.createIdentifier(type === 'query' ? 'providesTags' : 'invalidatesTags'),
        factory.createArrayLiteralExpression(tags.map((tag) => factory.createStringLiteral(tag), false))
      )
    )
  }
  return factory.createPropertyAssignment(
    factory.createIdentifier(operationName),

    factory.createCallExpression(
      factory.createPropertyAccessExpression(endpointBuilder, factory.createIdentifier(type)),
      [Response, QueryArg],
      [
        factory.createObjectLiteralExpression(
          objectProperties,
          true
        ),
      ]
    ),
  );
}

export function generateTagTypes({ addTagTypes }: { addTagTypes: string[] }) {
  return factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          factory.createIdentifier('addTagTypes'),
          undefined,
          undefined,
          factory.createAsExpression(
            factory.createArrayLiteralExpression(
              addTagTypes.map((tagType) => factory.createStringLiteral(tagType)),
              true
            ),
            factory.createTypeReferenceNode(factory.createIdentifier('const'), undefined)
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}
