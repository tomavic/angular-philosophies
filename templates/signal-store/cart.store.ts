import { signalStore, withState } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';
import { cartEvents } from './cart-events';

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ lines: {} as Record<string, number> }),
  withReducer(
    on(cartEvents.added, ({ payload }, state) => ({
      lines: { ...state.lines, [payload.sku]: (state.lines[payload.sku] ?? 0) + payload.qty },
    })),
    on(cartEvents.cleared, () => ({ lines: {} })),
  ),
);
