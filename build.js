var rollup = require( 'rollup' );
var babel = require( 'rollup-plugin-babel' );
var replace = require( 'rollup-plugin-replace' );

var env = process.argv[2] === '--prod' ? 'production' : 'development';

rollup.rollup({
  entry: 'src/index.js',
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    babel()
  ]
}).then(function (bundle) {
  var code = bundle.generate({
    format: 'umd',
    moduleName: 'Redux'
  }).code;

  process.stdout.write(code);
});
