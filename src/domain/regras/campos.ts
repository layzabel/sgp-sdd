// Descritores de campo reutilizados pelos cadastros (evita repetir as mesmas regras).

import type { CampoDescritor } from '../validacao.ts';

export function campoNome(): CampoDescritor {
  return {
    campo: 'nome',
    rotulo: 'Nome',
    rotuloComArtigo: 'o nome',
    obrigatorio: true,
    max: 100,
    tipo: 'texto',
  };
}

export function campoEmail(): CampoDescritor {
  return {
    campo: 'email',
    rotulo: 'E-mail',
    rotuloComArtigo: 'o e-mail',
    obrigatorio: true,
    max: 254,
    tipo: 'email',
  };
}

export function campoTelefone(obrigatorio: boolean): CampoDescritor {
  return {
    campo: 'telefone',
    rotulo: 'Telefone',
    rotuloComArtigo: 'o telefone',
    obrigatorio,
    max: 30,
    tipo: 'texto',
    controle: 'tel',
  };
}

export function campoTexto100(
  campo: string,
  rotulo: string,
  rotuloComArtigo: string,
  obrigatorio: boolean,
): CampoDescritor {
  return { campo, rotulo, rotuloComArtigo, obrigatorio, max: 100, tipo: 'texto' };
}

/** Descrição opcional de até 1.000 caracteres (times e projetos). */
export function campoDescricao(): CampoDescritor {
  return {
    campo: 'descricao',
    rotulo: 'Descrição',
    rotuloComArtigo: 'a descrição',
    obrigatorio: false,
    max: 1000,
    tipo: 'texto',
    controle: 'textarea',
  };
}
