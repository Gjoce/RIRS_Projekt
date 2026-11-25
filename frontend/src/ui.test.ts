import { describe, expect, it, vi } from 'vitest';
import { button, confirmButton, emptyState, skeleton } from './ui';

describe('ui', () => {
  it('button ob kliku pokliče funkcijo', () => {
    const onClick = vi.fn();
    const node = button('Shrani', onClick);
    expect(node.type).toBe('button');
    node.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('confirmButton izvede dejanje šele po potrditvi', () => {
    const run = vi.fn();
    const holder = confirmButton('Izbriši', 'Potrdi brisanje', run);
    holder.querySelector('button')!.click();
    expect(run).not.toHaveBeenCalled();
    const [confirm, cancel] = holder.querySelectorAll('button');
    expect(confirm!.textContent).toBe('Potrdi brisanje');
    expect(cancel!.textContent).toBe('Prekliči');
    confirm!.click();
    expect(run).toHaveBeenCalledOnce();
  });

  it('confirmButton s Prekliči vrne začetni gumb', () => {
    const holder = confirmButton('Izbriši', 'Potrdi', vi.fn());
    holder.querySelector('button')!.click();
    holder.querySelectorAll('button')[1]!.click();
    expect(holder.textContent).toBe('Izbriši');
  });

  it('emptyState prikaže naslov, besedilo in akcijo', () => {
    const action = button('Naloži', vi.fn());
    const node = emptyState('Ni strategij', 'Naloži prvo strategijo.', action);
    expect(node.querySelector('.empty-title')!.textContent).toBe('Ni strategij');
    expect(node.textContent).toContain('Naloži prvo strategijo.');
    expect(node.contains(action)).toBe(true);
  });

  it('skeleton je dostopen kot stanje nalaganja', () => {
    const node = skeleton();
    expect(node.getAttribute('role')).toBe('status');
    expect(node.getAttribute('aria-label')).toBe('Nalagam');
  });
});
