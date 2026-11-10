import { ROTULOS_NIVEL, opcoesDe } from '../mensagens.ts';
import type { DadosDesenvolvedor, Entrada, Validado } from '../tipos.ts';
import { validarCom, type CampoDescritor } from '../validacao.ts';
import { campoEmail, campoNome, campoTelefone, campoTexto100 } from './campos.ts';

export const DESCRITORES_DESENVOLVEDOR: readonly CampoDescritor[] = [
  campoNome(),
  campoEmail(),
  campoTelefone(false),
  campoTexto100('cargo', 'Cargo', 'o cargo', false),
  {
    campo: 'nivel',
    rotulo: 'Nível',
    rotuloComArtigo: 'o nível',
    obrigatorio: true,
    tipo: 'enum',
    opcoes: opcoesDe(ROTULOS_NIVEL),
  },
  campoTexto100('tecnologia', 'Principal tecnologia', 'a principal tecnologia', false),
  {
    campo: 'timeId',
    rotulo: 'Time',
    rotuloComArtigo: 'o time',
    obrigatorio: true,
    tipo: 'referencia',
  },
];

export function validarDesenvolvedor(
  entrada: Entrada<DadosDesenvolvedor>,
): Validado<DadosDesenvolvedor> {
  return validarCom<DadosDesenvolvedor>(DESCRITORES_DESENVOLVEDOR, entrada);
}
