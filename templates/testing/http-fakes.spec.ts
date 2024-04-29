import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { fakeHttp, httpError } from './http-fakes';
import { injectService } from './testing-utils';

describe('fakeHttp', () => {
  it('answers from the route map, longest matching key first', async () => {
    const http = fakeHttp({ '/api/orders': ['list'], '/api/orders/7': { id: 7 } });
    const client = injectService(HttpClient, [http]);

    expect(await firstValueFrom(client.get('/api/orders'))).toEqual(['list']);
    expect(await firstValueFrom(client.get('/api/orders/7'))).toEqual({ id: 7 });
  });

  it('counts calls and lets a test change an answer', async () => {
    const http = fakeHttp({ '/api/orders': [] });
    const client = injectService(HttpClient, [http]);

    http._.reply('/api/orders', ['changed']);
    expect(await firstValueFrom(client.get('/api/orders'))).toEqual(['changed']);
    expect(http._.calls('/api/orders')).toBe(1);
  });

  it('replies with an error for a route set to httpError', async () => {
    const http = fakeHttp({ '/api/orders': httpError(500) });
    const client = injectService(HttpClient, [http]);

    await expect(firstValueFrom(client.get('/api/orders'))).rejects.toMatchObject({ status: 500 });
  });

  it('fails loudly for a URL nobody set up', async () => {
    const client = injectService(HttpClient, [fakeHttp()]);

    await expect(firstValueFrom(client.get('/api/unknown'))).rejects.toThrow('no route for GET /api/unknown');
  });

  it('keeps requests waiting in pending mode until the test settles them', async () => {
    const http = fakeHttp({}, { pending: true });
    const client = injectService(HttpClient, [http]);

    const answer = firstValueFrom(client.get('/api/orders'));
    http._.flush('/api/orders', ['late']);

    expect(await answer).toEqual(['late']);
  });

  it('can fail a pending request with a status', async () => {
    const http = fakeHttp({}, { pending: true });
    const client = injectService(HttpClient, [http]);

    const answer = firstValueFrom(client.post('/api/orders', {}));
    http._.fail('/api/orders', 403);

    await expect(answer).rejects.toMatchObject({ status: 403 });
  });

  it('records the body and method of writes', () => {
    const http = fakeHttp({ '/api/orders': {} });
    const client = injectService(HttpClient, [http]);

    client.post('/api/orders', { a: 1 }).subscribe();

    expect(http.fake.post).toHaveBeenCalledWith('/api/orders', { a: 1 });
  });
});
