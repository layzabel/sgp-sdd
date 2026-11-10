import { describe, expect, it } from 'vitest';
import { validarCampos, type CampoDescritor } from '../../../../src/domain/validacao.ts';

const DESCRITORES: readonly CampoDescritor[] = [
  {
    campo: 'nome',
    rotulo: 'Nome',
    rotuloComArtigo: 'o nome',
    obrigatorio: true,
    max: 5,
    tipo: 'texto',
  },
  {
    campo: 'apelido',
    rotulo: 'Apelido',
    rotuloComArtigo: 'o apelido',
    obrigatorio: false,
    max: 3,
    tipo: 'texto',
  },
  {
    campo: 'email',
    rotulo: 'E-mail',
    rotuloComArtigo: 'o e-mail',
    obrigatorio: true,
    max: 254,
    tipo: 'email',
  },
  {
    campo: 'nivel',
    rotulo: 'Nível',
    rotuloComArtigo: 'o nível',
    obrigatorio: true,
    tipo: 'enum',
    opcoes: [
      { valor: 'junior', rotulo: 'Júnior' },
      { valor: 'pleno', rotulo: 'Pleno' },
    ],
  },
  {
    campo: 'inicio',
    rotulo: 'Data de início',
    rotuloComArtigo: 'a data de início',
    obrigatorio: true,
    tipo: 'data',
  },
  {
    campo: 'fim',
    rotulo: 'Data de fim',
    rotuloComArtigo: 'a data de fim',
    obrigatorio: false,
    tipo: 'data',
  },
  {
    campo: 'timeId',
    rotulo: 'Time',
    rotuloComArtigo: 'o time',
    obrigatorio: true,
    tipo: 'referencia',
  },
];

const VALIDO = {
  nome: ' Ana ',
  apelido: '',
  email: ' ana@empresa.com ',
  nivel: 'pleno',
  inicio: '2026-03-10',
  fim: '',
  timeId: 't1',
};

describe('validarCampos', () => {
  it('entrada válida: sem erros e valores aparados, opcional vazio = ""', () => {
    const { valores, erros } = validarCampos(DESCRITORES, VALIDO);
    expect(erros).toEqual({});
    expect(valores).toEqual({
      nome: 'Ana',
      apelido: '',
      email: 'ana@empresa.com',
      nivel: 'pleno',
      inicio: '2026-03-10',
      fim: '',
      timeId: 't1',
    });
  });

  it('obrigatórios vazios ou só espaços são indicados juntos', () => {
    const { erros } = validarCampos(DESCRITORES, { nome: '   ', apelido: undefined });
    expect(erros).toEqual({
      nome: 'Informe o nome.',
      email: 'Informe o e-mail.',
      nivel: 'Selecione o nível.',
      inicio: 'Informe a data de início.',
      timeId: 'Selecione o time.',
    });
  });

  it('tamanho contado após trim: exatamente N aceito, N+1 rejeitado', () => {
    expect(validarCampos(DESCRITORES, { ...VALIDO, nome: '  abcde  ' }).erros.nome).toBeUndefined();
    expect(validarCampos(DESCRITORES, { ...VALIDO, nome: 'abcdef' }).erros.nome).toBe(
      'Nome deve ter no máximo 5 caracteres.',
    );
    expect(validarCampos(DESCRITORES, { ...VALIDO, apelido: 'abcd' }).erros.apelido).toBe(
      'Apelido deve ter no máximo 3 caracteres.',
    );
  });

  it('e-mail inválido', () => {
    expect(validarCampos(DESCRITORES, { ...VALIDO, email: 'ana@empresa' }).erros.email).toBe(
      'Informe um e-mail válido, como nome@empresa.com.',
    );
  });

  it('enum fora da lista', () => {
    expect(validarCampos(DESCRITORES, { ...VALIDO, nivel: 'mestre' }).erros.nivel).toBe(
      'Selecione o nível.',
    );
  });

  it('data inválida, obrigatória ou opcional', () => {
    expect(validarCampos(DESCRITORES, { ...VALIDO, inicio: '2026-02-30' }).erros.inicio).toBe(
      'Informe uma data válida.',
    );
    expect(validarCampos(DESCRITORES, { ...VALIDO, fim: 'xx' }).erros.fim).toBe(
      'Informe uma data válida.',
    );
  });
});
