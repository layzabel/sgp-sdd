import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-config-prettier';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const FR037 = 'Proibido em src/ (FR-037): o SGP não pode enviar dados para fora do navegador.';

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.scannerwork/**',
      'tests/fixtures/**',
      '.next/**',
      'out/**',
      'next-env.d.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  // eslint-config-next/typescript já inclui typescript-eslint "recommended" (mesma instância do
  // plugin), por isso não é repetido aqui.
  ...nextCoreWebVitals,
  ...nextTypescript,
  sonarjs.configs.recommended,
  {
    rules: {
      complexity: ['error', 10],
      'sonarjs/cognitive-complexity': ['error', 15],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: FR037 },
        { name: 'XMLHttpRequest', message: FR037 },
        { name: 'WebSocket', message: FR037 },
        { name: 'EventSource', message: FR037 },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='navigator'][property.name='sendBeacon']",
          message: FR037,
        },
      ],
      'no-restricted-imports': [
        'error',
        { paths: [{ name: 'next/font/google', message: `${FR037} Use a fonte do sistema.` }] },
      ],
    },
  },
  prettier,
];

export default eslintConfig;
