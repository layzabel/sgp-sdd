import { describe, expect, it } from 'vitest';
import { detalharUsuario, listarUsuarios } from '../../../../src/domain/consultas.ts';
import type { Usuario } from '../../../../src/domain/tipos.ts';
import { doc } from '../apoio.ts';

function usuario(id: string, nome: string, organizacao: string, seq: number): Usuario {
  return { id, seq, nome, email: `${id}@cliente.com`, telefone: '', organizacao };
}

const DOC = doc({
  usuarios: [
    usuario('u1', 'Maria', 'Cliente S.A.', 1),
    usuario('u2', 'Carlos', 'Mariana Tech', 2),
    usuario('u3', 'Beatriz', '', 3),
  ],
});

describe('consultas de usuários', () => {
  it('ordem alfabética', () => {
    expect(listarUsuarios(DOC, { busca: '' }).map((u) => u.nome)).toEqual([
      'Beatriz',
      'Carlos',
      'Maria',
    ]);
  });

  it('busca em nome ou organização (FR-013), não no e-mail', () => {
    expect(listarUsuarios(DOC, { busca: 'mari' }).map((u) => u.nome)).toEqual(['Carlos', 'Maria']);
    expect(listarUsuarios(DOC, { busca: 'cliente s' }).map((u) => u.nome)).toEqual(['Maria']);
    expect(listarUsuarios(DOC, { busca: 'u3@' })).toEqual([]);
  });

  it('detalharUsuario', () => {
    expect(detalharUsuario(DOC, 'u3')?.nome).toBe('Beatriz');
    expect(detalharUsuario(DOC, 'x')).toBeNull();
  });
});
