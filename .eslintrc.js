module.exports = {
  extends: 'react-app',

  overrides: [
    {
      files: 'test/**/*.js',
      env: {
        jest: true,
      },
    },
  ],
}
