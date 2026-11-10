import { describe, expect, it } from 'vitest';
import {
  aparar,
  chaveUnicidade,
  compararPorNome,
  contem,
  normalizar,
} from '../../../../src/domain/texto.ts';

describe('texto', () => {
  it('aparar remove espaços das pontas e só-espaços vira vazio', () => {
    expect(aparar('  Ana  ')).toBe('Ana');
    expect(aparar('   ')).toBe('');
    expect(aparar('\t\n')).toBe('');
  });

  it('normalizar remove acentos e caixa', () => {
    expect(normalizar('Ação')).toBe('acao');
    expect(normalizar('ÁLVARO')).toBe('alvaro');
  });

  it('contem casa trecho em qualquer posição sem acento/caixa', () => {
    expect(contem('Plataforma', 'plat')).toBe(true);
    expect(contem('Plataforma', 'FORM')).toBe(true);
    expect(contem('Gestão de Ações', 'acoes')).toBe(true);
    expect(contem('Mobile', 'plat')).toBe(false);
  });

  it('termo vazio ou só espaços casa tudo', () => {
    expect(contem('Mobile', '')).toBe(true);
    expect(contem('Mobile', '   ')).toBe(true);
  });

  it('compararPorNome ordena sem acento/caixa e desempata por seq', () => {
    const itens = [
      { nome: 'Bruno', seq: 1 },
      { nome: 'andré', seq: 2 },
      { nome: 'álvaro', seq: 3 },
    ];
    expect([...itens].sort(compararPorNome).map((i) => i.nome)).toEqual([
      'álvaro',
      'andré',
      'Bruno',
    ]);
    const empate = [
      { nome: 'Ana', seq: 9 },
      { nome: 'ana', seq: 2 },
    ];
    expect([...empate].sort(compararPorNome).map((i) => i.seq)).toEqual([2, 9]);
  });

  it('chaveUnicidade apara e coloca em minúsculas', () => {
    expect(chaveUnicidade('  Ana@Empresa.com ')).toBe('ana@empresa.com');
  });
});
