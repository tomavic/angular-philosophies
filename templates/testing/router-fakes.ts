import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  convertToParamMap,
  Event,
  NavigationEnd,
  Params,
  Router,
} from '@angular/router';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { fakeService } from './testing-utils';

/**
 * A fake Router, fresh per test. Navigation methods are jest mocks resolving to `true`;
 * `events` is a Subject the test can push into; `url` follows each NavigationEnd like the real Router
 * and is also writable directly.
 *   const router = fakeRouter(() => ({ url: '/home' }));
 *   router.fake.events.next(new NavigationEnd(1, '/a', '/a'));   // router.url is now '/a'
 *   expect(router.fake.navigate).toHaveBeenCalledWith(['/login']);
 * `extra` adds or replaces members (e.g. `routerState`).
 */
export function fakeRouter<E extends Partial<Router> = Record<never, never>>(extra: () => E = () => ({}) as E) {
  return fakeService(Router, () => {
    const router = {
      url: '/',
      events: new Subject<Event>(),
      navigate: jest.fn(async () => true),
      navigateByUrl: jest.fn(async () => true),
      ...extra(),
    };
    (router.events as Observable<Event>).subscribe(event => {
      if (event instanceof NavigationEnd) router.url = event.urlAfterRedirects;
    });
    return router;
  });
}

export type RouteState = { params?: Params; queryParams?: Params; data?: Record<string, unknown> };

/**
 * A fake ActivatedRoute whose snapshot and observables agree, fresh per test.
 *   const route = fakeRoute({ params: { accountId: '42' }, queryParams: { currency: 'EGP' } });
 *   route._.setQueryParams({ currency: 'USD' });   // updates the snapshot and emits
 */
export function fakeRoute(initial: RouteState = {}) {
  return fakeService(ActivatedRoute, () => {
    const state = new BehaviorSubject({ params: {}, queryParams: {}, data: {}, ...initial });
    const snapshot = {} as ActivatedRouteSnapshot;
    const sync = () => {
      const { params, queryParams, data } = state.value;
      Object.assign(snapshot, {
        params,
        queryParams,
        data,
        paramMap: convertToParamMap(params),
        queryParamMap: convertToParamMap(queryParams),
      });
    };
    sync();
    const set = (patch: RouteState) => {
      state.next({ ...state.value, ...patch });
      sync();
    };

    return {
      snapshot,
      params: state.pipe(map(s => s.params)),
      queryParams: state.pipe(map(s => s.queryParams)),
      data: state.pipe(map(s => s.data)),
      paramMap: state.pipe(map(s => convertToParamMap(s.params))),
      queryParamMap: state.pipe(map(s => convertToParamMap(s.queryParams))),
      __: {
        setParams: (params: Params) => set({ params }),
        setQueryParams: (queryParams: Params) => set({ queryParams }),
        setData: (data: Record<string, unknown>) => set({ data }),
      },
    };
  });
}
