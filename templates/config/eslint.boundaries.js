// Add this block to the root `eslint.config.js` of an Nx workspace (flat config).
// Every lib has exactly one `scope:*` tag and one `type:*` tag in its project.json.
const boundaries = {
  files: ['**/*.ts'],
  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: false,
        allow: [],
        depConstraints: [
          // Scope: who may depend on which domain.
          { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          { sourceTag: 'scope:orders', onlyDependOnLibsWithTags: ['scope:orders', 'scope:shared'] },
          { sourceTag: 'scope:billing', onlyDependOnLibsWithTags: ['scope:billing', 'scope:shared'] },
          { sourceTag: 'scope:app', onlyDependOnLibsWithTags: ['scope:orders', 'scope:billing', 'scope:shared'] },

          // Type: dependencies flow strictly downward.
          { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
          { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:util', 'type:data-access', 'type:core'] },
          { sourceTag: 'type:core', onlyDependOnLibsWithTags: ['type:util', 'type:data-access', 'type:core'] },
          {
            sourceTag: 'type:ui',
            onlyDependOnLibsWithTags: ['type:util', 'type:data-access', 'type:core', 'type:ui'],
          },
          {
            sourceTag: 'type:feature',
            onlyDependOnLibsWithTags: ['type:util', 'type:data-access', 'type:core', 'type:ui', 'type:feature'],
          },
          {
            sourceTag: 'type:shell',
            onlyDependOnLibsWithTags: [
              'type:util',
              'type:data-access',
              'type:core',
              'type:ui',
              'type:feature',
              'type:shell',
            ],
          },
        ],
      },
    ],
  },
};

// Nx boundaries only apply between projects. Sibling entry points inside one lib need `no-restricted-imports`
// in that lib's own eslint config, for example in libs/orders/feature/checkout/eslint.config.js:
const siblingEntries = {
  files: ['corporate/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: ['**/guest/**', '@shop/orders/feature/checkout/guest'] }] }],
  },
};

module.exports = { boundaries, siblingEntries };
