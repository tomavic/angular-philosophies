import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { isObservable, Observable, of, Subject, throwError } from 'rxjs';
import { fakeService } from './testing-utils';

/** An HTTP error reply: `mockReturnValue(httpError(404))` or a `fakeHttp` route value. */
export function httpError(status: number, error: unknown = null) {
  return throwError(() => new HttpErrorResponse({ status, error }));
}

/**
 * Route value: a response body, or an Observable for full control (`httpError(500)`, a `Subject`).
 * Keys match when the request URL contains them; the longest matching key wins.
 */
export type HttpRoutes = Record<string, unknown>;

type HttpCall = { method: string; url: string; body?: unknown };

/**
 * A fake HttpClient. `get/post/put/patch/delete` and `request` (used by httpResource) all answer from one URL map.
 *   const http = fakeHttp({ '/api/accounts': accounts, '/api/limits': httpError(500) });
 *   http._.reply('/api/accounts', []);          // change a route for one test
 *   http._.calls('/api/accounts');              // how many requests hit it
 *   expect(http.fake.post).toHaveBeenCalledWith('/api/x', body);
 * With `{ pending: true }` every request waits until the test settles it:
 *   http._.flush('/api/accounts', body);  http._.fail('/api/accounts', 500);
 */
export function fakeHttp(routes: HttpRoutes = {}, { pending = false } = {}) {
  return fakeService(HttpClient, () => {
    const table: HttpRoutes = { ...routes };
    const log: HttpCall[] = [];
    const waiting: { url: string; response: Subject<unknown> }[] = [];

    const match = (url: string) =>
      Object.keys(table)
        .filter(key => url.includes(key))
        .sort((a, b) => b.length - a.length)[0];

    const answer = (method: string, url: string, body?: unknown): Observable<unknown> => {
      log.push({ method, url, body });
      if (pending) {
        const response = new Subject<unknown>();
        waiting.push({ url, response });
        return response.asObservable();
      }
      const key = match(url);
      if (key === undefined) {
        return throwError(() => new Error(`fakeHttp: no route for ${method} ${url}`));
      }
      const value = table[key];
      return isObservable(value) ? value : of(value);
    };

    const settle = (key: string) => {
      // The latest matching request first.
      for (let i = waiting.length - 1; i >= 0; i--) {
        const call = waiting[i];
        if (call?.url.includes(key)) {
          waiting.splice(i, 1);
          return call.response;
        }
      }
      throw new Error(`fakeHttp: no pending request for ${key}`);
    };

    const get: jest.Mock = jest.fn((url: string) => answer('GET', url));
    const del: jest.Mock = jest.fn((url: string) => answer('DELETE', url));
    const post: jest.Mock = jest.fn((url: string, body?: unknown) => answer('POST', url, body));
    const put: jest.Mock = jest.fn((url: string, body?: unknown) => answer('PUT', url, body));
    const patch: jest.Mock = jest.fn((url: string, body?: unknown) => answer('PATCH', url, body));
    // httpResource calls request(HttpRequest) and expects HttpEvents; request(method, url) returns the body.
    const request: jest.Mock = jest.fn((first: HttpRequest<unknown> | string, url?: string) => {
      if (typeof first === 'string') return answer(first.toUpperCase(), url!);
      return new Observable<HttpEvent<unknown>>(subscriber =>
        answer(first.method, first.url, first.body).subscribe({
          next: body => subscriber.next({ type: HttpEventType.Response, body } as HttpEvent<unknown>),
          error: e => subscriber.error(e),
          complete: () => subscriber.complete(),
        }),
      );
    });

    return {
      get,
      delete: del,
      post,
      put,
      patch,
      request,
      __: {
        reply: (key: string, value: unknown) => {
          table[key] = value;
        },
        calls: (key: string) => log.filter(call => call.url.includes(key)).length,
        flush: (key: string, body: unknown) => {
          const response = settle(key);
          response.next(body);
          response.complete();
        },
        fail: (key: string, status = 500, error: unknown = null) =>
          settle(key).error(new HttpErrorResponse({ status, error })),
      },
    };
  });
}
