import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { fakeHttp, fakeRoute, fakeService, httpError, renderPage, RenderResult } from '@/core/test';
import { Order } from '../../signal-store/order.model';
import { OrderDetailsComponent } from './order-details.component';
import { FileDownloadService, LanguageService } from './orders.services';

const ORDER_URL = '/api/orders/77';

// Test data `satisfies` the real model, so a renamed field fails to compile here.
const order = { id: 77, customer: 'Ada Lovelace', total: 150, status: 'paid' } satisfies Order;

// 1. One fake per inject(), at module level, in the factory form so every test gets fresh mocks.
const http = fakeHttp({ [ORDER_URL]: order });
const route = fakeRoute({ params: { orderId: '77' } });
const language = fakeService(LanguageService, () => ({ language: signal<'en' | 'ar'>('en') }));
const files = fakeService(FileDownloadService, () => ({ save: jest.fn() }));

// 2. The provider list every world starts from.
const providers = [provideRouter([]), http, route, language, files];

// 3. One top-level describe per world: providers are fixed when the component is created.
describe('OrderDetailsComponent', () => {
  let view: RenderResult<OrderDetailsComponent>;

  beforeEach(async () => {
    view = await renderPage(OrderDetailsComponent, providers);
    await view.whenStable(); // let httpResource load, then render
  });

  it('loads the order named in the route', () => {
    expect(http._.calls(ORDER_URL)).toBe(1);
    expect(view.$testId('ORDER_TITLE').textContent).toBe('Order 77');
    expect(view.$testId('ORDER_CUSTOMER').textContent).toBe('Ada Lovelace');
  });

  it('loads the order again when the language changes', async () => {
    language.fake.language.set('ar'); // a fake's signal can change inside a test

    await view.whenStable();

    expect(http._.calls(ORDER_URL)).toBe(2);
  });

  it('shows "-" when the customer is missing', async () => {
    http._.reply(ORDER_URL, { ...order, customer: '' }); // a future answer can change too
    view.host.order.reload();

    await view.whenStable();

    expect(view.host.customer()).toBe('-');
  });

  it('downloads the order as a file named after its id', () => {
    view.getByText('Download')!.click();

    expect(files.fake.save).toHaveBeenCalledWith('order-77.json', JSON.stringify(order));
  });
});

// 4. Anything the code reads once, or only the first answer, is a new world that swaps one fake.
describe('OrderDetailsComponent while loading', () => {
  it('shows the loading text and nothing else', async () => {
    const view = await renderPage(OrderDetailsComponent, providers, { providers: [fakeHttp({}, { pending: true })] });
    view.detectChanges();

    expect(view.$testId('ORDER_LOADING')).toBeTruthy();
    expect(view.$testId('ORDER_TITLE')).toBeNull();
  });
});

describe('OrderDetailsComponent when the API fails', () => {
  it('shows the error instead of the order', async () => {
    const view = await renderPage(OrderDetailsComponent, providers, {
      providers: [fakeHttp({ [ORDER_URL]: httpError(500) })],
    });
    await view.whenStable();

    expect(view.$testId('ORDER_ERROR')).toBeTruthy();
    expect(view.$testId('ORDER_TITLE')).toBeNull();
  });
});

describe('OrderDetailsComponent without an orderId in the route', () => {
  it('uses an empty id', async () => {
    const view = await renderPage(OrderDetailsComponent, providers, { providers: [fakeRoute()] });

    expect(view.host.orderId).toBe('');
  });
});
