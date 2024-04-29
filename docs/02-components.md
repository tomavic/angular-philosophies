# Components

Angular 22 removed most of the ceremony. A component is a class with a template, and the defaults are the ones you want:
standalone, `OnPush`, and no zone. Write the least that works.

## What a component looks like

```ts
@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  providers: [OrderListStore],
  host: { class: 'block p-4' },
})
export class OrderListComponent {
  protected readonly store = inject(OrderListStore);
  protected readonly statuses = ORDER_STATUS_OPTIONS;
}
```

The full file and its template are in [templates/signal-store/](../templates/signal-store/order-list.component.ts). Notice
what is missing:

- **No `standalone: true`.** It is the default.
- **No `changeDetection: OnPush`.** In Angular 22 `OnPush` is the default (`ChangeDetectionStrategy.Eager` is the opt-out).
  Don't edit old files only to remove it, but don't add it to new ones.
- **No constructor.** Dependencies come from `inject()` in field initialisers.
- **No `@HostBinding` or `@HostListener`.** Use the `host: {}` object.
- **No `NgModule`, no `CommonModule`, no `ngClass`, no `ngStyle`.** Bind `[class.active]` and `[style.width.px]`.
- **No `ngOnInit` for loading data.** Reads are resources derived from state, see [04-data-access.md](04-data-access.md).

## Zoneless

Apps run with `provideZonelessChangeDetection()` and no `zone.js`. Change detection runs when a signal read by a
template changes, an event handler runs, or `markForCheck` is called. In practice that means one rule: **state a template
reads must be a signal.** A plain field that you mutate will not update the screen.

## Signals, all the way

| Need | Use |
| --- | --- |
| An input | `input()` or `input.required<T>()` |
| Two-way binding | `model()` |
| An output | `output<T>()` |
| A query | `viewChild()`, `contentChildren()` |
| Local state | `signal()` |
| Derived state | `computed()` |
| State that follows another signal but stays writable | `linkedSignal()` |
| Shared or page state | a signal store, see [03-signal-store.md](03-signal-store.md) |

Keep `effect()` for side effects that leave Angular (writing to `localStorage`, calling a third-party widget). If you are
using an effect to set a signal from another signal, you wanted `computed` or `linkedSignal`.

## Templates

- Use `@if`, `@for` and `@switch`. `@for` always has a `track`, and `track item.id` beats `track $index` when items have ids.
- Use `@empty` for the empty list, and `@defer` for heavy parts below the fold.
- No logic in templates beyond a condition or a call to a signal. Put the rest in a `computed`.
- Use `NgOptimizedImage` for static images.
- Put a `data-testid` on interactive elements and on the elements tests assert on. See [09-testing.md](09-testing.md).
- Use `@let` for a value you read three times in one template.

## Pages and presentational components

Two kinds of component, kept apart:

- **Page (smart).** Routed or a feature root. Provides its store, injects it, passes data down. Lives in a `type:feature` library.
- **Presentational (dumb).** Inputs and outputs only. It never injects a store or `HttpClient`, so it can be reused and tested
  with `render(Component, [], { inputs })`. Lives in a `type:ui` library.

A component that needs both is a page that contains a presentational component. Split it.

## Files and naming

- `order-list.component.ts`, `order-list.component.html`, `order-list.component.spec.ts`, side by side.
- The class is `OrderListComponent`, matching the file name. Selectors use the `app-` prefix.
- The template lives in its own `.html` file. Inline a template only when it is a few lines and has no logic.
- Styling uses utility classes and design tokens. No per-component stylesheets, no hex colours, no arbitrary pixel values.
- Named exports. A routed component is loaded with `loadComponent: () => import('./order-list.component').then(m => m.OrderListComponent)`.

## Services

A service that holds no state and does one job is a plain `@Injectable({ providedIn: 'root' })` class. Anything with state
that a page shares is a store, not a service. Angular 22 also ships a `@Service()` decorator; this guide keeps
`@Injectable` for now because every tool and library in the ecosystem understands it.

## Rules

<!-- rules -->
- Write components as standalone without `standalone: true`, and without `changeDetection` (OnPush is the Angular 22 default).
- Inject dependencies with `inject()` in field initialisers; do not use constructors for injection.
- Use the `host: {}` object; never `@HostBinding` or `@HostListener`.
- Use `input()`, `model()`, `output()`, `viewChild()`; do not use the decorator forms in new code.
- Run zoneless with `provideZonelessChangeDetection()`; every value a template reads must be a signal.
- Use `computed` or `linkedSignal` to derive state; use `effect()` only for side effects outside Angular.
- Use `@if`, `@for` (always with `track`), `@switch`, `@empty`, `@defer`; never `*ngIf`, `*ngFor`, `ngClass` or `ngStyle`.
- Keep templates free of logic beyond a condition; move the rest into a `computed`.
- Keep presentational components free of stores and `HttpClient`; they take inputs and emit outputs.
- Put pages in `type:feature` libraries and presentational components in `type:ui` libraries.
- Add `data-testid` to interactive elements and to elements that tests assert on.
- Use named exports and `loadComponent` with a `.then(m => m.XComponent)` for routed components.
- Use utility classes and design tokens for styling; no hex colours and no per-component stylesheets.
- Keep `@Injectable({ providedIn: 'root' })` for stateless services; put shared state in a signal store.
<!-- /rules -->
