module.exports = {
  extends: 'react-app',

  rules: {
    'jsx-a11y/href-no-hash': 'off'
  },

  overrides: [
    {
      files: 'test/**/*.js',
      env: {
        jest: true,
      },
    },
  ],
}
