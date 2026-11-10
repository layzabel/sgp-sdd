import type { DadosAdministrador, Entrada, Validado } from '../tipos.ts';
import { validarCom, type CampoDescritor } from '../validacao.ts';
import { campoEmail, campoNome, campoTelefone, campoTexto100 } from './campos.ts';

/** Todos os campos são obrigatórios (FR-010). */
export const DESCRITORES_ADMINISTRADOR: readonly CampoDescritor[] = [
  campoNome(),
  campoEmail(),
  campoTelefone(true),
  campoTexto100('cargo', 'Cargo', 'o cargo', true),
  campoTexto100('setor', 'Setor', 'o setor', true),
];

export function validarAdministrador(
  entrada: Entrada<DadosAdministrador>,
): Validado<DadosAdministrador> {
  return validarCom<DadosAdministrador>(DESCRITORES_ADMINISTRADOR, entrada);
}
