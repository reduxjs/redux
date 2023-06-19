module.exports = {
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked'
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname
  },

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

    // These off/not-configured-the-way-we-want lint rules we like & opt into
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowNever: true
      }
    ],

    // Todo: investigate whether we'd like these on
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/consistent-indexed-object-style': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/prefer-function-type': 'off',
    '@typescript-eslint/sort-type-constituents': 'off',
    '@typescript-eslint/unbound-method': 'off',
    'prefer-rest-params': 'off',

    // These lint rules don't make sense for us but are enabled in the preset configs
    '@typescript-eslint/no-unused-expressions': 'off'
  }
}
