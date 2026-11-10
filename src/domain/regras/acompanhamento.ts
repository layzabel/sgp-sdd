// Relatórios, marcos e itens de cronograma (FR-026…FR-029).

import type {
  DadosItemCronograma,
  DadosMarco,
  DadosRelatorio,
  Entrada,
  Validado,
} from '../tipos.ts';
import { validarCom, type CampoDescritor } from '../validacao.ts';

export const DESCRITORES_RELATORIO: readonly CampoDescritor[] = [
  {
    campo: 'texto',
    rotulo: 'Texto do relatório',
    rotuloComArtigo: 'o texto do relatório',
    obrigatorio: true,
    max: 5000,
    tipo: 'texto',
    controle: 'textarea',
  },
];

export const DESCRITORES_MARCO: readonly CampoDescritor[] = [
  {
    campo: 'descricao',
    rotulo: 'Descrição do marco',
    rotuloComArtigo: 'a descrição do marco',
    obrigatorio: true,
    max: 100,
    tipo: 'texto',
  },
];

export const DESCRITORES_ITEM_CRONOGRAMA: readonly CampoDescritor[] = [
  {
    campo: 'atividade',
    rotulo: 'Atividade',
    rotuloComArtigo: 'a atividade',
    obrigatorio: true,
    max: 100,
    tipo: 'texto',
  },
  {
    campo: 'dataPrevista',
    rotulo: 'Data prevista',
    rotuloComArtigo: 'a data prevista',
    obrigatorio: true,
    tipo: 'data',
  },
];

export function validarRelatorio(entrada: Entrada<DadosRelatorio>): Validado<DadosRelatorio> {
  return validarCom<DadosRelatorio>(DESCRITORES_RELATORIO, entrada);
}

export function validarMarco(entrada: Entrada<DadosMarco>): Validado<DadosMarco> {
  return validarCom<DadosMarco>(DESCRITORES_MARCO, entrada);
}

export function validarItemCronograma(
  entrada: Entrada<DadosItemCronograma>,
): Validado<DadosItemCronograma> {
  return validarCom<DadosItemCronograma>(DESCRITORES_ITEM_CRONOGRAMA, entrada);
}
