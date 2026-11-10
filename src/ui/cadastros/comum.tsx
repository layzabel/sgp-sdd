'use client';

import Link from 'next/link';
import { listarTimes } from '../../domain/consultas.ts';
import type { Documento } from '../../domain/tipos.ts';
import type { CampoDescritor, Opcao } from '../../domain/validacao.ts';
import { hrefDetalhes } from '../cadastro/config.ts';

/** Times cadastrados, em ordem alfabética, como opções de `<select>`. */
export function opcoesDeTimes(doc: Documento): Opcao[] {
  return listarTimes(doc, { busca: '' }).map((t) => ({ valor: t.id, rotulo: t.nome }));
}

/** Preenche as opções do campo `timeId` com os times cadastrados. */
export function comOpcoesDeTime(
  descritores: readonly CampoDescritor[],
  doc: Documento,
): CampoDescritor[] {
  return descritores.map((d) => (d.campo === 'timeId' ? { ...d, opcoes: opcoesDeTimes(doc) } : d));
}

export function nomeDoTime(doc: Documento, timeId: string): string {
  return doc.times.find((t) => t.id === timeId)?.nome ?? '';
}

/** Nome do time como link para os detalhes (vazio = "Não informado"). */
export function LinkDoTime({ doc, timeId }: { doc: Documento; timeId: string }) {
  const nome = nomeDoTime(doc, timeId);
  if (nome === '') return null;
  return <Link href={hrefDetalhes('/times', timeId)}>{nome}</Link>;
}
