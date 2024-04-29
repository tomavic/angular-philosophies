import { Component, inject, Injectable, input, output, resource, signal } from '@angular/core';
import { fakeService, firstOutputFrom, flushEffects, injectService, render, runInContext, setResource } from './testing-utils';

@Injectable({ providedIn: 'root' })
class Greeter {
  greet(name: string) {
    return `Hello ${name}`;
  }
}

@Component({
  selector: 'app-card',
  template: `
    <h2 data-testid="TITLE">{{ title() }}</h2>
    <input [value]="draft()" (input)="draft.set($any($event.target).value)" />
    <button type="button" (click)="saved.emit(draft())">Save</button>
    <p>{{ greeting }}</p>
  `,
})
class CardComponent {
  readonly title = input('untitled');
  readonly amount = input(0, { transform: (v: string | number) => Number(v) });
  readonly saved = output<string>();
  readonly draft = signal('');
  readonly greeting = inject(Greeter).greet('Ada');
}

describe('fakeService', () => {
  const greeter = fakeService(Greeter, () => ({ greet: jest.fn(() => 'hi from the fake') }));

  it('replaces the real service and exposes the live instance as `.fake`', async () => {
    const view = await render(CardComponent, [greeter]);
    view.detectChanges();

    expect(view.getByText('hi from the fake')).toBeTruthy();
    expect(greeter.fake.greet).toHaveBeenCalledWith('Ada');
  });

  it('builds a fresh fake for every test, so no mock reset is needed', async () => {
    await render(CardComponent, [greeter]);

    // Exactly one call: this test's component. Nothing is left over from the previous test.
    expect(greeter.fake.greet).toHaveBeenCalledTimes(1);
  });
});

@Component({ selector: 'app-own-provider', providers: [Greeter], template: '<p>{{ greeting }}</p>' })
class OwnProviderComponent {
  readonly greeting = inject(Greeter).greet('Ada');
}

describe('a service declared in the component own providers', () => {
  const greeter = fakeService(Greeter, () => ({ greet: jest.fn(() => 'hi from the fake') }));

  it('ignores a fake in the shared list, because the component provider wins', async () => {
    const view = await render(OwnProviderComponent, [greeter]);

    expect(view.host.greeting).toBe('Hello Ada');
  });

  it('is replaced through options.providers', async () => {
    const view = await render(OwnProviderComponent, [], { providers: [greeter] });

    expect(view.host.greeting).toBe('hi from the fake');
  });
});

describe('render', () => {
  it('sets inputs from a typed object and through the typed setInput', async () => {
    const view = await render(CardComponent, [], { inputs: { title: 'Hello' } });
    view.detectChanges();
    expect(view.$testId('TITLE').textContent).toBe('Hello');

    view.setInput('amount', '42');
    expect(view.host.amount()).toBe(42);
  });

  it('types into an input like a user and reads the next output emission', async () => {
    const view = await render(CardComponent);
    view.detectChanges();

    view.$('input').type('Ada Lovelace');
    const saved = firstOutputFrom(view.host.saved);
    view.getByText('Save')!.click();

    expect(await saved).toBe('Ada Lovelace');
  });

  it('getByText returns the deepest element holding the text, or null', async () => {
    const view = await render(CardComponent);
    view.detectChanges();

    expect(view.getByText('Save')?.tagName).toBe('BUTTON');
    expect(view.getByText('not on the page')).toBeNull();
  });
});

describe('injectService and runInContext', () => {
  it('gets a service from the test injector', () => {
    expect(injectService(Greeter).greet('Bob')).toBe('Hello Bob');
  });

  it('runs inject()-based code such as a functional guard', () => {
    const guard = () => inject(Greeter).greet('guard') === 'Hello guard';

    expect(runInContext(guard)).toBe(true);
  });
});

describe('setResource', () => {
  it('puts a resource in one consistent state', () => {
    const items = injectResource();

    setResource(items, { value: ['a'] });
    expect([items.value(), items.hasValue(), items.status()]).toEqual([['a'], true, 'resolved']);

    setResource(items, { status: 'reloading' });
    expect(items.isLoading()).toBe(true);

    setResource(items, { error: new Error('down') });
    expect([items.status(), items.error()?.message]).toEqual(['error', 'down']);
  });

  function injectResource() {
    return runInContext(() => resource({ loader: async () => ['x'] }));
  }
});

describe('flushEffects', () => {
  it('runs pending effects before you assert', () => {
    expect(() => flushEffects()).not.toThrow();
  });
});
