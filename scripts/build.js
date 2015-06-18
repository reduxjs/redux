var sh = require('shelljs');

sh.rm('-rf', 'lib');
sh.exec('babel src --out-dir lib');

sh.mv('lib/react-entry.js', './react.js');
sh.mv('lib/react-native-entry.js', './react-native.js');
