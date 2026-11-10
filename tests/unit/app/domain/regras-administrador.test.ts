import { describe, expect, it } from 'vitest';
import {
  DESCRITORES_ADMINISTRADOR,
  validarAdministrador,
} from '../../../../src/domain/regras/administrador.ts';

const VALIDO = {
  nome: 'João',
  email: 'joao@empresa.com',
  telefone: '(11) 99999-0000 ramal 12',
  cargo: 'Gerente',
  setor: 'TI',
};

describe('regras de administrador', () => {
  it('entrada válida (telefone é texto livre)', () => {
    expect(validarAdministrador(VALIDO)).toEqual({ valores: VALIDO, erros: {} });
  });

  it('os cinco campos são obrigatórios e indicados juntos', () => {
    expect(validarAdministrador({}).erros).toEqual({
      nome: 'Informe o nome.',
      email: 'Informe o e-mail.',
      telefone: 'Informe o telefone.',
      cargo: 'Informe o cargo.',
      setor: 'Informe o setor.',
    });
  });

  it('limites e formato de e-mail', () => {
    expect(
      validarAdministrador({
        nome: 'n'.repeat(101),
        email: 'joao@',
        telefone: '1'.repeat(31),
        cargo: 'c'.repeat(101),
        setor: 's'.repeat(101),
      }).erros,
    ).toEqual({
      nome: 'Nome deve ter no máximo 100 caracteres.',
      email: 'Informe um e-mail válido, como nome@empresa.com.',
      telefone: 'Telefone deve ter no máximo 30 caracteres.',
      cargo: 'Cargo deve ter no máximo 100 caracteres.',
      setor: 'Setor deve ter no máximo 100 caracteres.',
    });
  });

  it('rótulos', () => {
    expect(DESCRITORES_ADMINISTRADOR.map((d) => d.rotulo)).toEqual([
      'Nome',
      'E-mail',
      'Telefone',
      'Cargo',
      'Setor',
    ]);
  });
});
