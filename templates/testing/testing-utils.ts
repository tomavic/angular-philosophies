/**
 * The test toolkit. Copy this folder to `src/app/core/test/` and import from one place: `@/core/test`.
 * Written for Jest (`jest.fn`). With Vitest, replace `jest.fn` / `jest.spyOn` with `vi.fn` / `vi.spyOn`.
 * Typed `setInput` uses Angular's private `ɵINPUT_SIGNAL_BRAND_WRITE_TYPE`, the one private API here; if a
 * future Angular renames it, `InputValue<P>` is the only line to change.
 */
import {
  Component,
  DebugElement,
  Directive,
  EnvironmentProviders,
  OutputEmitterRef,
  ɵINPUT_SIGNAL_BRAND_WRITE_TYPE,
  Pipe,
  Provider,
  Resource,
  ResourceStatus,
  Type,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/** The value `setInput` accepts: the write type of a signal input/model, or the plain property type. */
export type InputValue<P> = P extends { [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: infer W } ? W : P;
export type Inputs<T> = { [K in keyof T]?: InputValue<T[K]> };

type ValueElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

class AngularQuery {
  constructor(public dEl: DebugElement) {}

  viewChild<U>(directive: Type<U>, selector?: string | Type<any>): U {
    return this.queryNative(selector || directive).injector.get(directive);
  }

  viewChildren<U>(directive: Type<U>, selector?: string): U[] {
    return this.viewChildrenDebug(selector || directive).map(de => de.injector.get(directive));
  }

  viewChildrenDebug<U>(directive: string | Type<U>) {
    return this.dEl.queryAll(this.getDirectiveType(directive));
  }

  queryNative<U>(directive: string | Type<U>) {
    return this.dEl.query(this.getDirectiveType(directive));
  }

  private getDirectiveType(directive: string | Type<any>) {
    return typeof directive === 'string' ? By.css(directive) : By.directive(directive);
  }
}

export class ElementHelper<T extends HTMLElement> extends AngularQuery {
  public el!: T;

  constructor(public override dEl: DebugElement) {
    super(dEl);
    this.el = dEl.nativeElement;
  }

  get textContent() {
    return this.el.textContent;
  }

  $<U extends HTMLElement>(selector: string | Type<any>): ElementHelper<U> {
    const el = this.queryNative(selector);
    return el ? new ElementHelper(el) : (null as any);
  }

  /** Shortcut for `$('[data-testid="id"]')`. */
  $testId<U extends HTMLElement>(id: string): ElementHelper<U> {
    return this.$<U>(`[data-testid="${id}"]`);
  }

  $All<U extends HTMLElement>(selector: string | Type<any>): ElementHelper<U>[] {
    return this.viewChildrenDebug(selector).map(de => new ElementHelper(de));
  }

  // Returns the deepest matching element (the one holding the text), not its outermost wrapper.
  getByText(text: string, root?: string | Type<any>): HTMLElement | null {
    const rootEl = root ? this.$(root)?.el : this.el;
    if (!rootEl) return null;
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_ELEMENT, null);
    let found: HTMLElement | null = null;
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (found && !found.contains(node)) break;
      if ((node as HTMLElement).textContent?.trim() === text) {
        found = node as HTMLElement;
      }
    }
    return found;
  }

  hasClass(...classNames: string[]) {
    return classNames.every(className => this.el.classList.contains(className));
  }

  attr(name: string, value?: string) {
    if (value !== undefined) {
      this.el.setAttribute(name, value);
    }
    return this.el.getAttribute(name);
  }

  css(name: string, value?: string) {
    if (value !== undefined) {
      this.el.style.setProperty(name, value);
    }
    return this.el.style.getPropertyValue(name);
  }

  click() {
    this.el.click();
  }

  focus() {
    this.el.focus();
    const focusEvent = new Event('focus', { bubbles: true, cancelable: true });
    this.el.dispatchEvent(focusEvent);
  }

  keydown(key: string, options?: KeyboardEventInit) {
    const event = new KeyboardEvent('keydown', {
      key,
      cancelable: true,
      bubbles: true,
      ...options,
    });
    this.el.dispatchEvent(event);
    return event;
  }

  mouseDown(options?: MouseEventInit) {
    const event = new MouseEvent('mousedown', { cancelable: true, bubbles: true, ...options });
    this.el.dispatchEvent(event);
    return event;
  }

  mouseEnter(options?: MouseEventInit) {
    const event = new MouseEvent('mouseenter', { cancelable: true, bubbles: true, ...options });
    this.el.dispatchEvent(event);
    return event;
  }

  mouseLeave(options?: MouseEventInit) {
    const event = new MouseEvent('mouseleave', { cancelable: true, bubbles: true, ...options });
    this.el.dispatchEvent(event);
    return event;
  }

  // Works on input, textarea and select.
  input(value: string | ((v: any) => any)) {
    const el = this.el as unknown as ValueElement;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
      throw new Error('Element is not an input, textarea or select');
    }
    el.value = typeof value === 'function' ? value(el.value) : value;
    el.dispatchEvent(new Event('input'));
    if (el instanceof HTMLSelectElement) {
      el.dispatchEvent(new Event('change'));
    }
  }

  paste(text: string) {
    const pasteEvent = new CustomEvent('paste', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(pasteEvent, 'clipboardData', {
      writable: true,
      value: {
        getData: () => text,
      },
    });

    this.el.dispatchEvent(pasteEvent);
    return pasteEvent;
  }

  type(value: string | string[], clear = false) {
    if (clear) {
      this.input('');
    }
    // Ensure the input has focus
    if (document.activeElement !== this.el) {
      this.focus();
    }
    let event: KeyboardEvent | MouseEvent;
    for (const char of value) {
      event = this.keydown(char);
      if (event.defaultPrevented) {
        continue;
      }

      // Trigger keypress event (deprecated, but some implementations might use it)
      event = new KeyboardEvent('keypress', { key: char, bubbles: true });
      if (!this.el.dispatchEvent(event)) {
        continue;
      }

      // Append character to input value
      if (char === 'Backspace') {
        this.input(v => v.slice(0, -1));
      } else if (char === 'Delete') {
        const caretPosition = (this.el as unknown as HTMLInputElement).selectionStart || 0;
        this.input(v => v.slice(0, caretPosition) + v.slice(caretPosition + 1));
      } else if (char.length === 1) {
        // Any single character, including spaces, symbols and Arabic letters.
        this.input(v => v + char);
      }

      // Trigger keyup event
      const keyupEvent = new KeyboardEvent('keyup', { key: char, bubbles: true });
      this.el.dispatchEvent(keyupEvent);
    }
    return event!;
  }
}

export class RenderResult<T> extends ElementHelper<HTMLElement> {
  host!: T;

  constructor(public fixture: ComponentFixture<T>) {
    super(fixture.debugElement);
    this.host = fixture.componentInstance;
  }

  detectChanges(): void {
    this.fixture.detectChanges();
  }

  async whenStable(): Promise<void> {
    this.fixture.detectChanges();
    await this.fixture.whenStable();
  }

  async formStable(): Promise<void> {
    await this.whenStable();
    // We have to wait for the UI to be updated
    this.fixture.detectChanges();
  }

  async sleep(ms: number) {
    await sleep(ms);
  }

  inject<U>(directive: Type<U>) {
    return injectService(directive);
  }

  injectHost<U>(directive: Type<U>) {
    return this.fixture.debugElement.injector.get(directive);
  }

  queryRoot<U extends HTMLElement>(selector: string): ElementHelper<U> {
    const el = document.querySelector(selector) as U;
    return el ? new ElementHelper<U>({ nativeElement: el } as any) : (null as any);
  }

  // Typed against the component, so a renamed input fails at compile time.
  setInput<K extends keyof T & string>(name: K, value: InputValue<T[K]>) {
    this.fixture.componentRef.setInput(name, value);
  }
}

export interface FakeServiceResult<T extends Type<any>, C = any> {
  provide: T;
  useFactory: () => any;
  fake: InstanceType<T>;
  _: C;
}

type FakeImpl<T extends Type<any>> = Partial<InstanceType<T>> | (() => Partial<InstanceType<T>> & { __?: any });

/** What `fake` returns: the real service type, with the stub's own members (jest.Mock, WritableSignal) winning. */
export type FakeValue<T extends Type<any>, I> = Omit<InstanceType<T>, keyof Unwrap<I>> & Unwrap<I>;
type Unwrap<I> = I extends () => infer R ? R : I;

export function fakeService<T extends Type<any>, I extends FakeImpl<T>>(service: T, impl: I) {
  // Extract the exact type of __ from the implementation
  type ControlsType = I extends () => Partial<InstanceType<T>> & { __: infer C } ? C : never;

  const fn = typeof impl === 'function' ? (impl as () => any) : () => impl;

  let instance: any;

  return {
    provide: service,
    useFactory: () => (instance = fn()),
    // The live fake the component received (fresh per test with the factory form).
    // Typed as the real service with the stub's own members (jest.Mock, WritableSignal) winning: no `as jest.Mock` casts.
    get fake() {
      return instance as FakeValue<T, I>;
    },
    get _() {
      return (instance as any).__ as ControlsType;
    },
  };
}

export type FakeService<
  T extends Type<any>,
  I extends Partial<InstanceType<T>> | (() => Partial<InstanceType<T>> & { __: any }) = any,
> = FakeServiceResult<T, I extends () => Partial<InstanceType<T>> & { __: infer C } ? C : never>;

type RenderProvider = Provider | EnvironmentProviders | FakeService<any>;

export async function render<T>(
  component: Type<T>,
  providers: RenderProvider[] = [],
  options?: {
    // A typed object `{ amount: 5 }` or the tuple form.
    inputs?: [string, any][] | Inputs<T>;
    components?: [Partial<Component>, Partial<Component>][];
    directives?: [Partial<Directive>, Partial<Directive>][];
    pipes?: [Partial<Pipe>, Partial<Pipe>][];
    providers?: FakeService<any>[];
  },
) {
  if (
    providers.length ||
    options?.providers?.length ||
    options?.components?.length ||
    options?.directives?.length ||
    options?.pipes?.length
  ) {
    const bed = TestBed.configureTestingModule({
      imports: [component],
      providers,
    });

    options?.providers?.forEach(({ provide, useFactory }) => {
      bed.overrideProvider(provide, { useFactory });
    });

    options?.components?.forEach(([from, to]) => {
      bed.overrideComponent(component, { remove: from, add: to });
    });
    options?.directives?.forEach(([from, to]) => {
      bed.overrideDirective(component, { remove: from, add: to });
    });
    options?.pipes?.forEach(([from, to]) => {
      bed.overridePipe(component, { remove: from, add: to });
    });
    await bed.compileComponents();
  }
  const fixture = TestBed.createComponent(component);

  // Set inputs
  const inputs = options?.inputs;
  const entries = Array.isArray(inputs) ? inputs : Object.entries(inputs ?? {});
  entries.forEach(([name, value]) => {
    fixture.componentRef.setInput(name, value);
  });
  return new RenderResult(fixture);
}

export function injectService<T>(service: Type<T>, providers: RenderProvider[] = []) {
  if (providers.length) {
    TestBed.configureTestingModule({ providers });
  }
  return TestBed.inject(service);
}

/**
 * Runs `fn` where `inject()` works: functional guards, resolvers, interceptors, `inject*` helpers.
 *   runInContext(() => AuthGuard(route, state), [authStub, routerStub]);
 */
export function runInContext<T>(fn: () => T, providers: RenderProvider[] = []) {
  if (providers.length) {
    TestBed.configureTestingModule({ providers });
  }
  return TestBed.runInInjectionContext(fn);
}

export function firstOutputFrom<T>(observable: OutputEmitterRef<T>) {
  return new Promise<T>(resolve => {
    const sub = observable.subscribe(value => {
      sub.unsubscribe();
      resolve(value);
    });
  });
}

export async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export type ResourceState<T> = { value?: T; status?: ResourceStatus; error?: Error };

/**
 * Puts a resource (httpResource/resource/rxResource) into one consistent state for a test:
 * `hasValue` follows `value`, `isLoading` follows `status`, and `status` defaults to 'resolved'
 * when a value is given or 'error' when an error is given.
 *   setResource(view.host.list, { value: CHEQUES });                  // resolved
 *   setResource(view.host.list, { status: 'reloading' });
 *   setResource(view.host.list, { error: new Error('down') });         // error
 * Call it before the first change detection that reads the resource: a `computed` that already
 * read the real signals keeps its cached value.
 */
export function setResource<T>(resource: Resource<T>, state: ResourceState<T>) {
  if ('value' in state) {
    jest.spyOn(resource, 'value').mockReturnValue(state.value as T);
    jest.spyOn(resource, 'hasValue').mockReturnValue(state.value !== undefined);
  }
  const status = state.status ?? (state.error ? 'error' : 'value' in state ? 'resolved' : undefined);
  if (status) {
    jest.spyOn(resource, 'status').mockReturnValue(status);
    jest.spyOn(resource, 'isLoading').mockReturnValue(status === 'loading' || status === 'reloading');
  }
  if (state.error) {
    jest.spyOn(resource, 'error').mockReturnValue(state.error);
  }
}

/** Runs pending effects and change detection, so effect-driven state is up to date before asserting. */
export function flushEffects() {
  TestBed.tick();
}
