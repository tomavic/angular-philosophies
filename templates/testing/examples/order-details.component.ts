import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Order } from '../../signal-store/order.model';
import { FileDownloadService, LanguageService } from './orders.services';

@Component({
  selector: 'app-order-details',
  imports: [TranslocoDirective],
  template: `
    <ng-container *transloco="let t; prefix: 'orders'">
      @if (order.isLoading()) {
        <p data-testid="ORDER_LOADING">{{ t('loading') }}</p>
      } @else if (order.error()) {
        <p data-testid="ORDER_ERROR" role="alert">{{ t('error') }}</p>
      } @else if (order.hasValue()) {
        <h1 data-testid="ORDER_TITLE">{{ t('title', { id: order.value().id }) }}</h1>
        <p data-testid="ORDER_CUSTOMER">{{ customer() }}</p>
        <button type="button" (click)="download()">{{ t('download') }}</button>
      }
    </ng-container>
  `,
})
export class OrderDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  private readonly files = inject(FileDownloadService);

  readonly orderId = this.route.snapshot.paramMap.get('orderId') ?? '';

  // Reading the language inside the request makes the resource refetch when the language changes.
  readonly order = httpResource<Order>(() => ({
    url: `/api/orders/${this.orderId}`,
    headers: { 'Accept-Language': this.language.language() },
  }));

  readonly customer = computed(() => this.order.value()?.customer || '-');

  download() {
    const order = this.order.value();
    if (order) this.files.save(`order-${order.id}.json`, JSON.stringify(order));
  }
}
