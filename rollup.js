const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const fs = require('fs');
const uglifyjs = require('uglifyjs');
const argv = require('yargs').argv;

rollup.rollup({
  entry: './src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}).then(function promiseHandler(bundle) {
  const results = bundle.generate({
    format: 'umd',
    moduleName: 'Redux'
  });
  var code = results.code;

  if (argv.production) {
    code = code.replace('process.env.NODE_ENV', '"production"');
    code = uglifyjs.minify(code, { fromString: true }).code;
  }

  fs.writeFileSync('./dist/redux.rollup.min.js', code);
}).catch(function(err) {
  console.error(err);
});
