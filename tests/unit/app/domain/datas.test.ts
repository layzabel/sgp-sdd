import { describe, expect, it } from 'vitest';
import { dataValida, formatarData, formatarDataDeMomento } from '../../../../src/domain/datas.ts';

describe('datas', () => {
  it.each(['2026-03-10', '2024-02-29', '2000-02-29', '2026-12-31'])('aceita %s', (data) => {
    expect(dataValida(data)).toBe(true);
  });

  it.each([
    '2026-02-29',
    '1900-02-29',
    '2026-13-01',
    '2026-00-10',
    '2026-04-31',
    '2026-03-00',
    '2026-3-1',
    '',
    'amanhã',
    '10/03/2026',
  ])('rejeita %j', (data) => {
    expect(dataValida(data)).toBe(false);
  });

  it('formatarData converte para dd/mm/aaaa', () => {
    expect(formatarData('2026-03-10')).toBe('10/03/2026');
  });

  it('formatarDataDeMomento devolve a data local do instante', () => {
    const momento = new Date(2026, 2, 5, 23, 30);
    expect(formatarDataDeMomento(momento.toISOString())).toBe('05/03/2026');
  });
});
