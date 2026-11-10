import { describe, expect, it } from 'vitest';
import { detalharTime, listarTimes } from '../../../../src/domain/consultas.ts';
import { dev, doc, projeto, time } from '../apoio.ts';

const DOC = doc({
  times: [
    time('t1', 'Plataforma', 1),
    time('t2', 'Mobile', 2),
    time('t3', 'ágil', 3),
    time('t4', 'mobile', 4),
  ],
  desenvolvedores: [
    dev('d1', 'Bruno', 5, 't1'),
    dev('d2', 'Ana', 6, 't1'),
    dev('d3', 'Caio', 7, 't2'),
  ],
  projetos: [projeto('p1', 'Portal', 8, 't1'), projeto('p2', 'App', 9, 't2')],
});

describe('consultas de times', () => {
  it('lista em ordem alfabética sem acento/caixa, desempate por seq', () => {
    expect(listarTimes(DOC, { busca: '' }).map((t) => t.id)).toEqual(['t3', 't2', 't4', 't1']);
  });

  it('busca em nome sem acento/caixa', () => {
    expect(listarTimes(DOC, { busca: 'plat' }).map((t) => t.nome)).toEqual(['Plataforma']);
    expect(listarTimes(DOC, { busca: 'AGIL' }).map((t) => t.nome)).toEqual(['ágil']);
    expect(listarTimes(DOC, { busca: 'xyz' })).toEqual([]);
  });

  it('detalharTime devolve time, desenvolvedores e projetos do time em ordem alfabética', () => {
    const detalhe = detalharTime(DOC, 't1');
    expect(detalhe?.time.nome).toBe('Plataforma');
    expect(detalhe?.desenvolvedores.map((d) => d.nome)).toEqual(['Ana', 'Bruno']);
    expect(detalhe?.projetos.map((p) => p.nome)).toEqual(['Portal']);
  });

  it('detalharTime de id inexistente → null', () => {
    expect(detalharTime(DOC, 'nao-existe')).toBeNull();
  });
});
