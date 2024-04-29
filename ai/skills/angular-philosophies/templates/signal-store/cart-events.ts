import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const cartEvents = eventGroup({
  source: 'Cart',
  events: {
    added: type<{ sku: string; qty: number }>(),
    cleared: type<void>(),
  },
});
