import { describe, expect, it } from 'vitest';
import { doc, repo } from '../apoio.ts';

const MARIA = {
  id: 'u1',
  seq: 1,
  nome: 'Maria',
  email: 'maria@cliente.com',
  telefone: '',
  organizacao: 'Cliente',
};
const BASE = doc({
  usuarios: [MARIA],
  administradores: [
    {
      id: 'a1',
      seq: 2,
      nome: 'Adm',
      email: 'adm@cliente.com',
      telefone: '1',
      cargo: 'c',
      setor: 's',
    },
  ],
});
const REPETIDO = {
  ok: false,
  erro: { tipo: 'validacao', campos: { email: 'Este e-mail já está em uso por outro usuário.' } },
};

describe('repositório — usuários', () => {
  it('e-mail repetido no cadastro e na edição de outro registro', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.criarUsuario({ nome: 'Outra', email: ' Maria@Cliente.com ' })).toEqual(
      REPETIDO,
    );
    const outra = repositorio.criarUsuario({ nome: 'Outra', email: 'outra@cliente.com' });
    const id = outra.ok ? outra.valor.id : '';
    expect(repositorio.atualizarUsuario(id, { nome: 'Outra', email: 'maria@cliente.com' })).toEqual(
      REPETIDO,
    );
  });

  it('próprio e-mail aceito; e-mail de um administrador não conflita', () => {
    const { repositorio } = repo(BASE);
    expect(
      repositorio.atualizarUsuario('u1', { nome: 'Maria S.', email: 'MARIA@cliente.com' }).ok,
    ).toBe(true);
    expect(repositorio.criarUsuario({ nome: 'Adm', email: 'adm@cliente.com' }).ok).toBe(true);
  });

  it('exclusão; inexistente → nao_encontrado', () => {
    const { repositorio } = repo(BASE);
    expect(repositorio.excluirUsuario('u1')).toEqual({ ok: true, valor: undefined });
    expect(repositorio.getSnapshot().usuarios).toEqual([]);
    expect(repositorio.excluirUsuario('u1')).toEqual({
      ok: false,
      erro: { tipo: 'nao_encontrado' },
    });
  });

  it('falha de gravação → inalterado', () => {
    const { repositorio, armazenamento } = repo(BASE);
    armazenamento.falharProximaGravacao();
    expect(repositorio.excluirUsuario('u1')).toEqual({ ok: false, erro: { tipo: 'gravacao' } });
    expect(repositorio.getSnapshot()).toEqual(BASE);
  });
});
