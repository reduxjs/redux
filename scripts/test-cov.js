var sh = require('shelljs');

sh.exec('istanbul cover node_modules/.bin/_mocha -- --compilers js:babel/register --recursive');
