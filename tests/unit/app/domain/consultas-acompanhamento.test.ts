import { describe, expect, it } from 'vitest';
import { detalharProjeto } from '../../../../src/domain/consultas.ts';
import { doc, item, marco, projeto, relatorio, time } from '../apoio.ts';

const DOC = doc({
  times: [time('t1', 'Plataforma', 1)],
  projetos: [projeto('p1', 'Portal', 2, 't1'), projeto('p2', 'Outro', 3, 't1')],
  relatorios: [
    relatorio('r05', 'p1', 4, '2026-03-05T10:00:00.000Z'),
    relatorio('r12', 'p1', 5, '2026-03-12T10:00:00.000Z'),
    relatorio('r10', 'p1', 6, '2026-03-10T10:00:00.000Z'),
    relatorio('r12b', 'p1', 7, '2026-03-12T10:00:00.000Z'),
    relatorio('outro', 'p2', 8, '2026-03-20T10:00:00.000Z'),
  ],
  marcos: [
    marco('m1', 'p1', 9, 'Kickoff'),
    marco('mx', 'p2', 10, 'Outro'),
    marco('m2', 'p1', 11, 'Protótipo'),
    marco('m3', 'p1', 12, 'Entrega'),
  ],
  itensCronograma: [
    item('i20', 'p1', 13, '2026-04-20'),
    item('i05', 'p1', 14, '2026-04-05'),
    item('i12', 'p1', 15, '2026-04-12'),
    item('i05b', 'p1', 16, '2026-04-05'),
    item('ix', 'p2', 17, '2026-01-01'),
  ],
});

describe('ordem do acompanhamento em detalharProjeto', () => {
  const detalhe = detalharProjeto(DOC, 'p1');

  it('relatórios: criadoEm decrescente, mesmo instante → maior seq primeiro (FR-027)', () => {
    expect(detalhe?.relatorios.map((r) => r.id)).toEqual(['r12b', 'r12', 'r10', 'r05']);
  });

  it('marcos: ordem de criação (FR-028)', () => {
    expect(detalhe?.marcos.map((m) => m.descricao)).toEqual(['Kickoff', 'Protótipo', 'Entrega']);
  });

  it('itens: data prevista crescente, empate pela ordem de criação (FR-029)', () => {
    expect(detalhe?.itensCronograma.map((i) => i.id)).toEqual(['i05', 'i05b', 'i12', 'i20']);
  });
});
