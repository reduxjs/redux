const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions } = require('codemod-cli');

module.exports = function transformer(file, api) {
  const j = getParser(api);
  const options = getOptions();

  return j(file.source)
    .find(j.Identifier)
    .forEach(path => {
      path.node.name = path.node.name
        .split('')
        .reverse()
        .join('');
    })
    .toSource();
};

module.exports.type = 'js';