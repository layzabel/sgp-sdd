import { describe, expect, it } from 'vitest';
import { doc, repo } from '../apoio.ts';

const JOAO = {
  id: 'a1',
  seq: 1,
  nome: 'João',
  email: 'joao@empresa.com',
  telefone: '1',
  cargo: 'Gerente',
  setor: 'TI',
};
const BASE = doc({ administradores: [JOAO] });
const ENTRADA = { nome: 'Outro', email: 'JOAO@empresa.com', telefone: '2', cargo: 'c', setor: 's' };
const REPETIDO = {
  ok: false,
  erro: {
    tipo: 'validacao',
    campos: { email: 'Este e-mail já está em uso por outro administrador.' },
  },
};

describe('repositório — administradores', () => {
  it('cria com valores aparados', () => {
    const { repositorio } = repo();
    const r = repositorio.criarAdministrador({ ...ENTRADA, nome: ' Ana ', email: ' ana@x.com ' });
    expect(r.ok && r.valor).toEqual({
      id: 'novo-1',
      seq: 1,
      nome: 'Ana',
      email: 'ana@x.com',
      telefone: '2',
      cargo: 'c',
      setor: 's',
    });
  });

  it('e-mail repetido sem diferenciar caixa no cadastro e na edição', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.criarAdministrador(ENTRADA)).toEqual(REPETIDO);
    const outro = repositorio.criarAdministrador({ ...ENTRADA, email: 'outro@empresa.com' });
    const id = outro.ok ? outro.valor.id : '';
    expect(repositorio.atualizarAdministrador(id, ENTRADA)).toEqual(REPETIDO);
  });

  it('próprio e-mail na edição é aceito', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.atualizarAdministrador('a1', { ...JOAO, setor: 'RH' }).ok).toBe(true);
  });

  it('exclusão nunca bloqueada; inexistente → nao_encontrado', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.excluirAdministrador('a1')).toEqual({ ok: true, valor: undefined });
    expect(repositorio.excluirAdministrador('a1')).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
    expect(repositorio.atualizarAdministrador('a1', ENTRADA)).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
  });

  it('falha de gravação → inalterado', () => {
    const { repositorio, armazenamento } = repo(BASE);
    armazenamento.falharProximaGravacao();
    expect(repositorio.atualizarAdministrador('a1', { ...JOAO, setor: 'RH' })).toEqual({
      ok: false,
      erro: { tipo: 'gravacao' },
    });
    expect(repositorio.getSnapshot()).toEqual(BASE);
  });
});
