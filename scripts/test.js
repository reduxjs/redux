var sh = require('shelljs');

sh.env.NODE_ENV = 'test';
sh.exec('mocha --compilers js:babel/register --recursive');
