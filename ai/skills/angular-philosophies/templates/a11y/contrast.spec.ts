import { contrast, MIN_CONTRAST } from './contrast';

describe('contrast', () => {
  it('is 21 for black on white and 1 for identical colours', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('does not depend on which colour is the foreground', () => {
    expect(contrast('#0059ff', '#101820')).toBeCloseTo(contrast('#101820', '#0059ff'), 10);
  });

  it('matches a known reference value (#767676 on white is 4.54, the classic AA grey)', () => {
    expect(contrast('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
  });

  it('shows why a saturated blue fails as small text on a dark background', () => {
    const ratio = contrast('#0059ff', '#101820');

    expect(ratio).toBeLessThan(MIN_CONTRAST.smallText);
    expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST.largeText - 0.5);
  });
});
