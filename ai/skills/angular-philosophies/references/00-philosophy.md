# Philosophy

This is how I write Angular apps, written down so a team, a new hire or an AI agent can write them the same way. It
targets Angular 22 with TypeScript 6.0, zoneless, signals everywhere, NgRx SignalStore for state, and an Nx workspace
split by business domain.

It is a set of defaults, not a law. Every rule comes with the reason behind it, so you can tell when your situation is
different enough to break one.

## Code is a necessary evil

Every line you write is a line someone reads, tests, upgrades and eventually deletes. The best change is the one you
didn't have to make, and the second best is the smallest one that works.

- **Build what is needed today.** YAGNI is the most useful rule I know. A flag, a config option or an abstraction for
  a case that might come later usually costs more than adding it later, because later you know what the case really is.
- **Don't be clever.** Clever code is read at 3am by someone who didn't write it. Boring and obvious wins.
- **Think before adding a dependency.** If the platform does it, use the platform. Angular 22 already ships
  `httpResource`, signal inputs, `linkedSignal`, a router, forms and a control flow syntax. Reach for a library when
  the problem is real, not when the tutorial used one.
- **Delete before you add.** Removing unused code, an old wrapper or a flag nobody sets is progress.
- **Write an abstraction the third time, not the first.** Two copies are cheaper than the wrong shared function. This
  is also how the custom store features in [06-custom-features.md](06-custom-features.md) are meant to appear.

## Leave it better than you found it

When you touch a file, fix the small smell next to your change or leave a `TODO` with a reason. Don't start a rewrite
inside a feature branch. Refactor in small steps with the tests green, and make the next person's change easier than yours
was.

## One place for each thing

Most arguments about structure go away when each kind of code has exactly one home:

- Server state, API calls and the facade a page talks to live in a **signal store**.
- A page's markup and its wiring live in a **component**.
- Anything two features need lives in a **library** with a tag that says what it may depend on.
- A rule a machine can check is a **lint rule**, not a paragraph in a wiki.

[01-architecture.md](01-architecture.md) and [03-signal-store.md](03-signal-store.md) are these ideas made specific.

## Make the right thing the easy thing

Conventions only survive if following them is less work than ignoring them. That is why this repo ships templates (a
store, a test toolkit, config files) and AI instructions as well as prose. Copy the template, change the names, and you
are already following the guide.

## Accessibility and Arabic are not extras

A page that can't be used with a keyboard, or can't be read at arm's length, is not finished. A layout that breaks in
right-to-left is not finished either. Both are cheap to do from the first commit and expensive to retrofit, so they are
part of the defaults. See [07-forms-routing-i18n.md](07-forms-routing-i18n.md) and [08-accessibility.md](08-accessibility.md).

## How to read the rest

Each chapter ends with a short list of rules. The text explains the why; the rules are what a linter, a reviewer or
an AI agent checks. If a rule and the text disagree, the rule is the bug, so open an issue.

| Chapter | What it settles |
| --- | --- |
| [01 Architecture](01-architecture.md) | How the workspace is divided and what may import what |
| [02 Components](02-components.md) | How a component, a template and a file are written |
| [03 Signal store](03-signal-store.md) | The shape of every store and who provides it |
| [04 Data access](04-data-access.md) | Reading, writing, errors and interceptors |
| [05 Toolkit](05-toolkit.md) | Which `@ngrx-toolkit/core` features to use and which to leave |
| [06 Custom features](06-custom-features.md) | Writing your own `signalStoreFeature` |
| [07 Forms, routing, i18n](07-forms-routing-i18n.md) | Forms, lazy routes, translations, RTL |
| [08 Accessibility](08-accessibility.md) | Contrast, focus, keyboard, meaning without colour |
| [09 Testing](09-testing.md) | How to write a spec, with a toolkit to copy |
| [10 Tooling](10-tooling.md) | pnpm, Nx, ESLint, Prettier, commits |
| [11 Using with AI](11-using-with-ai.md) | Skill, plugin, `llms.txt`, `AGENTS.md`, Cursor rules, MCP |

## Rules

<!-- rules -->
- Build only what the current task needs; do not add flags, options or abstractions for hypothetical cases.
- Prefer the Angular platform (`httpResource`, signal APIs, router, forms) over a new dependency.
- Write a shared abstraction the third time the same code appears, not the first.
- When touching a file, fix nearby smells or leave a `TODO` with a reason; never rewrite inside a feature branch.
- Express every rule a machine can check as a lint rule or a type, not as documentation.
- Treat accessibility and right-to-left support as part of "done", not as follow-up work.
<!-- /rules -->
