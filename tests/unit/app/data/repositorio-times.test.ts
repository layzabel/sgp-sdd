import { describe, expect, it } from 'vitest';
import { CHAVE } from '../../../../src/data/documento.ts';
import { dev, doc, projeto, repo, time } from '../apoio.ts';

describe('repositório — times', () => {
  it('criarTime apara e grava', () => {
    const { repositorio } = repo();
    const r = repositorio.criarTime({ nome: '  Plataforma ', descricao: ' Web ', area: '' });
    expect(r).toEqual({
      ok: true,
      valor: { id: 'novo-1', seq: 1, nome: 'Plataforma', descricao: 'Web', area: '' },
    });
    expect(repositorio.getSnapshot().times).toHaveLength(1);
  });

  it('nome repetido sem diferenciar caixa → validacao.nome', () => {
    const { repositorio, armazenamento } = repo(doc({ times: [time('t1', 'Plataforma', 1)] }));
    expect(repositorio.criarTime({ nome: ' plataforma ' })).toEqual({
      ok: false,
      erro: {
        tipo: 'validacao',
        campos: { nome: 'Já existe um time com esse nome. Escolha outro nome.' },
      },
    });
    expect(armazenamento.gravacoes).toBe(0);
  });

  it('nome vazio e limite de tamanho', () => {
    const { repositorio } = repo();
    const r = repositorio.criarTime({ nome: '   ' });
    expect(r.ok === false && r.erro).toEqual({
      tipo: 'validacao',
      campos: { nome: 'Informe o nome.' },
    });
  });

  it('atualizarTime mantendo o próprio nome não é duplicidade; outro nome existente é', () => {
    const { repositorio } = repo(
      doc({ times: [time('t1', 'Plataforma', 1), time('t2', 'Mobile', 2)] }),
    );
    const r = repositorio.atualizarTime('t1', {
      nome: 'PLATAFORMA',
      descricao: 'nova',
      area: 'Web',
    });
    expect(r).toEqual({
      ok: true,
      valor: { id: 't1', seq: 1, nome: 'PLATAFORMA', descricao: 'nova', area: 'Web' },
    });
    const dup = repositorio.atualizarTime('t2', { nome: 'plataforma' });
    expect(dup.ok === false && dup.erro.tipo).toBe('validacao');
  });

  it('atualizar/excluir id inexistente → nao_encontrado', () => {
    const { repositorio } = repo();
    expect(repositorio.atualizarTime('x', { nome: 'A' })).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
    expect(repositorio.excluirTime('x')).toEqual({ ok: false, erro: { tipo: 'nao_encontrado' } });
  });

  it('excluirTime com vínculos → bloqueado com contagens, sem gravar', () => {
    const { repositorio, armazenamento } = repo(
      doc({
        times: [time('t1', 'Plataforma', 1)],
        desenvolvedores: [dev('d1', 'Ana', 2, 't1'), dev('d2', 'Bia', 3, 't1')],
        projetos: [projeto('p1', 'Portal', 4, 't1')],
      }),
    );
    expect(repositorio.excluirTime('t1')).toEqual({
      ok: false,
      erro: { tipo: 'vinculos', desenvolvedores: 2, projetos: 1 },
    });
    expect(armazenamento.gravacoes).toBe(0);
    expect(repositorio.getSnapshot().times).toHaveLength(1);
  });

  it('excluirTime sem vínculos remove', () => {
    const { repositorio, armazenamento } = repo(doc({ times: [time('t1', 'Mobile', 1)] }));
    expect(repositorio.excluirTime('t1')).toEqual({ ok: true, valor: undefined });
    expect(repositorio.getSnapshot().times).toEqual([]);
    expect(JSON.parse(armazenamento.getItem(CHAVE) ?? '{}').times).toEqual([]);
  });

  it('falha de gravação → documento inalterado', () => {
    const inicial = doc({ times: [time('t1', 'Mobile', 1)] });
    const { repositorio, armazenamento } = repo(inicial);
    armazenamento.falharProximaGravacao();
    expect(repositorio.excluirTime('t1')).toEqual({ ok: false, erro: { tipo: 'gravacao' } });
    armazenamento.falharProximaGravacao();
    expect(repositorio.atualizarTime('t1', { nome: 'Outro' })).toEqual({
      ok: false,
      erro: { tipo: 'gravacao' },
    });
    expect(repositorio.getSnapshot()).toEqual(inicial);
    expect(JSON.parse(armazenamento.getItem(CHAVE) ?? '{}')).toEqual(inicial);
  });
});
