var sh = require('shelljs');

sh.exec('istanbul cover node_modules/mocha/bin/_mocha -- --compilers js:babel/register --recursive');
