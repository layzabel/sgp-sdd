import { describe, expect, it } from 'vitest';
import { DESCRITORES_USUARIO, validarUsuario } from '../../../../src/domain/regras/usuario.ts';

describe('regras de usuário', () => {
  it('nome e e-mail válido com opcionais vazios é aceito', () => {
    expect(validarUsuario({ nome: 'Maria', email: 'maria@cliente.com' })).toEqual({
      valores: { nome: 'Maria', email: 'maria@cliente.com', telefone: '', organizacao: '' },
      erros: {},
    });
  });

  it('nome e e-mail obrigatórios; e-mail com formato válido', () => {
    expect(validarUsuario({}).erros).toEqual({
      nome: 'Informe o nome.',
      email: 'Informe o e-mail.',
    });
    expect(validarUsuario({ nome: 'Maria', email: 'maria cliente.com' }).erros).toEqual({
      email: 'Informe um e-mail válido, como nome@empresa.com.',
    });
  });

  it('limites: telefone 30, organização 100, e-mail 254', () => {
    expect(
      validarUsuario({
        nome: 'Maria',
        email: `${'m'.repeat(250)}@c.com`,
        telefone: '1'.repeat(31),
        organizacao: 'o'.repeat(101),
      }).erros,
    ).toEqual({
      email: 'E-mail deve ter no máximo 254 caracteres.',
      telefone: 'Telefone deve ter no máximo 30 caracteres.',
      organizacao: 'Organização deve ter no máximo 100 caracteres.',
    });
  });

  it('rótulos', () => {
    expect(DESCRITORES_USUARIO.map((d) => d.rotulo)).toEqual([
      'Nome',
      'E-mail',
      'Telefone',
      'Organização',
    ]);
  });
});
