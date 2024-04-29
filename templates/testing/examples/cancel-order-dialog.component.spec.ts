import { fakeService, renderPage, RenderResult } from '@/core/test';
import { CancelOrderDialogComponent } from './cancel-order-dialog.component';
import { DialogRef, OrdersApi } from './orders.services';

// One fake per inject(). The dialog data is read once, so it is part of the world.
const api = fakeService(OrdersApi, () => ({ cancel: jest.fn() }));
const dialog = fakeService(DialogRef, () => ({ data: 7, close: jest.fn() }));
const providers = [api, dialog];

describe('CancelOrderDialogComponent', () => {
  let view: RenderResult<CancelOrderDialogComponent>;

  // Helpers named after what the user does, so the tests read like a story.
  const reason = () => view.$('textarea');
  const confirmButton = () => view.getByText('Confirm') as HTMLButtonElement;
  const backButton = () => view.getByText('Back') as HTMLButtonElement;
  const errorShown = () => view.getByText('A reason is required') !== null;
  /** The callback the component handed to the API, so the test decides when the API "answers". */
  const answer = (ok: boolean) => api.fake.cancel.mock.calls[0][1](ok);

  beforeEach(async () => {
    view = await renderPage(CancelOrderDialogComponent, providers);
    view.detectChanges();
  });

  it('shows the title and no error before the user does anything', () => {
    expect(view.getByText('Cancel order')).toBeTruthy();
    expect(errorShown()).toBe(false);
  });

  describe('confirming with an invalid reason', () => {
    it.each([
      ['empty', ''],
      ['only spaces', '   '],
      ['HTML', '<b>hi</b>'],
    ])('shows the error and sends nothing when the reason is %s', (_, value) => {
      reason().input(value);
      confirmButton().click();
      view.detectChanges();

      expect(errorShown()).toBe(true);
      expect(api.fake.cancel).not.toHaveBeenCalled();
    });
  });

  describe('confirming with a valid reason', () => {
    beforeEach(() => {
      reason().input('  wrong address  ');
      confirmButton().click();
      view.detectChanges();
    });

    it('sends the trimmed reason with the id from the dialog data', () => {
      expect(api.fake.cancel).toHaveBeenCalledWith({ orderId: 7, reason: 'wrong address' }, expect.any(Function));
    });

    it('shows loading, disables Back and ignores a second click', () => {
      expect(view.host.loading()).toBe(true);
      expect(backButton().disabled).toBe(true);

      view.host.confirm();
      expect(api.fake.cancel).toHaveBeenCalledTimes(1);
    });

    it('closes the dialog with true when the API says yes', () => {
      answer(true);

      expect(view.host.loading()).toBe(false);
      expect(dialog.fake.close).toHaveBeenCalledWith(true);
    });

    it('keeps the dialog open when the API says no', () => {
      answer(false);

      expect(view.host.loading()).toBe(false);
      expect(dialog.fake.close).not.toHaveBeenCalled();
    });
  });

  it('Back closes the dialog with false', () => {
    backButton().click();

    expect(dialog.fake.close).toHaveBeenCalledWith(false);
  });
});
