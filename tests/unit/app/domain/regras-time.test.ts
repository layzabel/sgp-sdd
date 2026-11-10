import { describe, expect, it } from 'vitest';
import { DESCRITORES_TIME, validarTime } from '../../../../src/domain/regras/time.ts';

describe('regras de time', () => {
  it('nome obrigatório; só espaços = vazio', () => {
    expect(validarTime({ nome: '' }).erros).toEqual({ nome: 'Informe o nome.' });
    expect(validarTime({ nome: '    ' }).erros).toEqual({ nome: 'Informe o nome.' });
  });

  it('nome com 100 caracteres aceito, 101 rejeitado', () => {
    expect(validarTime({ nome: 'a'.repeat(100) }).erros).toEqual({});
    expect(validarTime({ nome: 'a'.repeat(101) }).erros).toEqual({
      nome: 'Nome deve ter no máximo 100 caracteres.',
    });
  });

  it('descrição opcional até 1000; área opcional até 100', () => {
    expect(
      validarTime({ nome: 'X', descricao: 'd'.repeat(1000), area: 'a'.repeat(100) }).erros,
    ).toEqual({});
    expect(
      validarTime({ nome: 'X', descricao: 'd'.repeat(1001), area: 'a'.repeat(101) }).erros,
    ).toEqual({
      descricao: 'Descrição deve ter no máximo 1000 caracteres.',
      area: 'Área de atuação deve ter no máximo 100 caracteres.',
    });
  });

  it('valores aparados e opcionais vazios como ""', () => {
    expect(validarTime({ nome: '  Plataforma ', area: '  ' }).valores).toEqual({
      nome: 'Plataforma',
      descricao: '',
      area: '',
    });
  });

  it('descritores: rótulos e controle da descrição', () => {
    expect(DESCRITORES_TIME.map((d) => d.rotulo)).toEqual(['Nome', 'Descrição', 'Área de atuação']);
    expect(DESCRITORES_TIME[1]?.controle).toBe('textarea');
  });
});
