import { Injectable, signal } from '@angular/core';

/** Services the example components inject. Each one gets a fake in the specs. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<'en' | 'ar'>('en');
}

@Injectable({ providedIn: 'root' })
export class FileDownloadService {
  save(fileName: string, content: string): void {
    const url = URL.createObjectURL(new Blob([content]));
    const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
    link.click();
    URL.revokeObjectURL(url);
  }
}

export class DialogRef<T = unknown> {
  data!: T;
  close(_result?: boolean): void {}
}

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  /** A callback style API on purpose: the spec shows how to capture the callback and answer it later. */
  cancel(_payload: { orderId: number; reason: string }, _done: (ok: boolean) => void): void {}
}
