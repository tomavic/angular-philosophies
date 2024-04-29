# Angular Philosophies

How I write Angular apps, as instructions an AI coding tool can follow, a guide you can read, and templates you can copy. It
covers Angular 22 with TypeScript 6.0, zoneless and signals, NgRx SignalStore with its toolkit, and an Nx workspace divided by
business domain.

The idea is simple: the advice I would give you while you work, available to your AI tool while it works.

Read it as a website, with an animated explanation for every chapter, in English and in Arabic: [tomavic.github.io/angular-philosophies](https://tomavic.github.io/angular-philosophies/).

## Use it with AI

Pick the line for your tool. Each one installs the same rules.

```bash
# Claude Code: the skill and an MCP server in one install
/plugin marketplace add tomavic/angular-philosophies
/plugin install angular-philosophies@angular-philosophies

# Any agent (Codex, Copilot, Gemini CLI, and more): a drop-in AGENTS.md at your project root
curl -o AGENTS.md https://raw.githubusercontent.com/tomavic/angular-philosophies/main/ai/AGENTS.md

# Cursor: run from your project root
mkdir -p .cursor/rules && curl -sSL https://github.com/tomavic/angular-philosophies/archive/refs/heads/main.tar.gz | tar -xz --strip-components=3 -C .cursor/rules angular-philosophies-main/ai/cursor
```

No file access, such as a chat window? Give it [`llms-full.txt`](ai/llms-full.txt), the whole guide in one file.
[Chapter 11](docs/11-using-with-ai.md) covers every option, including the Claude skill on its own and the MCP server.

If your project has its own rules, write them above the generated ones. The project wins over the guide.

## What is in this repository

| Path | What it is |
| --- | --- |
| [`docs/`](docs) | The 12 chapters. This is the only part written by hand, and the source of everything else. |
| [`templates/`](templates) | Working code to copy: stores, a test toolkit, config files. See [Copy it](#copy-it). |
| [`site/`](site) | The website: plain HTML, CSS and JavaScript, deployed to GitHub Pages by [a workflow](.github/workflows/pages.yml). All of it is generated from `docs/` and `templates/`, so it is never edited by hand. |
| [`ai/`](ai) | Everything for AI tools: the `AGENTS.md` file, the Cursor rules, the Claude skill, `llms-full.txt` (the whole guide in one file) and a small MCP server that serves one chapter at a time. |
| `.claude-plugin/`, `.mcp.json` | The manifests that make the repo installable as a Claude Code plugin. They have to sit at the root. |
| `llms.txt` | An index of the chapters, for tools that read a URL. |

Everything except `docs/` and `templates/` is generated from them: each chapter ends with a short list of rules, and those
lists become the AI files. That is why they never disagree with the text.

Last verified against Angular 22.2, `@ngrx/signals` 22.0 and `@ngrx-toolkit/core` 22.0 (November 2026). The code in
[`templates/`](templates) compiles under strict TypeScript, its component templates compile with `strictTemplates`, and its
specs pass on Jest 30. Snippets inside the chapters are excerpts of those files.

## The short version

- A **signal store is the facade** for its page. Components read signals and call methods. They never inject `HttpClient`,
  never subscribe, and never call `load()` after a filter changes.
- **Reads are resources derived from state.** Writes are mutations. Every resource has a default value, so a template never
  needs `?.`.
- **One store per view**, provided by the component, so state resets when the user leaves.
- **Libraries are split by domain and type**, and a lint rule decides who may import whom.
- Code stays in the app until a **second consumer** appears. Then it becomes a library.
- Write an abstraction **the third time**, not the first.
- **Fakes, not stubs.** A spec renders the real file and fakes everything it injects, and each test starts from a fresh world.
- **Accessibility and right-to-left** are part of done: measured contrast, keyboard, logical CSS properties.

## Read it

| Chapter | What it settles |
| --- | --- |
| [00 Philosophy](docs/00-philosophy.md) | YAGNI, one place for each thing, make the right thing the easy thing |
| [01 Architecture](docs/01-architecture.md) | Domains, tags, layers, module boundaries, where new code goes |
| [02 Components](docs/02-components.md) | Standalone, zoneless, signal APIs, templates, files |
| [03 Signal store](docs/03-signal-store.md) | The shape of a store, who provides it, one per view |
| [04 Data access](docs/04-data-access.md) | `httpResource`, mutations, interceptors, what a failed reload keeps |
| [05 Toolkit](docs/05-toolkit.md) | Which `@ngrx-toolkit/core` extensions to adopt, wait for, or avoid |
| [06 Custom features](docs/06-custom-features.md) | Writing a `signalStoreFeature`, `withFeature`, events between stores |
| [07 Forms, routing, i18n](docs/07-forms-routing-i18n.md) | Reactive Forms, lazy routes, Transloco, Arabic and RTL |
| [08 Accessibility](docs/08-accessibility.md) | Contrast you measure, focus, keyboard, meaning without colour |
| [09 Testing](docs/09-testing.md) | The way I write a spec, in seven steps, with a toolkit |
| [10 Tooling](docs/10-tooling.md) | pnpm, Nx, ESLint, Prettier, commits, hooks |
| [11 Using with AI](docs/11-using-with-ai.md) | Skill, plugin, `AGENTS.md`, Cursor rules, `llms.txt`, MCP |

Start with chapter 03 if you only have ten minutes.

## Copy it

[`templates/`](templates) holds working code, not snippets in a document. Copy a file, rename the shop domain (orders,
billing) to yours, and you are following the guide.

| Folder | What is in it |
| --- | --- |
| [`templates/signal-store`](templates/signal-store) | A list store with a resource and a mutation, the page it feeds, `guardedDevtools`, storage sync, three custom features, an events example, `apiStatus` |
| [`templates/testing`](templates/testing) | A test toolkit (`render`, `fakeService`, `fakeHttp`, `fakeRoute`, `setResource`) with its own specs, a Jest config, and example specs for a page, a dialog and a store |
| [`templates/a11y`](templates/a11y) | A contrast ratio function with a spec |
| [`templates/config`](templates/config) | Prettier, EditorConfig, lint-staged, commitlint, strict `tsconfig` flags and the Nx module-boundary rules |

## Contributing

Change the chapter in `docs/`, not the generated files (`ai/` except `ai/mcp/server.mjs`, `llms.txt`, `site/chapters/`, `site/data/`). Keep code
in a chapter short and put anything longer in `templates/`, with a spec if it has logic. An issue that says a rule is wrong and
why is as useful as a pull request.

## License

[MIT](LICENSE). Use any of it, in any project; keep the copyright notice.

The name and the idea come from [React Philosophies](https://github.com/mithi/react-philosophies) by mithi.
Maintained by Hatem ([@tomavic](https://github.com/tomavic)).
