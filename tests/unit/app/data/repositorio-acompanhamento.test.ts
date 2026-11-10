import { describe, expect, it } from 'vitest';
import { doc, projeto, repo, time } from '../apoio.ts';

const BASE = doc({
  times: [time('t1', 'Plataforma', 1)],
  projetos: [projeto('p1', 'Portal', 2, 't1')],
});
const AGORA = new Date('2026-03-12T15:30:00.000Z');

describe('repositório — acompanhamento', () => {
  it('criarRelatorio grava texto aparado, criadoEm de agora() e seq novo', () => {
    const { repositorio } = repo(BASE, AGORA);
    expect(repositorio.criarRelatorio('p1', { texto: '  Sprint 1 ok \n' })).toEqual({
      ok: true,
      valor: {
        id: 'novo-1',
        seq: 3,
        projetoId: 'p1',
        texto: 'Sprint 1 ok',
        criadoEm: '2026-03-12T15:30:00.000Z',
      },
    });
    expect(repositorio.getSnapshot().seq).toBe(3);
  });

  it('criarMarco e criarItemCronograma', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.criarMarco('p1', { descricao: 'Kickoff' })).toEqual({
      ok: true,
      valor: { id: 'novo-1', seq: 3, projetoId: 'p1', descricao: 'Kickoff' },
    });
    expect(
      repositorio.criarItemCronograma('p1', { atividade: 'Testes', dataPrevista: '2026-04-05' }),
    ).toEqual({
      ok: true,
      valor: {
        id: 'novo-2',
        seq: 4,
        projetoId: 'p1',
        atividade: 'Testes',
        dataPrevista: '2026-04-05',
      },
    });
    expect(repositorio.getSnapshot().marcos).toHaveLength(1);
    expect(repositorio.getSnapshot().itensCronograma).toHaveLength(1);
  });

  it('projeto inexistente → nao_encontrado', () => {
    const { repositorio, armazenamento } = repo(BASE);
    const naoEncontrado = { ok: false, erro: { tipo: 'nao_encontrado' } };
    expect(repositorio.criarRelatorio('x', { texto: 'a' })).toEqual(naoEncontrado);
    expect(repositorio.criarMarco('x', { descricao: 'a' })).toEqual(naoEncontrado);
    expect(
      repositorio.criarItemCronograma('x', { atividade: 'a', dataPrevista: '2026-01-01' }),
    ).toEqual(naoEncontrado);
    expect(armazenamento.gravacoes).toBe(0);
  });

  it('entrada inválida → validacao', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.criarRelatorio('p1', { texto: ' ' })).toEqual({
      ok: false,
      erro: { tipo: 'validacao', campos: { texto: 'Informe o texto do relatório.' } },
    });
  });

  it('falha de gravação → inalterado', () => {
    const { repositorio, armazenamento } = repo(BASE);
    armazenamento.falharProximaGravacao();
    expect(repositorio.criarMarco('p1', { descricao: 'Kickoff' })).toEqual({
      ok: false,
      erro: { tipo: 'gravacao' },
    });
    expect(repositorio.getSnapshot()).toEqual(BASE);
  });

  it('não expõe edição nem exclusão de relatório, marco ou item (FR-030)', () => {
    const { repositorio } = repo(BASE);
    const operacoes = Object.keys(repositorio);
    const proibidas = operacoes.filter((nome) =>
      /^(atualizar|excluir|editar|remover)(Relatorio|Marco|Item)/.test(nome),
    );
    expect(proibidas).toEqual([]);
    expect(operacoes).toEqual(
      expect.arrayContaining(['criarRelatorio', 'criarMarco', 'criarItemCronograma']),
    );
  });
});
