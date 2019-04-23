module.exports = {
  extends: 'react-app',

  settings: {
    react: {
      version: '16.8'
    }
  },

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
