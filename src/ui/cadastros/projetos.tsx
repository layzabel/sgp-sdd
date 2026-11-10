'use client';

import { contarAcompanhamento } from '../../domain/consultas.ts';
import { formatarData } from '../../domain/datas.ts';
import { ROTULOS_SITUACAO, confirmarExclusaoProjeto } from '../../domain/mensagens.ts';
import { DESCRITORES_PROJETO } from '../../domain/regras/projeto.ts';
import type { Documento, Projeto } from '../../domain/tipos.ts';
import type { CampoDetalhe } from '../Detalhes.tsx';
import type { ConfigCadastro } from '../cadastro/config.ts';
import { LinkDoTime, comOpcoesDeTime } from './comum.tsx';

export const PROJETOS: ConfigCadastro<Projeto> = {
  base: '/projetos',
  entidade: 'projeto',
  Entidade: 'Projeto',
  plural: 'Projetos',
  campos: (doc) => comOpcoesDeTime(DESCRITORES_PROJETO, doc),
  exigeTimes: 'projetos',
  obter: (doc, id) => doc.projetos.find((p) => p.id === id),
  criar: (repositorio, valores) => repositorio.criarProjeto(valores),
  atualizar: (repositorio, id, valores) => repositorio.atualizarProjeto(id, valores),
  excluir: (repositorio, id) => repositorio.excluirProjeto(id),
};

export function dataOuVazio(data: string): string {
  return data === '' ? '' : formatarData(data);
}

export function camposDetalheProjeto(doc: Documento, projeto: Projeto): CampoDetalhe[] {
  return [
    { rotulo: 'Nome', valor: projeto.nome },
    { rotulo: 'Descrição', valor: projeto.descricao },
    { rotulo: 'Data de início', valor: formatarData(projeto.inicio) },
    { rotulo: 'Data de término prevista', valor: dataOuVazio(projeto.terminoPrevisto) },
    { rotulo: 'Situação', valor: ROTULOS_SITUACAO[projeto.situacao] },
    { rotulo: 'Time responsável', valor: <LinkDoTime doc={doc} timeId={projeto.timeId} /> },
  ];
}

/** Quantidades do acompanhamento citadas na confirmação de exclusão (FR-025). */
export function textoExclusaoProjeto(doc: Documento, projeto: Projeto): string {
  const q = contarAcompanhamento(doc, projeto.id);
  return confirmarExclusaoProjeto(q.relatorios, q.marcos, q.itensCronograma);
}
