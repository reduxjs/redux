module.exports = function () {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source
        source.value = source.value.replace(/^lodash($|\/)/, 'lodash-es$1')
      }
    }
  }
}
