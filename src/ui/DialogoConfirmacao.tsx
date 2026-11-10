'use client';

import { useEffect, useId, useRef, type KeyboardEvent, type SyntheticEvent } from 'react';
import styles from './DialogoConfirmacao.module.css';

type Props = {
  aberto: boolean;
  titulo: string;
  texto: string;
  textoAdicional?: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
};

/** Diálogo modal nativo de confirmação de exclusão (research R10). */
export function DialogoConfirmacao({
  aberto,
  titulo,
  texto,
  textoAdicional,
  aoConfirmar,
  aoCancelar,
}: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const origem = useRef<HTMLElement | null>(null);
  const idTitulo = useId();

  useEffect(() => {
    const elemento = dialogo.current;
    if (elemento === null) return;
    if (aberto && !elemento.open) {
      origem.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      elemento.showModal();
      cancelar.current?.focus();
    } else if (!aberto && elemento.open) {
      elemento.close();
      origem.current?.focus();
    }
  }, [aberto]);

  function aoCancelarNativo(evento: SyntheticEvent<HTMLDialogElement>) {
    evento.preventDefault();
    aoCancelar();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLDialogElement>) {
    if (evento.key !== 'Escape') return;
    evento.preventDefault();
    aoCancelar();
  }

  return (
    <dialog
      ref={dialogo}
      className={styles.dialogo}
      aria-labelledby={idTitulo}
      onCancel={aoCancelarNativo}
      onKeyDown={aoTeclar}
    >
      <h2 id={idTitulo} className={styles.titulo}>
        {titulo}
      </h2>
      <p>{texto}</p>
      {textoAdicional === undefined ? null : <p>{textoAdicional}</p>}
      <div className={styles.acoes}>
        <button type="button" className="botao-perigo" onClick={aoConfirmar}>
          Excluir
        </button>
        <button type="button" ref={cancelar} onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </dialog>
  );
}
