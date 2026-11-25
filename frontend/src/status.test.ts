import { describe, expect, it } from 'vitest';
import { statusBadge, statusLabel, when } from './status';

describe('status', () => {
  it('statusLabel prevede znana stanja v slovenščino', () => {
    expect(statusLabel('draft')).toBe('Osnutek');
    expect(statusLabel('changes_requested')).toBe('Zahtevane spremembe');
  });

  it('statusLabel neznano stanje vrne nespremenjeno', () => {
    expect(statusLabel('queued')).toBe('queued');
  });

  it('statusBadge ustvari značko z razredom in besedilom', () => {
    const badge = statusBadge('approved');
    expect(badge.tagName).toBe('SPAN');
    expect(badge.className).toBe('badge badge-approved');
    expect(badge.textContent).toBe('Odobren');
  });

  it('when brez vrednosti vrne pomišljaj', () => {
    expect(when(null)).toBe('–');
    expect(when('2025-05-01T10:00:00Z')).not.toBe('–');
  });
});
