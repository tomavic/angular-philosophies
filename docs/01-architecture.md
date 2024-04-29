# Architecture

A large Angular app stays maintainable when it is cut into domains and layers that a tool, not a person, keeps in
order. The examples use a small shop with two business domains, `orders` and `billing`, plus `shared` code.

## The workspace

```
apps/
  storefront/                  the Angular app: routes, providers, one folder per feature
libs/
  orders/                      scope:orders
    data-access/               stores and API services          type:data-access
    feature/checkout/          a full page with its own store   type:feature
    ui/                        presentational components        type:ui
    util/                      pure functions                   type:util
  billing/                     scope:billing, same layout
  shared/                      scope:shared: nothing business-specific lives here
    ui/  util/  core/  testing/
```

Libraries are split by **type** inside a **domain**. A new business concept gets a domain folder; it does not get a new
top-level layout.

## Tags: two per library

Every library has exactly one `scope` tag (who owns it) and one `type` tag (what kind of code it is), set in its
`project.json`:

| Tag | Meaning |
| --- | --- |
| `scope:orders`, `scope:billing` | Belongs to that business domain |
| `scope:shared` | Generic, usable by any domain, never imports a domain |
| `scope:app` | An application, which may use every scope |
| `type:util` | Pure functions. No Angular injection, no services |
| `type:data-access` | Signal stores and HTTP services |
| `type:core` | Angular infrastructure: providers, interceptors, guards, models |
| `type:ui` | Presentational components: inputs and outputs only |
| `type:feature` | Smart components: a routed page with its own store |
| `type:shell` | The layout that mounts features, used only by an app |
| `type:testing` | Test helpers, imported by specs only |

## Dependencies flow down

A library may import only from the layers below it. `@nx/enforce-module-boundaries` turns that into a build error, so
nobody has to remember it.

```
type:shell        mounts features, used only by an app
type:feature      pages
type:ui           presentational components
type:core         providers, interceptors, guards, models
type:data-access  stores, API services
type:util         pure functions
```

Scope follows the same logic: a domain may import itself and `shared`, `shared` imports only `shared`, and a domain
never imports another domain. If `billing` needs something from `orders`, it is either shared code in the wrong place or
a sign the two should talk through an event (see [06-custom-features.md](06-custom-features.md)). The complete lint
configuration is in [templates/config/eslint.boundaries.js](../templates/config/eslint.boundaries.js).

Two details come from running this in production:

- `type:data-access` may import `type:core`, because stores need the HTTP configuration and error types. The reverse is
  forbidden: core never imports a store.
- `util` libraries accept what they need as parameters. A date helper takes the language as an argument instead of
  injecting a language service, which keeps it testable without Angular.

## Where does new code go

| You are adding | Put it in |
| --- | --- |
| A store or API service for a domain | `libs/<domain>/data-access` |
| A page with its own store | `libs/<domain>/feature/<name>` |
| A component two features reuse | `libs/<domain>/ui`, or `libs/shared/ui` if it knows no domain |
| A type shared across libs | `libs/shared/core` (models) |
| An HTTP interceptor | `libs/shared/core`, in an `interceptors` entry point |
| A route guard | `libs/shared/core` for generic ones, the domain's `data-access` for domain ones |
| A pure date, string or number helper | `libs/shared/util` |
| A test helper | `libs/shared/testing` |
| Code used by one feature only | **Inside that feature.** Do not create a library yet |

The last row matters most. **Code stays in the app until a second consumer appears, then it is promoted to a
library.** Promoting early produces libraries with one user and a public API nobody needed.

## Entry points and public APIs

Split a library with Angular secondary entry points when it holds distinct parts (`@shop/shared/core/models`,
`@shop/shared/core/interceptors`), not with more libraries. Each entry has its own `index.ts`, and:

- Export by name. Do not `export *` runtime code, only types, so the public surface stays deliberate.
- Import through the path alias (`@shop/orders/data-access`), never through a relative `../../` path.
- Inside the app, `@/*` points at `src/app/*`, so a feature imports its neighbours the same way.

Nx boundaries only apply between projects, not between entry points inside one project. When two entries of one library
must never import each other, add a `no-restricted-imports` rule to that library's own ESLint config. A guest checkout
and a signed-in checkout inside one `checkout` library are the typical case: they share a domain and must not share
code that depends on a session.

When both sides need the same piece, choose in this order:

1. **Reuse** what does not depend on the session or the domain: `shared/ui`, `shared/util`.
2. **Promote, then reuse** when it can work through inputs and outputs only, with no store and no session.
3. **Duplicate** when sharing it would need an `if (guest)` flag. Two small copies that can change independently are
   cheaper than one function with a mode switch.

## Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Nx project | `<scope>-<type>-<name>` | `orders-data-access` |
| Path alias | `@<workspace>/<scope>/<type>` | `@shop/orders/data-access` |
| Component file | `<name>.component.ts` + `.component.html` | `order-list.component.ts` |
| Store, service, model | `<name>.store.ts`, `.service.ts`, `.model.ts` | `order-list.store.ts` |
| Routes, guard | `<feature>.routes.ts`, `<name>.guard.ts` | `checkout.routes.ts` |
| Spec | beside its source, `<file>.spec.ts` | `order-list.store.spec.ts` |
| Selector | `app-` prefix, kebab-case | `app-order-list` |

## Rules

<!-- rules -->
- Give every library exactly one `scope:*` tag and one `type:*` tag in its `project.json`.
- Enforce module boundaries with `@nx/enforce-module-boundaries`; dependencies flow only downward through util, data-access, core, ui, feature, shell.
- Never let a domain import another domain, and never let `scope:shared` import a domain.
- Keep code inside the app feature until a second consumer exists; then promote it to a library.
- Split a library with secondary entry points, not with extra libraries.
- Export by name from each `index.ts`; do not `export *` runtime code.
- Import through path aliases (`@shop/...`, `@/...`); never use `../../` across feature or library boundaries.
- Make `type:util` code free of Angular injection; pass language and configuration as parameters.
- Forbid sibling entry points from importing each other with `no-restricted-imports` in the library's own ESLint config.
- Duplicate small code instead of adding an `if (guest)`-style mode flag to a shared function.
- Name files `<name>.component.ts`, `<name>.store.ts`, `<name>.service.ts`, `<name>.model.ts`, `<feature>.routes.ts`, and keep each spec beside its source.
<!-- /rules -->
