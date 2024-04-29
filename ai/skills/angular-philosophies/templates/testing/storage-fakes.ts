import { Type } from '@angular/core';
import { fakeService } from './testing-utils';

/** The shape your app's storage wrapper exposes. Adjust to match your own `StorageService`. */
interface StorageLike {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  delete(key: string): void;
}

/**
 * A fake storage service backed by a Map, fresh per test. get/set/delete are jest mocks that really
 * read and write, so the code under test sees what it stored.
 *   const storage = fakeStorage(StorageService, { language: 'en' });
 *   expect(storage.fake.set).toHaveBeenCalledWith('showPrices', false);
 */
export function fakeStorage<T extends Type<StorageLike>>(service: T, initial: Record<string, unknown> = {}) {
  return fakeService(service, () => {
    const store = new Map<string, unknown>(Object.entries(initial));
    return {
      get: jest.fn((key: string) => store.get(key)),
      set: jest.fn((key: string, value: unknown) => {
        store.set(key, value);
      }),
      delete: jest.fn((key: string) => {
        store.delete(key);
      }),
    } as unknown as Partial<InstanceType<T>>;
  });
}
