import type { Node, PluginObj, PluginPass } from '@babel/core'
import * as helperModuleImports from '@babel/helper-module-imports'
import * as fs from 'node:fs'
import * as path from 'node:path'

type Babel = typeof import('@babel/core')

const formatProdErrorMessageAbsoluteFilePath = path.join(
  import.meta.dirname,
  'src',
  'utils',
  'formatProdErrorMessage.ts'
)

/**
 * Represents the options for the {@linkcode mangleErrorsPlugin}.
 *
 * @internal
 */
export type MangleErrorsPluginOptions = {
  /**
   * Whether to minify the error messages or not.
   * If `true`, the error messages will be replaced with an index
   * that maps object lookup.
   *
   * @default false
   */
  minify?: boolean | undefined
}

/**
 * Converts an AST type into a JavaScript string so that it can be added to the error message lookup.
 *
 * Adapted from React (https://github.com/facebook/react/blob/master/scripts/shared/evalToString.js) with some
 * adjustments.
 */
const evalToString = (
  ast: Node | { type: 'Literal'; value: string }
): string => {
  switch (ast.type) {
    case 'StringLiteral':
    case 'Literal': // ESLint
      return ast.value
    case 'BinaryExpression': // `+`
      if (ast.operator !== '+') {
        throw new Error('Unsupported binary operator ' + ast.operator)
      }
      return evalToString(ast.left) + evalToString(ast.right)
    case 'TemplateLiteral':
      return ast.quasis.reduce(
        (concatenatedValue, templateElement) =>
          concatenatedValue + templateElement.value.raw,
        ''
      )
    case 'Identifier':
      return ast.name
    default:
      throw new Error('Unsupported type ' + ast.type)
  }
}

/**
 * Transforms a `throw new Error` statement based on the `minify` argument, resulting in a smaller bundle size
 * for consumers in production.
 *
 * If `minify` is enabled, the error message will be replaced with an index that maps to an object lookup.
 *
 * If `minify` is disabled, a conditional statement will be added to check `process.env.NODE_ENV`, which will output
 * an error number index in production or the actual error message in development. This allows consumers using Webpack
 * or another build tool to have these messages in development but only the error index in production.
 *
 * E.g.
 *  Before:
 *    throw new Error("This is my error message.");
 *    throw new Error("This is a second error message.");
 *
 *  After (with minify):
 *    throw new Error(0);
 *    throw new Error(1);
 *
 *  After (without minify):
 *    throw new Error(process.env.NODE_ENV === 'production' ? 0 : "This is my error message.");
 *    throw new Error(process.env.NODE_ENV === 'production' ? 1 : "This is a second error message.");
 */
export const mangleErrorsPlugin = (
  babel: Babel,
  options: MangleErrorsPluginOptions
): PluginObj<PluginPass & MangleErrorsPluginOptions> => {
  const t = babel.types
  // When the plugin starts up, we'll load in the existing file. This allows us to continually add to it so that the
  // indexes do not change between builds.
  let errorsFiles = ''
  if (fs.existsSync('errors.json')) {
    errorsFiles = fs.readFileSync('errors.json').toString()
  }
  const errors = Object.values(JSON.parse(errorsFiles || '{}'))
  // This variable allows us to skip writing back to the file if the errors array hasn't changed
  let changeInArray = false

  return {
    name: 'mangle-errors-plugin',
    pre: () => {
      changeInArray = false
    },
    visitor: {
      ThrowStatement(path) {
        if (
          !('arguments' in path.node.argument) ||
          !t.isNewExpression(path.node.argument)
        ) {
          return
        }
        const args = path.node.argument.arguments
        const { minify = false } = options

        if (args && args[0]) {
          // Skip running this logic when certain types come up:
          //  Identifier comes up when a variable is thrown (E.g. throw new error(message))
          //  NumericLiteral, CallExpression, and ConditionalExpression is code we have already processed

          const firstArgument = args[0]

          if (
            firstArgument.type === 'Identifier' ||
            firstArgument.type === 'NumericLiteral' ||
            firstArgument.type === 'ConditionalExpression' ||
            firstArgument.type === 'CallExpression' ||
            firstArgument.type === 'ObjectExpression' ||
            firstArgument.type === 'MemberExpression' ||
            !t.isExpression(firstArgument) ||
            !t.isIdentifier(path.node.argument.callee)
          ) {
            return
          }

          const errorName = path.node.argument.callee.name

          const errorMsgLiteral = evalToString(firstArgument)

          if (errorMsgLiteral.includes('Super expression')) {
            // ignore Babel runtime error message
            return
          }

          // Attempt to get the existing index of the error. If it is not found, add it to the array as a new error.
          let errorIndex = errors.indexOf(errorMsgLiteral)
          if (errorIndex === -1) {
            errors.push(errorMsgLiteral)
            errorIndex = errors.length - 1
            changeInArray = true
          }

          // Import the error message function
          const formatProdErrorMessageIdentifier = helperModuleImports.addNamed(
            path,
            'formatProdErrorMessage',
            formatProdErrorMessageAbsoluteFilePath,
            { nameHint: 'formatProdErrorMessage' }
          )

          // Creates a function call to output the message to the error code page on the website
          const prodMessage = t.callExpression(
            formatProdErrorMessageIdentifier,
            [t.numericLiteral(errorIndex)]
          )

          const prodMessageWithPureAnnotation = t.addComment(
            prodMessage,
            'leading',
            ' @__PURE__ ',
            false
          )

          if (minify) {
            path.replaceWith(
              t.throwStatement(
                t.newExpression(t.identifier(errorName), [
                  prodMessageWithPureAnnotation
                ])
              )
            )
          } else {
            path.replaceWith(
              t.throwStatement(
                t.newExpression(t.identifier(errorName), [
                  t.conditionalExpression(
                    t.binaryExpression(
                      '===',
                      t.memberExpression(
                        t.memberExpression(
                          t.identifier('process'),
                          t.identifier('env')
                        ),
                        t.identifier('NODE_ENV')
                      ),
                      t.stringLiteral('production')
                    ),
                    prodMessageWithPureAnnotation,
                    firstArgument
                  )
                ])
              )
            )
          }
        }
      }
    },
    post: () => {
      // If there is a new error in the array, convert it to an indexed object and write it back to the file.
      if (changeInArray) {
        fs.writeFileSync('errors.json', JSON.stringify({ ...errors }, null, 2))
      }
    }
  }
}

export default mangleErrorsPlugin
