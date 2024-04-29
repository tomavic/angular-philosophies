# Accessibility

Accessibility is part of "done". It is cheap to build in from the first commit and expensive to retrofit, and the people it
protects are not a small group: anyone on a phone in sunlight, anyone using a keyboard, anyone whose first language is read
right to left.

## Measure contrast, don't judge it

Eyes lie, especially on your own monitor. Measure.

| Text | Minimum ratio |
| --- | --- |
| Small text (under 18px, or under 14px bold) | **7:1** |
| Any other text | 4.5:1 |
| Large text, icons, input borders, focus rings | 3:1 |

7:1 for small text is stricter than the WCAG AA minimum of 4.5:1. It is the AAA level, and it is what keeps small labels
readable on a phone outdoors. [templates/a11y/contrast.ts](../templates/a11y/contrast.ts) is a 15-line function that returns the
ratio between two hex colours, and its spec pins known values.

A brand colour is usually the problem. A saturated blue such as `#0059ff` on a near-black `#101820` measures 3.3:1. That is
fine for a large heading or a filled button, and unreadable as a 12px label. So:

- **Brand colours are for fills, borders and large text.** Small text uses a neutral token with a measured ratio.
- **Define text colours as design tokens** and check the token pairs once, rather than checking every screen.
- **Check dark mode separately.** A pair that passes on white can fail on dark.

## Meaning never rides on colour alone

A red border is not an error message. Pair every colour signal with text, an icon or a pattern:

- An invalid field shows an icon and a message, and the control has `aria-invalid="true"`.
- A status is a word ("Paid", "Cancelled") as well as a colour, and a chart series has a label or a pattern as well as a hue.
- A required field says "required" in text, not only with a coloured asterisk.

## Keyboard and focus

- Every interactive element is reachable with Tab, in reading order, and operable with Enter or Space. Use a real `<button>`
  or `<a>`, not a clickable `<div>`.
- Focus is always visible. Don't remove the outline; restyle it with a colour that meets 3:1 against its surroundings.
- A dialog moves focus in when it opens, traps it while open and returns it to the trigger on close.
- After a route change, move focus to the page heading so a screen reader announces where it landed.
- Don't use positive `tabindex`.

## Names, roles and announcements

- Every control has an accessible name: a `<label for>`, or `aria-label` for an icon button.
- Use native elements before ARIA. `aria-*` repairs a missing semantic; it doesn't replace one.
- Errors and status changes that appear without a page load use `role="alert"` or `aria-live="polite"`.
- A list that is loading carries `aria-busy`, as in [order-list.component.html](../templates/signal-store/order-list.component.html).
- Images have `alt`; decorative ones have `alt=""`.

## Size and motion

- Body text is at least 16px, and nothing meaningful is under 12px. Check at phone scale, not on a desktop monitor.
- Touch targets are at least 44 by 44 CSS pixels.
- Respect `prefers-reduced-motion`: turn off parallax, large slides and autoplay for those users.
- Don't rely on hover for anything a touch user needs.

## Let the tools catch the easy ones

Enable the `templateAccessibility` config from `angular-eslint` in the shared ESLint config and leave it on. The common
temptation is to switch a rule off to ship a form; fix the markup instead. Automated checks catch only part of the problems,
so also tab through every new screen once with the mouse unplugged.

## Rules

<!-- rules -->
- Measure contrast with a function or tool; require 7:1 for small text, 4.5:1 for other text, and 3:1 for large text, icons, borders and focus rings.
- Use brand colours only for fills, borders and large text; give small text a neutral token with a measured ratio.
- Check light and dark themes separately.
- Never let colour alone carry meaning; pair it with text, an icon or a pattern.
- Mark invalid controls with `aria-invalid` and show the error as text.
- Use native `<button>` and `<a>` for interactive elements; never a clickable `<div>`.
- Keep focus visible with at least 3:1 contrast; never remove the outline without replacing it.
- Move focus into a dialog on open, trap it while open, and return it on close; move focus to the heading after a route change.
- Give every control an accessible name; prefer native elements over ARIA.
- Announce dynamic errors and status changes with `role="alert"` or `aria-live`.
- Keep body text at 16px or more, touch targets at 44px or more, and honour `prefers-reduced-motion`.
- Enable the Angular ESLint template accessibility rules and do not switch them off to ship.
<!-- /rules -->
