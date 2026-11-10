import { ROTULOS_SITUACAO, TERMINO_ANTES_INICIO, opcoesDe } from '../mensagens.ts';
import type { DadosProjeto, Entrada, Validado } from '../tipos.ts';
import { validarCom, type CampoDescritor } from '../validacao.ts';
import { campoDescricao, campoNome } from './campos.ts';

export const DESCRITORES_PROJETO: readonly CampoDescritor[] = [
  campoNome(),
  campoDescricao(),
  {
    campo: 'inicio',
    rotulo: 'Data de início',
    rotuloComArtigo: 'a data de início',
    obrigatorio: true,
    tipo: 'data',
  },
  {
    campo: 'terminoPrevisto',
    rotulo: 'Data de término prevista',
    rotuloComArtigo: 'a data de término prevista',
    obrigatorio: false,
    tipo: 'data',
  },
  {
    campo: 'situacao',
    rotulo: 'Situação',
    rotuloComArtigo: 'a situação',
    obrigatorio: true,
    tipo: 'enum',
    opcoes: opcoesDe(ROTULOS_SITUACAO),
  },
  {
    campo: 'timeId',
    rotulo: 'Time responsável',
    rotuloComArtigo: 'o time responsável',
    obrigatorio: true,
    tipo: 'referencia',
  },
];

/** Valida o projeto; acrescenta término ≥ início (FR-022) comparando texto AAAA-MM-DD. */
export function validarProjeto(entrada: Entrada<DadosProjeto>): Validado<DadosProjeto> {
  const { valores, erros } = validarCom<DadosProjeto>(DESCRITORES_PROJETO, entrada);
  const datasValidas = erros.inicio === undefined && erros.terminoPrevisto === undefined;
  if (datasValidas && valores.terminoPrevisto !== '' && valores.terminoPrevisto < valores.inicio) {
    erros.terminoPrevisto = TERMINO_ANTES_INICIO;
  }
  return { valores, erros };
}
