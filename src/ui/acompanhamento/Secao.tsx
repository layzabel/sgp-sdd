'use client';

import { useId, type ReactNode } from 'react';
import styles from './Acompanhamento.module.css';

type Props = {
  titulo: string;
  formulario: ReactNode;
  vazia: boolean;
  textoVazia: string;
  children: ReactNode;
};

/** Seção de acompanhamento: título, formulário de criação e, logo abaixo, a lista. */
export function Secao({ titulo, formulario, vazia, textoVazia, children }: Props) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={styles.secao}>
      <h2 id={id}>{titulo}</h2>
      {formulario}
      {vazia ? <p className={styles.vazia}>{textoVazia}</p> : children}
    </section>
  );
}
