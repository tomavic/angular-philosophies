import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OrderListStore } from './order-list.store';
import { ORDER_STATUS_OPTIONS } from './order.model';

/**
 * A routed page. The store is provided here, so filters and paging reset when the user leaves the page.
 * The component reads signals and calls methods. It never injects HttpClient, never subscribes,
 * and never calls a load() method after a filter changes.
 */
@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  providers: [OrderListStore],
  // OnPush is the default in Angular 22, so new components don't set it. Shown only for older code.
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block p-4' },
})
export class OrderListComponent {
  protected readonly store = inject(OrderListStore);
  protected readonly statuses = ORDER_STATUS_OPTIONS;
}
