import { TestBed } from '@angular/core/testing';
import { fakeHttp, flushEffects, httpError, injectService } from '@/core/test';
import { OrderListStore } from '../../signal-store/order-list.store';
import { Order } from '../../signal-store/order.model';

const order = { id: 1, customer: 'Ada', total: 10, status: 'paid' } satisfies Order;

// A view store is provided by the component, so a spec provides it too.
const http = fakeHttp({ '/api/orders': { items: [order], total: 41 } });

describe('OrderListStore', () => {
  let store: InstanceType<typeof OrderListStore>;

  beforeEach(async () => {
    jest.useFakeTimers();
    store = injectService(OrderListStore, [OrderListStore, http]);
    await settle();
  });

  afterEach(() => jest.useRealTimers());

  /** Runs effects, then lets the resource finish. A store test's version of `view.whenStable()`. */
  async function settle() {
    flushEffects();
    await jest.advanceTimersByTimeAsync(0);
    flushEffects();
  }

  it('loads the first page without anyone calling load()', () => {
    expect(http._.calls('/api/orders')).toBe(1);
    expect(store.listValue().items).toEqual([order]);
    expect(store.pageCount()).toBe(3);
  });

  it('refetches from page 1 when a filter changes, once the search settles', async () => {
    store.setPage(3);
    await settle();
    expect(http._.calls('/api/orders')).toBe(2);

    store.setSearch('ada');
    await jest.advanceTimersByTimeAsync(300);
    await settle();

    expect(store.page()).toBe(1);
    expect(http.fake.request).toHaveBeenLastCalledWith(expect.objectContaining({ urlWithParams: expect.stringContaining('search=ada') }));
  });

  it('keeps the last good page when a reload fails (errorHandling: previous value)', async () => {
    http._.reply('/api/orders', httpError(500));
    store.refresh();
    await settle();

    expect(store.listError()).toBeTruthy();
    expect(store.listValue().items).toEqual([order]); // never undefined, so no `?.` anywhere
  });

  it('starts from the default value when a changed filter fails, because that is a new request', async () => {
    http._.reply('/api/orders', httpError(500));
    store.setPage(2);
    await settle();

    expect(store.listError()).toBeTruthy();
    expect(store.listValue()).toEqual({ items: [], total: 0 });
  });

  it('goes back to the initial state with reset()', async () => {
    store.setStatus('paid');
    store.reset();

    expect(store.status()).toBeNull();
    expect(store.page()).toBe(1);
  });
});
