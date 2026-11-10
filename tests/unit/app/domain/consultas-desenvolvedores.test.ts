import { describe, expect, it } from 'vitest';
import { detalharDesenvolvedor, listarDesenvolvedores } from '../../../../src/domain/consultas.ts';
import { dev, doc, time } from '../apoio.ts';

const DOC = doc({
  times: [time('t1', 'Plataforma', 1), time('t2', 'Mobile', 2)],
  desenvolvedores: [
    dev('d1', 'Bruno Lima', 3, 't1', { nivel: 'senior', tecnologia: 'Ana Lang' }),
    dev('d2', 'Ana Souza', 4, 't1', { nivel: 'pleno' }),
    dev('d3', 'Ana Paula', 5, 't2', { nivel: 'pleno' }),
    dev('d4', 'Álvaro', 6, 't2', { nivel: 'junior' }),
  ],
});

function nomes(lista: readonly { nome: string }[]) {
  return lista.map((d) => d.nome);
}

describe('consultas de desenvolvedores', () => {
  it('ordem alfabética', () => {
    expect(nomes(listarDesenvolvedores(DOC, { busca: '' }))).toEqual([
      'Álvaro',
      'Ana Paula',
      'Ana Souza',
      'Bruno Lima',
    ]);
  });

  it('busca só no nome, combinada com time e nível', () => {
    expect(nomes(listarDesenvolvedores(DOC, { busca: 'ana' }))).toEqual(['Ana Paula', 'Ana Souza']);
    expect(nomes(listarDesenvolvedores(DOC, { busca: 'ana', timeId: 't1' }))).toEqual([
      'Ana Souza',
    ]);
    expect(nomes(listarDesenvolvedores(DOC, { busca: '', timeId: 't2', nivel: 'junior' }))).toEqual(
      ['Álvaro'],
    );
    expect(nomes(listarDesenvolvedores(DOC, { busca: 'ana', nivel: 'senior' }))).toEqual([]);
  });

  it('detalharDesenvolvedor devolve o desenvolvedor e o time', () => {
    const detalhe = detalharDesenvolvedor(DOC, 'd1');
    expect(detalhe?.desenvolvedor.nome).toBe('Bruno Lima');
    expect(detalhe?.time?.nome).toBe('Plataforma');
    expect(detalharDesenvolvedor(DOC, 'x')).toBeNull();
  });
});
