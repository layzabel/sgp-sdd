import { describe, expect, it } from 'vitest';
import {
  contarAcompanhamento,
  detalharProjeto,
  listarProjetos,
} from '../../../../src/domain/consultas.ts';
import { doc, item, marco, projeto, relatorio, time } from '../apoio.ts';

const DOC = doc({
  times: [time('t1', 'Plataforma', 1), time('t2', 'Mobile', 2)],
  projetos: [
    projeto('p1', 'Portal do Cliente', 3, 't1', { situacao: 'em_andamento' }),
    projeto('p2', 'App Mobile', 4, 't2', { situacao: 'em_andamento' }),
    projeto('p3', 'Portal Interno', 5, 't2', { situacao: 'planejado' }),
    projeto('p4', 'Ágora', 6, 't1', { situacao: 'concluido' }),
  ],
  relatorios: [
    relatorio('r1', 'p1', 7, '2026-03-05T10:00:00.000Z'),
    relatorio('r2', 'p2', 8, '2026-03-05T10:00:00.000Z'),
  ],
  marcos: [marco('m1', 'p1', 9, 'Kickoff'), marco('m2', 'p1', 10, 'Entrega')],
  itensCronograma: [item('i1', 'p1', 11, '2026-04-01')],
});

function nomes(lista: readonly { nome: string }[]) {
  return lista.map((p) => p.nome);
}

describe('consultas de projetos', () => {
  it('lista alfabética sem filtros', () => {
    expect(nomes(listarProjetos(DOC, { busca: '' }))).toEqual([
      'Ágora',
      'App Mobile',
      'Portal do Cliente',
      'Portal Interno',
    ]);
  });

  it('busca, situação e time combinados', () => {
    expect(nomes(listarProjetos(DOC, { busca: 'portal' }))).toEqual([
      'Portal do Cliente',
      'Portal Interno',
    ]);
    expect(nomes(listarProjetos(DOC, { busca: 'portal', situacao: 'em_andamento' }))).toEqual([
      'Portal do Cliente',
    ]);
    expect(
      nomes(listarProjetos(DOC, { busca: 'portal', situacao: 'em_andamento', timeId: 't2' })),
    ).toEqual([]);
    expect(nomes(listarProjetos(DOC, { busca: '', timeId: 't2' }))).toEqual([
      'App Mobile',
      'Portal Interno',
    ]);
    expect(nomes(listarProjetos(DOC, { busca: '', situacao: '' }))).toHaveLength(4);
  });

  it('detalharProjeto devolve projeto, time e acompanhamento só do projeto', () => {
    const detalhe = detalharProjeto(DOC, 'p1');
    expect(detalhe?.projeto.nome).toBe('Portal do Cliente');
    expect(detalhe?.time?.nome).toBe('Plataforma');
    expect(detalhe?.relatorios.map((r) => r.id)).toEqual(['r1']);
    expect(detalhe?.marcos.map((m) => m.id)).toEqual(['m1', 'm2']);
    expect(detalhe?.itensCronograma.map((i) => i.id)).toEqual(['i1']);
    expect(detalharProjeto(DOC, 'x')).toBeNull();
  });

  it('contarAcompanhamento', () => {
    expect(contarAcompanhamento(DOC, 'p1')).toEqual({
      relatorios: 1,
      marcos: 2,
      itensCronograma: 1,
    });
    expect(contarAcompanhamento(DOC, 'p3')).toEqual({
      relatorios: 0,
      marcos: 0,
      itensCronograma: 0,
    });
  });
});
