# Tooling

The tools are chosen so that the rules in this guide are enforced by the machine. Every config below is in
[templates/config/](../templates/config/) and is the one in use, not a suggestion.

## The stack

| Area | Choice |
| --- | --- |
| Framework | Angular 22 (standalone, zoneless, signals) |
| Language | TypeScript 6.0, strict |
| State | NgRx Signals 22, `@ngrx-toolkit/core` 22 |
| Workspace | Nx, pnpm |
| Tests | Jest 30 with `jest-preset-angular` |
| Lint and format | ESLint (flat config) with `angular-eslint`, Prettier |
| Commits | Conventional Commits with an emoji, Husky, lint-staged, commitlint |

The versions are the ones Angular supports. Angular 22 accepts TypeScript `>=6.0 <6.1`, so the TypeScript range moves with
the Angular major, never ahead of it. Check [angular.dev/reference/versions](https://angular.dev/reference/versions) before
you bump either.

## pnpm and Nx

- **Always pnpm.** One package manager, one lockfile. Run Nx through it: `pnpm nx test orders-data-access`.
- **Nx owns the targets.** In an Nx workspace there is no `angular.json`; each project's `project.json` defines build, test
  and lint. Where Angular's docs say `ng build`, run `pnpm nx build <project>`, and use the Nx generators instead of
  `ng generate`.
- `pnpm nx affected -t lint,test` runs only what the current change touches. It is the command CI and a pre-push hook use.
- Name scripts `domain:action` (`start:dev`, `build:ci`, `test:ci`) and keep them in the root `package.json`.

## TypeScript

[tsconfig.strict.json](../templates/config/tsconfig.strict.json) turns on `strict`, `noImplicitOverride`,
`noPropertyAccessFromIndexSignature`, `noImplicitReturns` and the Angular compiler's `strictTemplates`. Strict templates
catch a binding to a renamed signal at build time, which is half the reason to rename things confidently. Do not turn strict
flags off to make a build pass; fix the type.

## ESLint

A flat config at the root, `@nx/enforce-module-boundaries` for the architecture rules
([eslint.boundaries.js](../templates/config/eslint.boundaries.js)), and `angular-eslint` for components and templates. The rules
that matter most:

- `prefer-standalone` and the signal-input rules, as errors.
- The template accessibility config, on and left on. See [08-accessibility.md](08-accessibility.md).
- `no-restricted-imports` for sibling entry points, as described in [01-architecture.md](01-architecture.md).
- No `any`. Where an `any` is truly needed, write `// eslint-disable-next-line` with the reason beside it.

## Prettier

[.prettierrc.json](../templates/config/.prettierrc.json) is short and has no options worth arguing over:

- 120 columns, 2 spaces, single quotes, `trailingComma: all`, `arrowParens: avoid`.
- `singleAttributePerLine` and `bracketSameLine`, so a template diff shows one attribute per changed line.
- `@ianvs/prettier-plugin-sort-imports` with the order `@angular/*`, then `rxjs`, then third-party, then relative.
- `prettier-plugin-tailwindcss` sorts utility classes, and `*.html` uses the `angular` parser.

Pair it with [.editorconfig](../templates/config/.editorconfig). Formatting is never a review comment: the hook formats, so a
reviewer reads logic.

## Commits and hooks

- **Conventional Commits with an emoji:** `fix(orders-data-access): 🐛 keep the page when a reload fails`. The scope is the project
  name, read from the `apps/` and `libs/` folders by [commitlint.config.js](../templates/config/commitlint.config.js), so a
  commit always names what it touches. Run `pnpm cm` (commitizen) to be prompted instead of remembering the format.
- **pre-commit:** `lint-staged` formats and lints only the staged files ([.lintstagedrc.json](../templates/config/.lintstagedrc.json)).
- **commit-msg:** commitlint checks the message.
- **pre-push:** build and test what changed. A broken main is slower than a slow push.
- Husky installs the hooks on `pnpm install`, so a new clone is protected without anyone remembering.

## Coverage

A global threshold of 80% on statements, branches, functions and lines, set in `jest.config`. A new spec reaches full coverage
for its own file; the global number is a floor that catches drift, not a goal to game.

## Working with AI agents

Commit an `AGENTS.md` at the root, and one in each area that has its own rules (`apps/<app>`, `libs/<domain>`). Agents read
the closest one. Keep the root file short: the stack, a repo map, a "read this first, by task" table, the commands, and the list
of places where your rules override the framework's generic guidance. This repository ships that file ready to copy; see
[11-using-with-ai.md](11-using-with-ai.md).

## Rules

<!-- rules -->
- Use pnpm only, and run Nx through it (`pnpm nx ...`); use Nx generators and targets instead of `ng generate` and `ng build` in an Nx workspace.
- Use `pnpm nx affected -t lint,test` for CI and pre-push checks.
- Keep Angular and TypeScript at versions listed together on angular.dev/reference/versions; never move TypeScript ahead of Angular.
- Enable `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns` and `strictTemplates`; never disable a strict flag to pass a build.
- Use an ESLint flat config with `@nx/enforce-module-boundaries`, `angular-eslint`, and the template accessibility rules.
- Do not use `any`; if unavoidable, add an eslint-disable comment with the reason beside it.
- Format with Prettier: 120 columns, single quotes, `trailingComma: all`, `arrowParens: avoid`, one attribute per line, imports sorted `@angular`, `rxjs`, third-party, relative.
- Never raise formatting in review; let the pre-commit hook format.
- Write Conventional Commits with an emoji and the project name as scope; enforce with commitlint.
- Run lint-staged on pre-commit, commitlint on commit-msg, and build and test on pre-push.
- Hold a global coverage threshold of 80% and give every new spec full coverage of its own file.
- Commit an `AGENTS.md` at the root and in areas with their own rules; keep the root file short.
<!-- /rules -->
