// Consultas puras sobre o documento: busca, filtros e ordenação (FR-008; contracts/repositorio.md).

import { compararPorNome, contem } from './texto.ts';
import type {
  Administrador,
  Desenvolvedor,
  Documento,
  ItemCronograma,
  Marco,
  Projeto,
  QuantidadesAcompanhamento,
  Relatorio,
  Time,
  Usuario,
} from './tipos.ts';

type ComNome = { nome: string; seq: number };

function emOrdemAlfabetica<T extends ComNome>(itens: readonly T[]): T[] {
  return [...itens].sort(compararPorNome);
}

/** Filtro de `<select>`: vazio/ausente ("Todos") aceita qualquer valor. */
function filtroAceita(filtro: string | undefined, valor: string): boolean {
  return filtro === undefined || filtro === '' || filtro === valor;
}

/** Lista filtrada e em ordem alfabética. */
function listar<T extends ComNome>(itens: readonly T[], aceita: (item: T) => boolean): T[] {
  return emOrdemAlfabetica(itens.filter(aceita));
}

// --- Times -------------------------------------------------------------------------------------

export function listarTimes(doc: Documento, criterios: { busca: string }): Time[] {
  return listar(doc.times, (t) => contem(t.nome, criterios.busca));
}

export type DetalheTime = {
  time: Time;
  desenvolvedores: Desenvolvedor[];
  projetos: Projeto[];
};

export function detalharTime(doc: Documento, id: string): DetalheTime | null {
  const time = doc.times.find((t) => t.id === id);
  if (time === undefined) return null;
  return {
    time,
    desenvolvedores: listar(doc.desenvolvedores, (d) => d.timeId === id),
    projetos: listar(doc.projetos, (p) => p.timeId === id),
  };
}

// --- Projetos ----------------------------------------------------------------------------------

export type CriteriosProjetos = { busca: string; situacao?: string; timeId?: string };

export function listarProjetos(doc: Documento, criterios: CriteriosProjetos): Projeto[] {
  return listar(
    doc.projetos,
    (p) =>
      contem(p.nome, criterios.busca) &&
      filtroAceita(criterios.situacao, p.situacao) &&
      filtroAceita(criterios.timeId, p.timeId),
  );
}

export type DetalheProjeto = {
  projeto: Projeto;
  time: Time | undefined;
  relatorios: Relatorio[];
  marcos: Marco[];
  itensCronograma: ItemCronograma[];
};

function doProjeto<T extends { projetoId: string }>(itens: readonly T[], projetoId: string): T[] {
  return itens.filter((i) => i.projetoId === projetoId);
}

function compararTexto(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Mais recente primeiro; mesmo instante → criado por último primeiro (FR-027). */
function compararRelatorios(a: Relatorio, b: Relatorio): number {
  return compararTexto(b.criadoEm, a.criadoEm) || b.seq - a.seq;
}

/** Data prevista crescente; empate pela ordem de criação (FR-029). */
function compararItens(a: ItemCronograma, b: ItemCronograma): number {
  return compararTexto(a.dataPrevista, b.dataPrevista) || a.seq - b.seq;
}

export function detalharProjeto(doc: Documento, id: string): DetalheProjeto | null {
  const projeto = doc.projetos.find((p) => p.id === id);
  if (projeto === undefined) return null;
  return {
    projeto,
    time: doc.times.find((t) => t.id === projeto.timeId),
    relatorios: doProjeto(doc.relatorios, id).sort(compararRelatorios),
    marcos: doProjeto(doc.marcos, id).sort((a, b) => a.seq - b.seq),
    itensCronograma: doProjeto(doc.itensCronograma, id).sort(compararItens),
  };
}

export function contarAcompanhamento(doc: Documento, projetoId: string): QuantidadesAcompanhamento {
  return {
    relatorios: doProjeto(doc.relatorios, projetoId).length,
    marcos: doProjeto(doc.marcos, projetoId).length,
    itensCronograma: doProjeto(doc.itensCronograma, projetoId).length,
  };
}

// --- Desenvolvedores ---------------------------------------------------------------------------

export type CriteriosDesenvolvedores = { busca: string; timeId?: string; nivel?: string };

export function listarDesenvolvedores(
  doc: Documento,
  criterios: CriteriosDesenvolvedores,
): Desenvolvedor[] {
  return listar(
    doc.desenvolvedores,
    (d) =>
      contem(d.nome, criterios.busca) &&
      filtroAceita(criterios.timeId, d.timeId) &&
      filtroAceita(criterios.nivel, d.nivel),
  );
}

export function detalharDesenvolvedor(
  doc: Documento,
  id: string,
): { desenvolvedor: Desenvolvedor; time: Time | undefined } | null {
  const desenvolvedor = doc.desenvolvedores.find((d) => d.id === id);
  if (desenvolvedor === undefined) return null;
  return { desenvolvedor, time: doc.times.find((t) => t.id === desenvolvedor.timeId) };
}

// --- Administradores e usuários ----------------------------------------------------------------

/** Busca em nome ou e-mail (FR-011). */
export function listarAdministradores(
  doc: Documento,
  criterios: { busca: string },
): Administrador[] {
  return listar(
    doc.administradores,
    (a) => contem(a.nome, criterios.busca) || contem(a.email, criterios.busca),
  );
}

export function detalharAdministrador(doc: Documento, id: string): Administrador | null {
  return doc.administradores.find((a) => a.id === id) ?? null;
}

/** Busca em nome ou organização (FR-013). */
export function listarUsuarios(doc: Documento, criterios: { busca: string }): Usuario[] {
  return listar(
    doc.usuarios,
    (u) => contem(u.nome, criterios.busca) || contem(u.organizacao, criterios.busca),
  );
}

export function detalharUsuario(doc: Documento, id: string): Usuario | null {
  return doc.usuarios.find((u) => u.id === id) ?? null;
}
