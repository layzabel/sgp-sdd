import { describe, expect, it } from 'vitest';
import {
  DESCRITORES_DESENVOLVEDOR,
  validarDesenvolvedor,
} from '../../../../src/domain/regras/desenvolvedor.ts';

const VALIDO = {
  nome: 'Ana',
  email: 'ana@empresa.com',
  telefone: '',
  cargo: '',
  nivel: 'pleno',
  tecnologia: '',
  timeId: 't1',
};

describe('regras de desenvolvedor', () => {
  it('entrada válida com opcionais vazios', () => {
    expect(validarDesenvolvedor(VALIDO)).toEqual({ valores: VALIDO, erros: {} });
  });

  it('obrigatórios vazios indicados juntos', () => {
    expect(validarDesenvolvedor({}).erros).toEqual({
      nome: 'Informe o nome.',
      email: 'Informe o e-mail.',
      nivel: 'Selecione o nível.',
      timeId: 'Selecione o time.',
    });
  });

  it('e-mail inválido', () => {
    expect(validarDesenvolvedor({ ...VALIDO, email: 'ana@empresa' }).erros).toEqual({
      email: 'Informe um e-mail válido, como nome@empresa.com.',
    });
  });

  it('limites: nome 100, e-mail 254, telefone 30, cargo 100, tecnologia 100', () => {
    const longoEmail = `${'a'.repeat(245)}@empresa.com`;
    expect(
      validarDesenvolvedor({
        ...VALIDO,
        nome: 'n'.repeat(101),
        email: longoEmail,
        telefone: '1'.repeat(31),
        cargo: 'c'.repeat(101),
        tecnologia: 't'.repeat(101),
      }).erros,
    ).toEqual({
      nome: 'Nome deve ter no máximo 100 caracteres.',
      email: 'E-mail deve ter no máximo 254 caracteres.',
      telefone: 'Telefone deve ter no máximo 30 caracteres.',
      cargo: 'Cargo deve ter no máximo 100 caracteres.',
      tecnologia: 'Principal tecnologia deve ter no máximo 100 caracteres.',
    });
  });

  it('nível fora da lista', () => {
    expect(validarDesenvolvedor({ ...VALIDO, nivel: 'estagiario' }).erros).toEqual({
      nivel: 'Selecione o nível.',
    });
  });

  it('rótulos e opções de nível', () => {
    expect(DESCRITORES_DESENVOLVEDOR.map((d) => d.rotulo)).toEqual([
      'Nome',
      'E-mail',
      'Telefone',
      'Cargo',
      'Nível',
      'Principal tecnologia',
      'Time',
    ]);
    const nivel = DESCRITORES_DESENVOLVEDOR.find((d) => d.campo === 'nivel');
    expect(nivel?.opcoes?.map((o) => o.rotulo)).toEqual(['Júnior', 'Pleno', 'Sênior']);
    expect(DESCRITORES_DESENVOLVEDOR.find((d) => d.campo === 'telefone')?.controle).toBe('tel');
  });
});
