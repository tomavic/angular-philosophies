import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { DialogRef, OrdersApi } from './orders.services';

@Component({
  selector: 'app-cancel-order-dialog',
  imports: [ReactiveFormsModule, TranslocoDirective],
  template: `
    <ng-container *transloco="let t; prefix: 'orders.cancel'">
      <h2>{{ t('title') }}</h2>
      <textarea [formControl]="reason" aria-label="Reason"></textarea>
      @if (showError()) {
        <p role="alert">{{ t('reasonRequired') }}</p>
      }
      <button type="button" [disabled]="loading()" (click)="back()">{{ t('back') }}</button>
      <button type="button" (click)="confirm()">{{ t('confirm') }}</button>
    </ng-container>
  `,
})
export class CancelOrderDialogComponent {
  private readonly api = inject(OrdersApi);
  private readonly dialog = inject<DialogRef<number>>(DialogRef);

  readonly reason = new FormControl('', { nonNullable: true });
  readonly loading = signal(false);
  readonly showError = signal(false);

  confirm() {
    if (this.loading()) return;
    const reason = this.reason.value.trim();
    if (!reason || /<[^>]*>/.test(reason)) {
      this.showError.set(true);
      return;
    }
    this.showError.set(false);
    this.loading.set(true);
    this.api.cancel({ orderId: this.dialog.data, reason }, ok => {
      this.loading.set(false);
      if (ok) this.dialog.close(true);
    });
  }

  back() {
    this.dialog.close(false);
  }
}
