import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { fakeRoute, fakeRouter } from './router-fakes';
import { injectService } from './testing-utils';

describe('fakeRouter', () => {
  it('records navigation and resolves to true', async () => {
    const router = fakeRouter();
    const real = injectService(Router, [router]);

    expect(await real.navigate(['/login'])).toBe(true);
    expect(router.fake.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('follows NavigationEnd events like the real router', () => {
    const router = fakeRouter(() => ({ url: '/home' }));
    const real = injectService(Router, [router]);
    expect(real.url).toBe('/home');

    router.fake.events.next(new NavigationEnd(1, '/a', '/b'));

    expect(real.url).toBe('/b');
  });
});

describe('fakeRoute', () => {
  it('keeps the snapshot and the observables in agreement', async () => {
    const route = fakeRoute({ params: { orderId: '42' } });
    const real = injectService(ActivatedRoute, [route]);

    expect(real.snapshot.paramMap.get('orderId')).toBe('42');
    expect(await firstValueFrom(real.params)).toEqual({ orderId: '42' });
  });

  it('updates both when a test changes the query params', async () => {
    const route = fakeRoute();
    const real = injectService(ActivatedRoute, [route]);

    route._.setQueryParams({ currency: 'USD' });

    expect(real.snapshot.queryParamMap.get('currency')).toBe('USD');
    expect(await firstValueFrom(real.queryParams)).toEqual({ currency: 'USD' });
  });
});
