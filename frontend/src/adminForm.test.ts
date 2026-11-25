import { describe, expect, it } from 'vitest';
import { buildForm, type Field } from './adminForm';

const fields: Field[] = [
  { name: 'id', label: 'Ključ', type: 'text' },
  { name: 'maker_pct', label: 'Maker', type: 'number' },
  { name: 'pay_spread', label: 'Razpon', type: 'checkbox' },
];

describe('buildForm', () => {
  it('prebere vrednosti in pretvori števila z decimalno vejico', () => {
    const form = buildForm(fields, { id: 'binance', maker_pct: '0,1', pay_spread: true });
    expect(form.values()).toEqual({ id: 'binance', maker_pct: 0.1, pay_spread: true });
  });

  it('prazno številsko polje pošlje kot null', () => {
    const form = buildForm(fields, { id: 'x' });
    expect(form.values().maker_pct).toBeNull();
  });

  it('zaklenjena polja so onemogočena in niso v vrednostih', () => {
    const form = buildForm(fields, { id: 'binance', maker_pct: 1 }, ['id']);
    expect((form.element.querySelector('#admin-id') as HTMLInputElement).disabled).toBe(true);
    expect(form.values()).not.toHaveProperty('id');
  });

  it('showErrors prikaže napake ob poljih in splošno napako', () => {
    const form = buildForm(fields, {});
    form.showErrors({ maker_pct: 'mora biti število' }, 'Shranjevanje ni uspelo');
    expect(form.element.textContent).toContain('mora biti število');
    expect(form.element.querySelector('[data-general]')!.textContent).toBe('Shranjevanje ni uspelo');
  });
});
