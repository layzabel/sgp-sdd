import type { DadosUsuario, Entrada, Validado } from '../tipos.ts';
import { validarCom, type CampoDescritor } from '../validacao.ts';
import { campoEmail, campoNome, campoTelefone, campoTexto100 } from './campos.ts';

/** Nome e e-mail obrigatórios; telefone e organização opcionais (FR-012). */
export const DESCRITORES_USUARIO: readonly CampoDescritor[] = [
  campoNome(),
  campoEmail(),
  campoTelefone(false),
  campoTexto100('organizacao', 'Organização', 'a organização', false),
];

export function validarUsuario(entrada: Entrada<DadosUsuario>): Validado<DadosUsuario> {
  return validarCom<DadosUsuario>(DESCRITORES_USUARIO, entrada);
}
