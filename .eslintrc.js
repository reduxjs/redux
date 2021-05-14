module.exports = {
  extends: 'react-app',

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  settings: {
    react: {
      version: '17'
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {}
    }
  },

  rules: {
    'jsx-a11y/href-no-hash': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  }
}
