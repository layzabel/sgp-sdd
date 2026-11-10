import { describe, expect, it, vi } from 'vitest';
import { ArmazenamentoEmMemoria } from '../../../../src/data/armazenamento.ts';
import { CHAVE, documentoVazio } from '../../../../src/data/documento.ts';
import { criarRepositorio } from '../../../../src/data/repositorio.ts';

function novoRepo(valorInicial: string | null = null) {
  const armazenamento = new ArmazenamentoEmMemoria(valorInicial);
  let n = 0;
  const repositorio = criarRepositorio({
    armazenamento,
    gerarId: () => `id-${++n}`,
    agora: () => new Date('2026-03-10T12:00:00.000Z'),
  });
  return { armazenamento, repositorio };
}

describe('repositório — base', () => {
  it('chave ausente: estado ok, documento vazio, nada gravado', () => {
    const { armazenamento, repositorio } = novoRepo();
    expect(repositorio.estado).toBe('ok');
    expect(repositorio.getSnapshot()).toEqual(documentoVazio());
    expect(armazenamento.gravacoes).toBe(0);
    expect(armazenamento.getItem(CHAVE)).toBeNull();
  });

  it('getSnapshot mantém a mesma referência até gravar', () => {
    const { repositorio } = novoRepo();
    const antes = repositorio.getSnapshot();
    expect(repositorio.getSnapshot()).toBe(antes);
    expect(repositorio.criarTime({ nome: 'Plataforma' }).ok).toBe(true);
    expect(repositorio.getSnapshot()).not.toBe(antes);
  });

  it('cada gravação faz exatamente um setItem na chave sgp:dados e incrementa seq', () => {
    const { armazenamento, repositorio } = novoRepo();
    const r = repositorio.criarTime({ nome: 'Plataforma' });
    expect(r).toEqual({
      ok: true,
      valor: { id: 'id-1', seq: 1, nome: 'Plataforma', descricao: '', area: '' },
    });
    expect(armazenamento.gravacoes).toBe(1);
    const salvo = JSON.parse(armazenamento.getItem(CHAVE) ?? 'null');
    expect(salvo.seq).toBe(1);
    expect(salvo.times).toHaveLength(1);
  });

  it('subscribe notifica só após gravação bem-sucedida e pode ser cancelado', () => {
    const { armazenamento, repositorio } = novoRepo();
    const ouvinte = vi.fn();
    const cancelar = repositorio.subscribe(ouvinte);
    repositorio.criarTime({ nome: '' });
    expect(ouvinte).not.toHaveBeenCalled();
    armazenamento.falharProximaGravacao();
    repositorio.criarTime({ nome: 'A' });
    expect(ouvinte).not.toHaveBeenCalled();
    repositorio.criarTime({ nome: 'B' });
    expect(ouvinte).toHaveBeenCalledTimes(1);
    cancelar();
    repositorio.criarTime({ nome: 'C' });
    expect(ouvinte).toHaveBeenCalledTimes(1);
  });

  it('falha em setItem → gravacao, snapshot e valor armazenado inalterados', () => {
    const { armazenamento, repositorio } = novoRepo();
    repositorio.criarTime({ nome: 'A' });
    const snapshot = repositorio.getSnapshot();
    const armazenado = armazenamento.getItem(CHAVE);
    armazenamento.falharProximaGravacao(new DOMException('cheio', 'QuotaExceededError'));
    expect(repositorio.criarTime({ nome: 'B' })).toEqual({ ok: false, erro: { tipo: 'gravacao' } });
    expect(repositorio.getSnapshot()).toBe(snapshot);
    expect(armazenamento.getItem(CHAVE)).toBe(armazenado);
  });

  it('valor ilegível → corrompido, nenhuma escrita e valor preservado', () => {
    const { armazenamento, repositorio } = novoRepo('{ilegível');
    expect(repositorio.estado).toBe('corrompido');
    expect(repositorio.criarTime({ nome: 'A' })).toEqual({ ok: false, erro: { tipo: 'gravacao' } });
    expect(armazenamento.gravacoes).toBe(0);
    expect(armazenamento.getItem(CHAVE)).toBe('{ilegível');
  });

  it('getItem que lança → indisponivel, sem escrita', () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    armazenamento.falharLeitura();
    const repositorio = criarRepositorio({ armazenamento });
    expect(repositorio.estado).toBe('indisponivel');
    expect(repositorio.getSnapshot()).toEqual(documentoVazio());
    expect(repositorio.criarTime({ nome: 'A' })).toEqual({ ok: false, erro: { tipo: 'gravacao' } });
    expect(armazenamento.gravacoes).toBe(0);
  });

  it('documento existente é carregado', () => {
    const doc = {
      ...documentoVazio(),
      seq: 5,
      times: [{ id: 't', seq: 5, nome: 'Mobile', descricao: '', area: '' }],
    };
    const { repositorio } = novoRepo(JSON.stringify(doc));
    expect(repositorio.getSnapshot()).toEqual(doc);
    const r = repositorio.criarTime({ nome: 'Web' });
    expect(r.ok && r.valor.seq).toBe(6);
  });

  it('nenhuma operação lança exceção mesmo com gerarId falhando', () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    const repositorio = criarRepositorio({
      armazenamento,
      gerarId: () => {
        throw new Error('sem crypto');
      },
    });
    expect(repositorio.criarTime({ nome: 'A' })).toEqual({ ok: false, erro: { tipo: 'gravacao' } });
  });
});
