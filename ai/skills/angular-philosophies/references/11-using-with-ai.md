# Using this guide with AI

The guide is written so that a person can read it and a tool can follow it. Every chapter ends with a block of short,
imperative rules, and those blocks are collected into formats that AI coding tools already understand. Pick the one your
tool uses. They all carry the same rules, because they are generated from the same chapters.

| Format | Files | Works with |
| --- | --- | --- |
| Claude Code plugin | `.claude-plugin/`, `.mcp.json`, `ai/skills/` | Claude Code |
| Claude skill | `ai/skills/angular-philosophies/` | Claude Code, the Claude apps, anything that loads `SKILL.md` |
| `AGENTS.md` | `ai/AGENTS.md` | Codex, Cursor, Copilot, Gemini CLI, Claude Code and most other agents |
| Cursor rules | `ai/cursor/*.mdc` | Cursor |
| `llms.txt` | `llms.txt`, `ai/llms-full.txt` | Any tool that can read a URL |
| MCP server | `ai/mcp/server.mjs` | Any MCP client |

The generated files are not edited by hand. To change a rule, change the chapter in `docs/` and the files are rebuilt from it.

## Claude Code plugin

The plugin bundles the skill and the MCP server, so one install gives an agent both the rules and a way to look up a chapter.

```bash
/plugin marketplace add tomavic/angular-philosophies
/plugin install angular-philosophies@angular-philosophies
```

After that, an Angular task in any project can load the skill on its own. For "a new orders list page with filters" it points the
agent at the store, data-access and testing chapters, and at the template files to copy: a view store with a resource and a
mutation, provided from the component, and a spec written with the test toolkit.

## Claude skill, without the plugin

Copy the folder into your skills directory. It is self-contained: the rules are in `SKILL.md`, the full chapters are in
`references/`, and the code templates are in `templates/`.

```bash
# for one project, from its root
mkdir -p .claude/skills && curl -sSL https://github.com/tomavic/angular-philosophies/archive/refs/heads/main.tar.gz | tar -xz --strip-components=3 -C .claude/skills angular-philosophies-main/ai/skills/angular-philosophies
# for every project: the same command with ~/.claude/skills in place of .claude/skills
```

## `AGENTS.md`

`ai/AGENTS.md` is a drop-in file: the stack, a "read this first, by task" table and every rule, grouped by chapter. Put it at
the root of your project, and in an area folder if only that area follows it.

```bash
curl -o AGENTS.md https://raw.githubusercontent.com/tomavic/angular-philosophies/main/ai/AGENTS.md
```

Then add your project's own overrides under a heading of their own, above the generated rules. Where your project and this
guide disagree, the project wins, and writing that down is how an agent learns which one to follow.

## Cursor rules

Each `ai/cursor/*.mdc` file covers one chapter and is attached by file type: the store rules to `**/*.store.ts`, the component
rules to `**/*.component.ts` and `**/*.component.html`, the testing rules to `**/*.spec.ts`, and so on. Copy them in:

```bash
mkdir -p .cursor/rules && curl -sSL https://github.com/tomavic/angular-philosophies/archive/refs/heads/main.tar.gz | tar -xz --strip-components=3 -C .cursor/rules angular-philosophies-main/ai/cursor
```

## `llms.txt`

`llms.txt` is an index of the chapters with a line about each, and `llms-full.txt` is every chapter in one file, with the
rules and the code. Give a tool the URL, or paste the full file into a chat with a model that has no file access.

```
https://raw.githubusercontent.com/tomavic/angular-philosophies/main/llms.txt
https://raw.githubusercontent.com/tomavic/angular-philosophies/main/ai/llms-full.txt
```

## MCP server

`ai/mcp/server.mjs` is a small stdio server with no dependencies. It serves the chapters on demand, so an agent pulls only the
one it needs instead of carrying everything in context.

| Tool | Returns |
| --- | --- |
| `list_topics` | Every chapter with its title and one-line summary |
| `get_topic` | A whole chapter, by name or number |
| `get_rules` | The rules for one chapter, or all of them |
| `search` | The chapters and rules that mention a word or phrase |

Add it to a client with Node 22 or later:

```bash
claude mcp add angular-philosophies -- node /path/to/angular-philosophies/ai/mcp/server.mjs
```

or in any client's JSON configuration:

```json
{
  "mcpServers": {
    "angular-philosophies": { "command": "node", "args": ["/path/to/angular-philosophies/ai/mcp/server.mjs"] }
  }
}
```

The plugin registers the same server automatically.

## Writing instructions for agents that work

What made these files effective, if you write your own:

- **Rules, not essays.** One imperative sentence each, with the word "never" where it means never.
- **A map by task.** "Adding a store: read chapter 3, copy `order-list.store.ts`." Agents follow a pointer better than a paragraph.
- **A reference implementation for each pattern.** An agent copies a real file more reliably than it follows a description.
- **Say where your rules override the framework's defaults.** Otherwise the agent applies the generic best practice it was trained on.
- **Make the rules checkable.** A rule enforced by ESLint or the compiler holds even when the instructions are ignored.

## Rules

<!-- rules -->
- Treat the generated AI files (everything in `ai/` except `ai/mcp/server.mjs`, plus `llms.txt`) as build output; change the chapter in `docs/` instead.
- Put `AGENTS.md` at the project root and add project-specific overrides above the generated rules; the project wins over the guide.
- Keep agent instructions as one-sentence imperative rules with a task-to-chapter map and a reference file per pattern.
- State where project rules override framework defaults, and back rules with lint rules or types where possible.
<!-- /rules -->
