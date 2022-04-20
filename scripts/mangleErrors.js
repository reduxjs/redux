const fs = require('fs')
const helperModuleImports = require('@babel/helper-module-imports')

/**
 * Converts an AST type into a javascript string so that it can be added to the error message lookup.
 *
 * Adapted from React (https://github.com/facebook/react/blob/master/scripts/shared/evalToString.js) with some
 * adjustments
 */
const evalToString = ast => {
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
 * Takes a `throw new error` statement and transforms it depending on the minify argument. Either option results in a
 * smaller bundle size in production for consumers.
 *
 * If minify is enabled, we'll replace the error message with just an index that maps to an arrow object lookup.
 *
 * If minify is disabled, we'll add in a conditional statement to check the process.env.NODE_ENV which will output a
 * an error number index in production or the actual error message in development. This allows consumers using webpack
 * or another build tool to have these messages in development but have just the error index in production.
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
 *  After: (without minify):
 *    throw new Error(node.process.NODE_ENV === 'production' ? 0 : "This is my error message.");
 *    throw new Error(node.process.NODE_ENV === 'production' ? 1 : "This is a second error message.");
 */
module.exports = babel => {
  const t = babel.types
  // When the plugin starts up, we'll load in the existing file. This allows us to continually add to it so that the
  // indexes do not change between builds.
  let errorsFiles = ''
  if (fs.existsSync('errors.json')) {
    errorsFiles = fs.readFileSync('errors.json').toString()
  }
  let errors = Object.values(JSON.parse(errorsFiles || '{}'))
  // This variable allows us to skip writing back to the file if the errors array hasn't changed
  let changeInArray = false

  return {
    pre: () => {
      changeInArray = false
    },
    visitor: {
      ThrowStatement(path, file) {
        const arguments = path.node.argument.arguments
        const minify = file.opts.minify

        if (arguments && arguments[0]) {
          // Skip running this logic when certain types come up:
          //  Identifier comes up when a variable is thrown (E.g. throw new error(message))
          //  NumericLiteral, CallExpression, and ConditionalExpression is code we have already processed
          if (
            path.node.argument.arguments[0].type === 'Identifier' ||
            path.node.argument.arguments[0].type === 'NumericLiteral' ||
            path.node.argument.arguments[0].type === 'ConditionalExpression' ||
            path.node.argument.arguments[0].type === 'CallExpression'
          ) {
            return
          }

          const errorMsgLiteral = evalToString(path.node.argument.arguments[0])

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
          const formatProdErrorMessageIdentifier = helperModuleImports.addDefault(
            path,
            'src/utils/formatProdErrorMessage',
            { nameHint: 'formatProdErrorMessage' }
          )

          // Creates a function call to output the message to the error code page on the website
          const prodMessage = t.callExpression(
            formatProdErrorMessageIdentifier,
            [t.numericLiteral(errorIndex)]
          )

          if (minify) {
            path.replaceWith(
              t.throwStatement(
                t.newExpression(t.identifier('Error'), [prodMessage])
              )
            )
          } else {
            path.replaceWith(
              t.throwStatement(
                t.newExpression(t.identifier('Error'), [
                  t.conditionalExpression(
                    t.binaryExpression(
                      '===',
                      t.identifier('process.env.NODE_ENV'),
                      t.stringLiteral('production')
                    ),
                    prodMessage,
                    path.node.argument.arguments[0]
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
