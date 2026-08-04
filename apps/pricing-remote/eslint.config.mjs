import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'pricing',
          style: 'camelCase',
        },
      ],
      // Domain-scoped prefix, deliberately NOT the `ca-` prefix used for the
      // published custom-element tags. A component whose selector equals its
      // custom-element tag can be instantiated by both Angular and the
      // browser's element upgrade, which double-renders it (doc section 7.3).
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'pricing',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
