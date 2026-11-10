import { describe, expect, it } from 'vitest';
import { dev, doc, repo, time } from '../apoio.ts';

const ENTRADA = {
  nome: ' Ana ',
  email: ' Ana@Empresa.com ',
  telefone: '',
  cargo: '',
  nivel: 'pleno',
  tecnologia: '',
  timeId: 't1',
};

const BASE = doc({
  times: [time('t1', 'Plataforma', 1), time('t2', 'Mobile', 2)],
  desenvolvedores: [dev('d1', 'Ana Antiga', 3, 't1', { email: 'ana@empresa.com' })],
  administradores: [
    {
      id: 'a1',
      seq: 4,
      nome: 'Adm',
      email: 'joao@empresa.com',
      telefone: '1',
      cargo: 'c',
      setor: 's',
    },
  ],
});

const EMAIL_REPETIDO = {
  ok: false,
  erro: {
    tipo: 'validacao',
    campos: { email: 'Este e-mail já está em uso por outro desenvolvedor.' },
  },
};

describe('repositório — desenvolvedores', () => {
  it('e-mail repetido sem diferenciar caixa → erro no cadastro e na edição de outro registro', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.criarDesenvolvedor(ENTRADA)).toEqual(EMAIL_REPETIDO);
    const outro = repositorio.criarDesenvolvedor({ ...ENTRADA, email: 'bia@empresa.com' });
    expect(outro.ok).toBe(true);
    const id = outro.ok ? outro.valor.id : '';
    expect(repositorio.atualizarDesenvolvedor(id, ENTRADA)).toEqual(EMAIL_REPETIDO);
  });

  it('manter o próprio e-mail na edição é aceito', () => {
    const { repositorio } = repo(BASE);
    const r = repositorio.atualizarDesenvolvedor('d1', { ...ENTRADA, email: 'ANA@empresa.com' });
    expect(r.ok && r.valor).toMatchObject({ id: 'd1', nome: 'Ana', email: 'ANA@empresa.com' });
  });

  it('o mesmo e-mail de um administrador não conflita', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.criarDesenvolvedor({ ...ENTRADA, email: 'joao@empresa.com' }).ok).toBe(true);
  });

  it('time inexistente → "Selecione um time cadastrado."', () => {
    const { repositorio } = repo(BASE);
    expect(
      repositorio.criarDesenvolvedor({ ...ENTRADA, email: 'x@y.com', timeId: 'fantasma' }),
    ).toEqual({
      ok: false,
      erro: { tipo: 'validacao', campos: { timeId: 'Selecione um time cadastrado.' } },
    });
  });

  it('troca de time', () => {
    const { repositorio } = repo(BASE);
    const r = repositorio.atualizarDesenvolvedor('d1', {
      ...ENTRADA,
      email: 'ana@empresa.com',
      timeId: 't2',
    });
    expect(r.ok && r.valor.timeId).toBe('t2');
  });

  it('exclusão nunca bloqueada; inexistente → nao_encontrado', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.excluirDesenvolvedor('d1')).toEqual({ ok: true, valor: undefined });
    expect(repositorio.getSnapshot().desenvolvedores).toEqual([]);
    expect(repositorio.excluirDesenvolvedor('d1')).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
    expect(repositorio.atualizarDesenvolvedor('x', ENTRADA)).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
  });

  it('falha de gravação → inalterado', () => {
    const { repositorio, armazenamento } = repo(BASE);
    armazenamento.falharProximaGravacao();
    expect(repositorio.excluirDesenvolvedor('d1')).toEqual({
      ok: false,
      erro: { tipo: 'gravacao' },
    });
    armazenamento.falharProximaGravacao();
    expect(repositorio.criarDesenvolvedor({ ...ENTRADA, email: 'x@y.com' })).toEqual({
      ok: false,
      erro: { tipo: 'gravacao' },
    });
    expect(repositorio.getSnapshot()).toEqual(BASE);
  });
});
