import { ResourceStatus, signal } from '@angular/core';
import { apiStatus } from './api-status';

describe('apiStatus', () => {
  const a = signal<ResourceStatus>('resolved');
  const b = signal<ResourceStatus>('resolved');

  beforeEach(() => {
    a.set('resolved');
    b.set('resolved');
  });

  it('is idle when everything resolved', () => {
    expect(apiStatus(a, b)()).toBe('idle');
  });

  it('is loading while any resource loads or reloads', () => {
    b.set('reloading');
    expect(apiStatus(a, b)()).toBe('loading');
  });

  it('is error when any resource failed, even if another is still loading', () => {
    a.set('loading');
    b.set('error');
    expect(apiStatus(a, b)()).toBe('error');
  });
});
