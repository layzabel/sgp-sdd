'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import type { Opcao } from '../domain/validacao.ts';
import styles from './Lista.module.css';

export type CriteriosLista = { busca: string; filtros: Readonly<Record<string, string>> };
export type FiltroLista = { campo: string; rotulo: string; opcoes: readonly Opcao[] };
export type ColunaLista<T> = { titulo: string; valor: (item: T) => string };

type Props<T> = {
  /** Legenda (`<caption>`) da tabela. */
  rotuloTabela: string;
  /** Nome da entidade em minúsculas, para "Nenhum {entidade} cadastrado.". */
  entidade: string;
  linkNovo: { href: string; texto: string };
  rotuloBusca: string;
  filtros?: readonly FiltroLista[];
  /** A primeira coluna é exibida como link para os detalhes. */
  colunas: readonly ColunaLista<T>[];
  /** Quantidade total de registros cadastrados (sem busca/filtros). */
  total: number;
  consultar: (criterios: CriteriosLista) => readonly T[];
  hrefDetalhes: (item: T) => string;
  chave?: (item: T) => string;
};

const SEM_FILTROS: Readonly<Record<string, string>> = {};

function Celula<T>({ coluna, item, href }: { coluna: ColunaLista<T>; item: T; href?: string }) {
  const valor = coluna.valor(item);
  return (
    <td data-rotulo={coluna.titulo}>
      {href === undefined ? valor : <Link href={href}>{valor}</Link>}
    </td>
  );
}

function Tabela<T>({
  rotuloTabela,
  colunas,
  itens,
  hrefDetalhes,
  chave,
}: {
  rotuloTabela: string;
  colunas: readonly ColunaLista<T>[];
  itens: readonly T[];
  hrefDetalhes: (item: T) => string;
  chave: (item: T, indice: number) => string;
}) {
  return (
    <table className={styles.tabela}>
      <caption className={styles.legenda}>{rotuloTabela}</caption>
      <thead>
        <tr>
          {colunas.map((coluna) => (
            <th key={coluna.titulo} scope="col">
              {coluna.titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {itens.map((item, indice) => (
          <tr key={chave(item, indice)}>
            {colunas.map((coluna, posicao) => (
              <Celula
                key={coluna.titulo}
                coluna={coluna}
                item={item}
                href={posicao === 0 ? hrefDetalhes(item) : undefined}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Lista genérica com busca, filtros combinados, contagem e estados vazios (FR-008). */
export function Lista<T>(props: Props<T>) {
  const { entidade, linkNovo, rotuloBusca, filtros = [], total } = props;
  const [busca, setBusca] = useState('');
  const [valoresFiltro, setValoresFiltro] = useState<Readonly<Record<string, string>>>(SEM_FILTROS);
  const id = useId();
  const itens = props.consultar({ busca, filtros: valoresFiltro });
  const chave = (item: T, indice: number) => props.chave?.(item) ?? String(indice);

  function limpar() {
    setBusca('');
    setValoresFiltro(SEM_FILTROS);
  }

  return (
    <div className={styles.lista}>
      <p>
        <Link href={linkNovo.href} className="botao-link">
          {linkNovo.texto}
        </Link>
      </p>
      <div role="search" className={styles.criterios}>
        <div className={styles.criterio}>
          <label htmlFor={`${id}-busca`}>{rotuloBusca}</label>
          <input
            id={`${id}-busca`}
            type="search"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
          />
        </div>
        {filtros.map((filtro) => (
          <div key={filtro.campo} className={styles.criterio}>
            <label htmlFor={`${id}-${filtro.campo}`}>{filtro.rotulo}</label>
            <select
              id={`${id}-${filtro.campo}`}
              value={valoresFiltro[filtro.campo] ?? ''}
              onChange={(evento) =>
                setValoresFiltro((atuais) => ({ ...atuais, [filtro.campo]: evento.target.value }))
              }
            >
              <option value="">Todos</option>
              {filtro.opcoes.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.rotulo}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <p role="status" className={styles.contagem}>
        {`${itens.length} registro(s) encontrado(s)`}
      </p>
      {total === 0 ? (
        <p>
          {`Nenhum ${entidade} cadastrado.`} <Link href={linkNovo.href}>{linkNovo.texto}</Link>
        </p>
      ) : null}
      {total > 0 && itens.length === 0 ? (
        <div>
          <p>Nenhum registro atende à busca e aos filtros.</p>
          <button type="button" onClick={limpar}>
            Limpar busca e filtros
          </button>
        </div>
      ) : null}
      {itens.length > 0 ? (
        <Tabela
          rotuloTabela={props.rotuloTabela}
          colunas={props.colunas}
          itens={itens}
          hrefDetalhes={props.hrefDetalhes}
          chave={chave}
        />
      ) : null}
    </div>
  );
}
