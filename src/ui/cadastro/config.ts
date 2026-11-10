// Configuração de um cadastro, usada pelas telas genéricas de novo/editar/detalhes.

import type { Repositorio } from '../../data/repositorio.ts';
import type { NomeEntidade } from '../../domain/mensagens.ts';
import type { Documento, Identificado, Resultado } from '../../domain/tipos.ts';
import type { CampoFormulario, Valores } from '../Formulario.tsx';

export type RegistroComNome = Identificado & { nome: string };

export type ConfigCadastro<R extends RegistroComNome> = {
  /** Caminho base sem barra final, ex.: '/times'. */
  base: string;
  /** Nome da entidade em minúsculas, ex.: 'time'. */
  entidade: string;
  Entidade: NomeEntidade;
  /** Título da lista, ex.: 'Times'. */
  plural: string;
  campos: (doc: Documento) => readonly CampoFormulario[];
  /** Cadastro que exige ao menos um time (desenvolvedores, projetos). */
  exigeTimes?: 'desenvolvedores' | 'projetos';
  obter: (doc: Documento, id: string) => R | undefined;
  criar: (repositorio: Repositorio, valores: Valores) => Resultado<R>;
  atualizar: (repositorio: Repositorio, id: string, valores: Valores) => Resultado<R>;
  excluir: (repositorio: Repositorio, id: string) => Resultado<unknown>;
};

export function hrefLista(base: string): string {
  return `${base}/`;
}

export function hrefNovo(base: string): string {
  return `${base}/novo/`;
}

export function hrefDetalhes(base: string, id: string): string {
  return `${base}/detalhes/?id=${encodeURIComponent(id)}`;
}

export function hrefEditar(base: string, id: string): string {
  return `${base}/editar/?id=${encodeURIComponent(id)}`;
}

/** Valores atuais do registro para preencher o formulário de edição. */
export function valoresDoRegistro(registro: object, campos: readonly CampoFormulario[]): Valores {
  const fonte = registro as Record<string, unknown>;
  return Object.fromEntries(campos.map((c) => [c.campo, String(fonte[c.campo] ?? '')]));
}
