import { describe, expect, it } from 'vitest';
import { DESCRITORES_PROJETO, validarProjeto } from '../../../../src/domain/regras/projeto.ts';

const VALIDO = {
  nome: 'Portal do Cliente',
  descricao: '',
  inicio: '2026-03-10',
  terminoPrevisto: '',
  situacao: 'planejado',
  timeId: 't1',
};

describe('regras de projeto', () => {
  it('entrada válida', () => {
    expect(validarProjeto(VALIDO)).toEqual({ valores: VALIDO, erros: {} });
  });

  it('todos os obrigatórios vazios são indicados ao mesmo tempo', () => {
    expect(validarProjeto({}).erros).toEqual({
      nome: 'Informe o nome.',
      inicio: 'Informe a data de início.',
      situacao: 'Selecione a situação.',
      timeId: 'Selecione o time responsável.',
    });
  });

  it('nome até 100 e descrição até 1000 caracteres', () => {
    expect(
      validarProjeto({ ...VALIDO, nome: 'n'.repeat(100), descricao: 'd'.repeat(1000) }).erros,
    ).toEqual({});
    expect(
      validarProjeto({ ...VALIDO, nome: 'n'.repeat(101), descricao: 'd'.repeat(1001) }).erros,
    ).toEqual({
      nome: 'Nome deve ter no máximo 100 caracteres.',
      descricao: 'Descrição deve ter no máximo 1000 caracteres.',
    });
  });

  it('datas inválidas', () => {
    expect(validarProjeto({ ...VALIDO, inicio: '2026-02-30', terminoPrevisto: 'x' }).erros).toEqual(
      {
        inicio: 'Informe uma data válida.',
        terminoPrevisto: 'Informe uma data válida.',
      },
    );
  });

  it('término anterior ao início é rejeitado no campo terminoPrevisto (FR-022)', () => {
    expect(validarProjeto({ ...VALIDO, terminoPrevisto: '2026-03-09' }).erros).toEqual({
      terminoPrevisto: 'A data de término prevista não pode ser anterior à data de início.',
    });
  });

  it('término igual ao início ou vazio é aceito', () => {
    expect(validarProjeto({ ...VALIDO, terminoPrevisto: '2026-03-10' }).erros).toEqual({});
    expect(validarProjeto({ ...VALIDO, terminoPrevisto: '' }).erros).toEqual({});
    expect(validarProjeto({ ...VALIDO, terminoPrevisto: '2027-01-01' }).erros).toEqual({});
  });

  it('situação fora da lista', () => {
    expect(validarProjeto({ ...VALIDO, situacao: 'pausado' }).erros).toEqual({
      situacao: 'Selecione a situação.',
    });
  });

  it('descritores com rótulos e opções de situação', () => {
    expect(DESCRITORES_PROJETO.map((d) => d.rotulo)).toEqual([
      'Nome',
      'Descrição',
      'Data de início',
      'Data de término prevista',
      'Situação',
      'Time responsável',
    ]);
    const situacao = DESCRITORES_PROJETO.find((d) => d.campo === 'situacao');
    expect(situacao?.opcoes?.map((o) => o.rotulo)).toEqual([
      'Planejado',
      'Em andamento',
      'Concluído',
      'Cancelado',
    ]);
  });
});
