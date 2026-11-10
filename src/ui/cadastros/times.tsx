'use client';

import Link from 'next/link';
import { useId } from 'react';
import { detalharTime } from '../../domain/consultas.ts';
import { timeComVinculos } from '../../domain/mensagens.ts';
import { DESCRITORES_TIME } from '../../domain/regras/time.ts';
import type { Documento, Time } from '../../domain/tipos.ts';
import type { CampoDetalhe } from '../Detalhes.tsx';
import { hrefDetalhes, type ConfigCadastro } from '../cadastro/config.ts';

export const TIMES: ConfigCadastro<Time> = {
  base: '/times',
  entidade: 'time',
  Entidade: 'Time',
  plural: 'Times',
  campos: () => DESCRITORES_TIME,
  obter: (doc, id) => doc.times.find((t) => t.id === id),
  criar: (repositorio, valores) => repositorio.criarTime(valores),
  atualizar: (repositorio, id, valores) => repositorio.atualizarTime(id, valores),
  excluir: (repositorio, id) => repositorio.excluirTime(id),
};

export function camposDetalheTime(_doc: Documento, time: Time): CampoDetalhe[] {
  return [
    { rotulo: 'Nome', valor: time.nome },
    { rotulo: 'Descrição', valor: time.descricao },
    { rotulo: 'Área de atuação', valor: time.area },
  ];
}

/** Exclusão bloqueada enquanto houver desenvolvedores ou projetos (FR-020). */
export function bloqueioExclusaoTime(doc: Documento, time: Time): string | null {
  const detalhe = detalharTime(doc, time.id);
  const desenvolvedores = detalhe?.desenvolvedores.length ?? 0;
  const projetos = detalhe?.projetos.length ?? 0;
  if (desenvolvedores === 0 && projetos === 0) return null;
  return timeComVinculos(time.nome, desenvolvedores, projetos);
}

type ItemVinculado = { id: string; nome: string };

function SecaoVinculos({
  titulo,
  itens,
  base,
  vazio,
}: {
  titulo: string;
  itens: readonly ItemVinculado[];
  base: string;
  vazio: string;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{titulo}</h2>
      {itens.length === 0 ? (
        <p>{vazio}</p>
      ) : (
        <ul>
          {itens.map((item) => (
            <li key={item.id}>
              <Link href={hrefDetalhes(base, item.id)}>{item.nome}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Seções "Desenvolvedores do time" e "Projetos do time" (FR-019). */
export function VinculosDoTime({ doc, time }: { doc: Documento; time: Time }) {
  const detalhe = detalharTime(doc, time.id);
  return (
    <>
      <SecaoVinculos
        titulo="Desenvolvedores do time"
        itens={detalhe?.desenvolvedores ?? []}
        base="/desenvolvedores"
        vazio="Nenhum desenvolvedor neste time."
      />
      <SecaoVinculos
        titulo="Projetos do time"
        itens={detalhe?.projetos ?? []}
        base="/projetos"
        vazio="Nenhum projeto sob responsabilidade deste time."
      />
    </>
  );
}
