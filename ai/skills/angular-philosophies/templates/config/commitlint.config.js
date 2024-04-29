const fs = require('node:fs');
const path = require('node:path');

// Scopes are the folder names under apps/ and libs/, so a commit names the project it touches.
const scopes = ['apps', 'libs'].flatMap(dir => {
  const base = path.resolve(__dirname, dir);
  return fs.existsSync(base) ? fs.readdirSync(base) : [];
});

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [...scopes, 'global', 'deps', 'ci', 'config']],
    'subject-case': [0],
  },
};
