import type { DadosTime, Entrada, Validado } from '../tipos.ts';
import { validarCom, type CampoDescritor } from '../validacao.ts';
import { campoDescricao, campoNome, campoTexto100 } from './campos.ts';

/** Nome obrigatório (único, verificado no repositório); descrição e área opcionais (FR-018). */
export const DESCRITORES_TIME: readonly CampoDescritor[] = [
  campoNome(),
  campoDescricao(),
  campoTexto100('area', 'Área de atuação', 'a área de atuação', false),
];

export function validarTime(entrada: Entrada<DadosTime>): Validado<DadosTime> {
  return validarCom<DadosTime>(DESCRITORES_TIME, entrada);
}
