const { NODE_ENV } = process.env

module.exports = {
  presets: [
    '@babel/typescript',
    [
      '@babel/env',
      {
        targets: {
          browsers: ['chrome 95']
        },
        modules: false,
        loose: true
      }
    ]
  ]
}
