import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  {
    ignores: ['node_modules/**', 'coverage/**', '.scannerwork/**', 'tests/fixtures/**'],
  },
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  {
    rules: {
      complexity: ['error', 10],
      'sonarjs/cognitive-complexity': ['error', 15],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  prettier,
];

export default eslintConfig;
