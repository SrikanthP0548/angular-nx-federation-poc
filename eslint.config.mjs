import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  { ignores: ['**/dist', '**/out-tsc'] },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:loader',
              onlyDependOnLibsWithTags: [
                'type:page',
                'type:data-access',
                'type:platform-core',
                'type:ui',
                'type:util'
              ]
            },
            {
              sourceTag: 'type:page',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:platform-core',
                'type:ui',
                'type:util'
              ]
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:platform-core', 'type:util']
            },
            {
              sourceTag: 'type:platform-core',
              onlyDependOnLibsWithTags: ['type:util']
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util']
            }
          ]
        }
      ]
    }
  }
];
