// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/server.js',
      '**/webpack.config*.js',
      // Flow-typed example — cannot be parsed by the TS/JS parser.
      // TODO: figure out a way to lint this using flow instead of typescript
      'examples/todos-flow/**',
      'website/**',
      'docs/**'
    ]
  },

  // ── Core library and test suite (TypeScript, no JSX) ──
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    // `base` wires up the typescript-eslint parser and plugin; `eslintRecommended`
    // disables the core rules that TypeScript already covers (no-undef,
    // no-redeclare, …). Neither turns on stylistic/type-aware rules, so the
    // source and type tests keep their existing latitude (e.g. `any`).
    extends: [
      js.configs.recommended,
      tseslint.configs.base,
      tseslint.configs.eslintRecommended
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      // The core rule flags TypeScript function overloads as redeclarations;
      // the type-aware version understands them while still catching real ones.
      '@typescript-eslint/no-redeclare': 'error',
      // Core no-unused-vars stays off (from eslintRecommended it is not);
      // the type-aware version below replaces it.
      'no-unused-vars': 'off',
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
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false }
      ]
    }
  },
  // Type tests declare values purely to assert their inferred types, so the
  // usual "unused variable" check does not apply.
  {
    files: ['test/**/*.test-d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },

  // ── Example apps (JS/JSX + TS, React) ──
  // These are legacy teaching examples built on older React patterns, so the
  // modern recommended presets are applied leniently — problems are surfaced
  // as warnings rather than failing the lint of the example apps.
  {
    files: ['examples/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended
    ],
    plugins: {
      'react-hooks': reactHooks
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    },
    settings: {
      react: {
        // The example apps do not install React themselves, so pin a version
        // to avoid the "React version not specified" warning.
        version: '18.0'
      }
    },
    rules: {
      // The examples intentionally omit prop-types and rely on the classic
      // JSX runtime, so relax the corresponding React rules.
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'warn',
      // Classic React Hooks linting. The newer compiler-oriented rules from
      // eslint-plugin-react-hooks are not meaningful for these older examples.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // The remaining findings below are pre-existing patterns in this legacy
      // teaching code. They are surfaced as warnings so the example lint stays
      // informative without failing on illustrative code.
      'no-case-declarations': 'warn',
      'no-prototype-builtins': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-useless-assignment': 'warn',
      'react/no-deprecated': 'warn',
      'react/no-unescaped-entities': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn'
    }
  },
  // Parse the TypeScript example files with the typescript-eslint parser.
  {
    files: ['examples/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser
    }
  }
)
