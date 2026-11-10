// Textos fixos da interface (contracts/mensagens.md e data-model.md, "Validação: mensagens").

import type { Nivel, Situacao } from './tipos.ts';

// --- Validação de campo ------------------------------------------------------------------------

export function obrigatorio(rotuloComArtigo: string): string {
  return `Informe ${rotuloComArtigo}.`;
}

export function tamanho(rotulo: string, maximo: number): string {
  return `${rotulo} deve ter no máximo ${maximo} caracteres.`;
}

export function selecione(rotuloComArtigo: string): string {
  return `Selecione ${rotuloComArtigo}.`;
}

export const EMAIL_INVALIDO = 'Informe um e-mail válido, como nome@empresa.com.';

export function emailRepetido(cadastro: 'administrador' | 'usuário' | 'desenvolvedor'): string {
  return `Este e-mail já está em uso por outro ${cadastro}.`;
}

export const NOME_TIME_REPETIDO = 'Já existe um time com esse nome. Escolha outro nome.';
export const TIME_INEXISTENTE = 'Selecione um time cadastrado.';
export const DATA_INVALIDA = 'Informe uma data válida.';
export const TERMINO_ANTES_INICIO =
  'A data de término prevista não pode ser anterior à data de início.';

// --- Sucesso -----------------------------------------------------------------------------------

export type NomeEntidade = 'Administrador' | 'Usuário' | 'Desenvolvedor' | 'Time' | 'Projeto';

export function sucesso(
  operacao: 'cadastrado' | 'atualizado' | 'excluído',
  entidade: NomeEntidade,
): string {
  return `${entidade} ${operacao} com sucesso.`;
}

export const PROJETO_EXCLUIDO =
  'Projeto excluído com sucesso, junto com seus relatórios, marcos e cronograma.';
export const RELATORIO_ADICIONADO = 'Relatório adicionado com sucesso.';
export const MARCO_ADICIONADO = 'Marco adicionado com sucesso.';
export const ITEM_ADICIONADO = 'Item de cronograma adicionado com sucesso.';

// --- Erro --------------------------------------------------------------------------------------

export const RESUMO_VALIDACAO = 'Não foi possível salvar. Corrija os campos destacados.';
export const FALHA_GRAVACAO =
  'Não foi possível salvar os dados no navegador (armazenamento cheio ou indisponível). Nada foi alterado. Libere espaço ou verifique as permissões do navegador e tente novamente.';
export const FALHA_GRAVACAO_EXCLUSAO =
  'Não foi possível excluir: o armazenamento do navegador está cheio ou indisponível. Nada foi alterado.';
export const REGISTRO_NAO_ENCONTRADO = 'Registro não encontrado. Ele pode ter sido excluído.';
export const DADOS_ILEGIVEIS =
  'Os dados salvos neste navegador não puderam ser lidos. Nenhuma alteração será gravada para não perder informações.';
export const ARMAZENAMENTO_INDISPONIVEL =
  'O armazenamento do navegador está indisponível. Verifique se o navegador permite salvar dados deste site.';

export function timeComVinculos(nome: string, desenvolvedores: number, projetos: number): string {
  return `Não é possível excluir o time "${nome}": ele possui ${desenvolvedores} desenvolvedor(es) e ${projetos} projeto(s) vinculados. Transfira ou exclua esses registros antes.`;
}

export function semTimes(cadastro: 'desenvolvedores' | 'projetos'): string {
  return `É preciso cadastrar um time antes de cadastrar ${cadastro}.`;
}

// --- Confirmação de exclusão -------------------------------------------------------------------

export function confirmarExclusao(entidade: string, nome: string): string {
  return `Excluir ${entidade} "${nome}"? Esta ação não pode ser desfeita.`;
}

export function confirmarExclusaoProjeto(
  relatorios: number,
  marcos: number,
  itens: number,
): string {
  return `Também serão excluídos ${relatorios} relatório(s), ${marcos} marco(s) e ${itens} item(ns) de cronograma.`;
}

// --- Rótulos e formatos ------------------------------------------------------------------------

export const NAO_INFORMADO = 'Não informado';

export const ROTULOS_NIVEL: Readonly<Record<Nivel, string>> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
};

export const ROTULOS_SITUACAO: Readonly<Record<Situacao, string>> = {
  planejado: 'Planejado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

/** Converte um mapa valor → rótulo na lista de opções de um select. */
export function opcoesDe<V extends string>(
  rotulos: Readonly<Record<V, string>>,
): { valor: V; rotulo: string }[] {
  return (Object.keys(rotulos) as V[]).map((valor) => ({ valor, rotulo: rotulos[valor] }));
}
