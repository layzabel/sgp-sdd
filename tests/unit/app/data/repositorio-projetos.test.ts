import { describe, expect, it } from 'vitest';
import { CHAVE } from '../../../../src/data/documento.ts';
import { doc, item, marco, projeto, relatorio, repo, time } from '../apoio.ts';

const ENTRADA = {
  nome: ' Portal do Cliente ',
  descricao: '',
  inicio: '2026-03-01',
  terminoPrevisto: '',
  situacao: 'planejado',
  timeId: 't1',
};

const COM_ACOMPANHAMENTO = doc({
  times: [time('t1', 'Plataforma', 1), time('t2', 'Mobile', 2)],
  projetos: [projeto('p1', 'Portal', 3, 't1'), projeto('p2', 'App', 4, 't2')],
  relatorios: [
    relatorio('r1', 'p1', 5, '2026-03-05T10:00:00.000Z'),
    relatorio('r2', 'p1', 6, '2026-03-06T10:00:00.000Z'),
    relatorio('r3', 'p2', 7, '2026-03-06T10:00:00.000Z'),
  ],
  marcos: [marco('m1', 'p1', 8, 'Kickoff'), marco('m2', 'p2', 9, 'Kickoff')],
  itensCronograma: [item('i1', 'p1', 10, '2026-04-01'), item('i2', 'p1', 11, '2026-04-02')],
});

describe('repositório — projetos', () => {
  it('criarProjeto apara e grava', () => {
    const { repositorio } = repo(doc({ times: [time('t1', 'Plataforma', 1)] }));
    const r = repositorio.criarProjeto(ENTRADA);
    expect(r).toEqual({
      ok: true,
      valor: { id: 'novo-1', seq: 2, ...ENTRADA, nome: 'Portal do Cliente' },
    });
  });

  it('timeId inexistente → "Selecione um time cadastrado."', () => {
    const { repositorio, armazenamento } = repo(doc({ times: [time('t1', 'Plataforma', 1)] }));
    expect(repositorio.criarProjeto({ ...ENTRADA, timeId: 'fantasma' })).toEqual({
      ok: false,
      erro: { tipo: 'validacao', campos: { timeId: 'Selecione um time cadastrado.' } },
    });
    expect(armazenamento.gravacoes).toBe(0);
  });

  it('erros de campo e time inexistente indicados juntos', () => {
    const { repositorio } = repo(doc({ times: [time('t1', 'Plataforma', 1)] }));
    const r = repositorio.criarProjeto({ ...ENTRADA, nome: '', timeId: 'fantasma' });
    expect(r.ok === false && r.erro).toEqual({
      tipo: 'validacao',
      campos: { nome: 'Informe o nome.', timeId: 'Selecione um time cadastrado.' },
    });
  });

  it('atualizarProjeto troca situação e time', () => {
    const { repositorio } = repo(COM_ACOMPANHAMENTO);
    const r = repositorio.atualizarProjeto('p1', {
      ...ENTRADA,
      nome: 'Portal',
      situacao: 'em_andamento',
      timeId: 't2',
    });
    expect(r.ok && r.valor).toMatchObject({
      id: 'p1',
      seq: 3,
      situacao: 'em_andamento',
      timeId: 't2',
    });
    expect(repositorio.getSnapshot().projetos.find((p) => p.id === 'p1')?.timeId).toBe('t2');
  });

  it('atualizar/excluir inexistente → nao_encontrado', () => {
    const { repositorio } = repo(COM_ACOMPANHAMENTO);
    expect(repositorio.atualizarProjeto('x', ENTRADA)).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
    expect(repositorio.excluirProjeto('x')).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
  });

  it('excluirProjeto remove o acompanhamento do projeto numa única gravação', () => {
    const { repositorio, armazenamento } = repo(COM_ACOMPANHAMENTO);
    expect(repositorio.excluirProjeto('p1')).toEqual({
      ok: true,
      valor: { relatorios: 2, marcos: 1, itensCronograma: 2 },
    });
    expect(armazenamento.gravacoes).toBe(1);
    const salvo = JSON.parse(armazenamento.getItem(CHAVE) ?? '{}');
    expect(salvo.projetos.map((p: { id: string }) => p.id)).toEqual(['p2']);
    expect(salvo.relatorios.map((r: { id: string }) => r.id)).toEqual(['r3']);
    expect(salvo.marcos.map((m: { id: string }) => m.id)).toEqual(['m2']);
    expect(salvo.itensCronograma).toEqual([]);
  });

  it('falha de gravação na exclusão → nada removido', () => {
    const { repositorio, armazenamento } = repo(COM_ACOMPANHAMENTO);
    armazenamento.falharProximaGravacao();
    expect(repositorio.excluirProjeto('p1')).toEqual({ ok: false, erro: { tipo: 'gravacao' } });
    expect(repositorio.getSnapshot()).toEqual(COM_ACOMPANHAMENTO);
  });
});
