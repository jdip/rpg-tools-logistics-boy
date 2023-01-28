module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard-with-typescript',
    'plugin:cypress/recommended',
    'plugin:chai-friendly/recommended'
  ],
  overrides: [{
    files: '*.cy.ts',
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'chai-friendly/no-unused-expressions': 'error'
    }
  }],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  rules: {
  },
  plugins: [
    'cypress',
    'chai-friendly'
  ]
}
