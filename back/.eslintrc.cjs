module.exports = {
  env: {
    es2021: true,
    node: true
  },
  globals: { describe: true, it: true, after: true, before: true },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', {
      before: false,
      after: true
    }],
    complexity: ['warn', 15],
    'computed-property-spacing': ['error', 'never'],
    'consistent-return': 'warn',
    indent: ['error', 2, {
      SwitchCase: 1
    }],
    'dot-notation': 'warn',
    'eol-last': ['error', 'always'],
    'func-call-spacing': ['error', 'never'],
    'key-spacing': ['error', {
      mode: 'minimum',
      beforeColon: false,
      afterColon: true
    }],
    'linebreak-style': ['error', 'unix'],
    'max-len': ['warn', 100],
    'max-lines': ['warn', {
      max: 250,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-params': ['warn', 4],
    'max-statements': ['warn', 30],
    'new-parens': 'error',
    'no-compare-neg-zero': 'warn',
    'no-else-return': 'warn',
    'no-empty': ['error', {
      allowEmptyCatch: true
    }],
    'no-floating-decimal': 'error',
    'no-labels': 'error',
    'no-lonely-if': 'error',
    'no-multiple-empty-lines': ['error', {
      max: 2,
      maxBOF: 0,
      maxEOF: 1
    }],
    'no-multi-spaces': 'off',
    'no-multi-str': 'error',
    'no-nested-ternary': 'error',
    'no-unused-vars': ['error'],
    'no-useless-concat': 'error',
    'object-curly-spacing': ['error', 'always'],
    'object-curly-newline': ['error', {
      multiline: true,
      consistent: true
    }],
    'object-property-newline': ['error', {
      allowMultiplePropertiesPerLine: true
    }],
    'operator-linebreak': ['error', 'before'],
    'prefer-promise-reject-errors': 'error',
    'prefer-const': 'warn',
    radix: ['error', 'always'],
    semi: ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'spaced-comment': ['error', 'always'],
    'space-unary-ops': ['error', {
      words: false,
      nonwords: false
    }],
    quotes: ['warn', 'single', {
      allowTemplateLiterals: true
    }],
    'valid-jsdoc': ['warn', {
      'requireReturn': false
    }],
    'wrap-iife': ['error', 'inside']
  }
};
