const glob = require('glob');
const fs = require('fs');
const es3ify = require('es3ify');

glob('./@(lib|dist|es)/**/*.js', (err, files) => {
  if (err) {
    throw err;
  }

  files.forEach((file) => {
    fs.readFile(file, 'utf8', (error, data) => {
      if (error) {
        throw error;
      }

      fs.writeFile(file, es3ify.transform(data), (writeErr) => {
        if (writeErr) {
          throw writeErr;
        }

        console.log(`es3ified ${file}`); // eslint-disable-line no-console
      });
    });
  });
});
