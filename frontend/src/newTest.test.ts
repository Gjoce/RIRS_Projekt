import { describe, expect, it } from 'vitest';
import { commonRange, yearsBack } from './newTest';
import type { Instrument, Reference } from './refdata';

const instrument = (ticker: string, from: string | null, to: string | null): Instrument => ({
  ticker,
  description: ticker,
  asset_class: 'crypto',
  data_from: from,
  data_to: to,
  candles: from ? 100 : 0,
});
const ref = (...instruments: Instrument[]): Reference => ({ instruments, venues: [], propPlans: [], strategies: [] });

describe('commonRange', () => {
  it('vrne presek razponov izbranih sredstev', () => {
    const r = ref(instrument('BTCUSDT', '2025-01-01T00:00:00Z', '2025-12-31T23:59:00Z'), instrument('EURUSD', '2025-03-01T00:00:00Z', '2025-10-31T00:00:00Z'));
    expect(commonRange(r, ['BTCUSDT', 'EURUSD'])).toEqual({ from: '2025-03-01', to: '2025-10-31' });
  });

  it('vrne null, če sredstvo nima podatkov', () => {
    const r = ref(instrument('BTCUSDT', '2025-01-01T00:00:00Z', '2025-12-31T00:00:00Z'), instrument('ETHUSDT', null, null));
    expect(commonRange(r, ['BTCUSDT', 'ETHUSDT'])).toBeNull();
  });

  it('vrne null, če se razpona ne prekrivata', () => {
    const r = ref(instrument('A', '2024-01-01T00:00:00Z', '2024-06-01T00:00:00Z'), instrument('B', '2025-01-01T00:00:00Z', '2025-06-01T00:00:00Z'));
    expect(commonRange(r, ['A', 'B'])).toBeNull();
  });

  it('vrne null brez izbranih sredstev', () => {
    expect(commonRange(ref(), [])).toBeNull();
  });
});

describe('yearsBack', () => {
  it('izračuna začetek obdobja zadnjih n let', () => {
    expect(yearsBack({ from: '2015-01-01', to: '2025-12-31' }, 1)).toBe('2025-01-01');
  });

  it('začetek omeji na začetek podatkov', () => {
    expect(yearsBack({ from: '2025-01-01', to: '2025-12-31' }, 5)).toBe('2025-01-01');
  });
});
