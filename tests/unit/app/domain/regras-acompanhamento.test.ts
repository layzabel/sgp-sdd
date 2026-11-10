import { describe, expect, it } from 'vitest';
import {
  validarItemCronograma,
  validarMarco,
  validarRelatorio,
} from '../../../../src/domain/regras/acompanhamento.ts';

describe('regras de acompanhamento', () => {
  it('relatório: texto obrigatório até 5000 caracteres', () => {
    expect(validarRelatorio({ texto: '  ' }).erros).toEqual({
      texto: 'Informe o texto do relatório.',
    });
    expect(validarRelatorio({ texto: 't'.repeat(5000) }).erros).toEqual({});
    expect(validarRelatorio({ texto: 't'.repeat(5001) }).erros).toEqual({
      texto: 'Texto do relatório deve ter no máximo 5000 caracteres.',
    });
    expect(validarRelatorio({ texto: ' linha 1\nlinha 2 ' }).valores).toEqual({
      texto: 'linha 1\nlinha 2',
    });
  });

  it('marco: descrição obrigatória até 100 caracteres', () => {
    expect(validarMarco({ descricao: '' }).erros).toEqual({
      descricao: 'Informe a descrição do marco.',
    });
    expect(validarMarco({ descricao: 'd'.repeat(100) }).erros).toEqual({});
    expect(validarMarco({ descricao: 'd'.repeat(101) }).erros).toEqual({
      descricao: 'Descrição do marco deve ter no máximo 100 caracteres.',
    });
  });

  it('item de cronograma: atividade até 100 e data prevista válida, ambas obrigatórias', () => {
    expect(validarItemCronograma({}).erros).toEqual({
      atividade: 'Informe a atividade.',
      dataPrevista: 'Informe a data prevista.',
    });
    expect(
      validarItemCronograma({ atividade: 'a'.repeat(101), dataPrevista: '2026-02-30' }).erros,
    ).toEqual({
      atividade: 'Atividade deve ter no máximo 100 caracteres.',
      dataPrevista: 'Informe uma data válida.',
    });
    expect(
      validarItemCronograma({ atividade: 'Testes', dataPrevista: '2026-04-05' }).erros,
    ).toEqual({});
  });
});
