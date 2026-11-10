import { describe, expect, it } from 'vitest';
import { detalharAdministrador, listarAdministradores } from '../../../../src/domain/consultas.ts';
import type { Administrador } from '../../../../src/domain/tipos.ts';
import { doc } from '../apoio.ts';

function adm(id: string, nome: string, email: string, seq: number): Administrador {
  return { id, seq, nome, email, telefone: '1', cargo: 'c', setor: 's' };
}

const DOC = doc({
  administradores: [
    adm('a1', 'João Silva', 'joao@empresa.com', 1),
    adm('a2', 'Maria', 'maria.joaquina@empresa.com', 2),
    adm('a3', 'Érico', 'erico@outra.com', 3),
  ],
});

describe('consultas de administradores', () => {
  it('ordem alfabética', () => {
    expect(listarAdministradores(DOC, { busca: '' }).map((a) => a.nome)).toEqual([
      'Érico',
      'João Silva',
      'Maria',
    ]);
  });

  it('busca em nome ou e-mail (FR-011)', () => {
    expect(listarAdministradores(DOC, { busca: 'joa' }).map((a) => a.nome)).toEqual([
      'João Silva',
      'Maria',
    ]);
    expect(listarAdministradores(DOC, { busca: 'outra.com' }).map((a) => a.nome)).toEqual([
      'Érico',
    ]);
    expect(listarAdministradores(DOC, { busca: 'silva' }).map((a) => a.nome)).toEqual([
      'João Silva',
    ]);
  });

  it('detalharAdministrador', () => {
    expect(detalharAdministrador(DOC, 'a2')?.nome).toBe('Maria');
    expect(detalharAdministrador(DOC, 'x')).toBeNull();
  });
});
