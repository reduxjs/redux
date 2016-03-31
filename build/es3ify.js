var glob = require('glob')
var fs = require('fs')
var es3ify = require('es3ify')

glob('./@(lib|dist|es)/**/*.js', function (err, files) {
  if (err) {
    throw err
  }

  files.forEach(function (file) {
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        throw err
      }

      fs.writeFile(file, es3ify.transform(data), function (err) {
        if (err) {
          throw err
        }

        console.log('es3ified ' + file) // eslint-disable-line no-console
      })
    })
  })
})
