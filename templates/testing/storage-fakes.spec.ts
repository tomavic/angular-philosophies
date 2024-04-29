import { Injectable } from '@angular/core';
import { fakeStorage } from './storage-fakes';
import { injectService } from './testing-utils';

@Injectable({ providedIn: 'root' })
class StorageService {
  get(_key: string): unknown {
    return undefined;
  }
  set(_key: string, _value: unknown): void {}
  delete(_key: string): void {}
}

describe('fakeStorage', () => {
  it('starts with the given values and really stores what the code sets', () => {
    const storage = fakeStorage(StorageService, { language: 'en' });
    const real = injectService(StorageService, [storage]);

    expect(real.get('language')).toBe('en');
    real.set('showPrices', false);

    expect(real.get('showPrices')).toBe(false);
    expect(storage.fake.set).toHaveBeenCalledWith('showPrices', false);
  });

  it('deletes keys', () => {
    const storage = fakeStorage(StorageService, { a: 1 });
    const real = injectService(StorageService, [storage]);

    real.delete('a');

    expect(real.get('a')).toBeUndefined();
  });
});
