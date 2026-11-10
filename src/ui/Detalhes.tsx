'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { NAO_INFORMADO } from '../domain/mensagens.ts';
import styles from './Detalhes.module.css';

export type CampoDetalhe = { rotulo: string; valor: string | ReactNode };

type Props = {
  campos: readonly CampoDetalhe[];
  hrefEditar: string;
  aoExcluir: () => void;
};

function exibir(valor: string | ReactNode): ReactNode {
  return valor === '' || valor === null || valor === undefined ? NAO_INFORMADO : valor;
}

/** Campos rotulados do registro e ações "Editar" e "Excluir". */
export function Detalhes({ campos, hrefEditar, aoExcluir }: Props) {
  return (
    <div className={styles.detalhes}>
      <dl className={styles.campos}>
        {campos.map((campo) => (
          <div key={campo.rotulo} className={styles.campo}>
            <dt>{campo.rotulo}</dt>
            <dd>{exibir(campo.valor)}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.acoes}>
        <Link href={hrefEditar} className="botao-link">
          Editar
        </Link>
        <button type="button" className="botao-perigo" onClick={aoExcluir}>
          Excluir
        </button>
      </div>
    </div>
  );
}
