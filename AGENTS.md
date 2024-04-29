# Working on this repository

This repo is a written guide plus code templates. There is no app to build and no package to install at the root.

## Layout

- `docs/` holds the chapters. They are the single source of truth. Each ends with a `<!-- rules -->` block of imperative rules.
- `templates/` holds the code the chapters point to. It targets Angular 22, TypeScript 6.0, Jest 30 and `@ngrx/signals` 22.
- `ai/` (except `ai/mcp/server.mjs`), `llms.txt`, `.claude-plugin/` and `.mcp.json` are **generated** from
  `docs/` and `templates/`. Do not edit them; change the chapter, and the maintainer rebuilds them.
- `ai/mcp/server.mjs` is hand-written and has no dependencies.
- `site/` is the website (plain files, no build step). `site/index.html`, `site/ar/index.html`, `site/css/` and `site/js/` are hand-written; `site/chapters/` and `site/data/` are generated from `docs/`. The Arabic page keeps the same sections as the English one, in Egyptian Arabic.

## When you change a chapter

- Keep the rules block in step with the text. A rule is one imperative sentence, and "never" means never.
- Plain prose: no closing question, no emoji bullets, no "three things" templates.
- Don't name a version Angular doesn't list as supported at angular.dev/reference/versions.
- Don't add employer, client or product names. Examples use the shop domain (orders, billing).
- If a chapter claims a library behaves a certain way, check it against the installed type definitions or a test, not memory.

## When you change a template

- It must compile under strict TypeScript and, if it has logic, ship a spec that passes.
- Check it in a scratch Angular 22 + Jest 30 project; templates are not built inside this repo.
- Components compile with `strictTemplates`.
