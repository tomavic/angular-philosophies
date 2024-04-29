// Copy to `jest.config.js` (or adapt your Nx `jest.config.ts`). Jest 30 + jest-preset-angular 17, zoneless.
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // One import path for every test utility. Mirror this alias in tsconfig `paths`.
  moduleNameMapper: { '^@/core/test$': '<rootDir>/src/app/core/test/index.ts' },
  // Transloco ships ES modules; let Jest transform them.
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@jsverse))'],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.(html|svg)$' },
    ],
  },
};
