'use client';

import type { ReactNode } from 'react';
import { ARMAZENAMENTO_INDISPONIVEL, DADOS_ILEGIVEIS } from '../domain/mensagens.ts';
import type { Documento } from '../domain/tipos.ts';
import { RegiaoMensagens } from './Mensagens.tsx';
import { useDocumento, useEstadoArmazenamento } from './RepositorioProvider.tsx';

export const CARREGANDO = 'Carregando…';

type Props = {
  titulo: string | ((documento: Documento) => string);
  children: ReactNode | ((documento: Documento) => ReactNode);
};

function Conteudo({ documento, children }: { documento: Documento; children: Props['children'] }) {
  const estado = useEstadoArmazenamento();
  if (estado === 'corrompido') return <p role="alert">{DADOS_ILEGIVEIS}</p>;
  if (estado === 'indisponivel') return <p role="alert">{ARMAZENAMENTO_INDISPONIVEL}</p>;
  return <>{typeof children === 'function' ? children(documento) : children}</>;
}

/** Estrutura comum de tela: título (`<h1>` e `document.title`), mensagens e conteúdo. */
export function Pagina({ titulo, children }: Props) {
  const documento = useDocumento();
  let texto = CARREGANDO;
  if (documento !== null) texto = typeof titulo === 'function' ? titulo(documento) : titulo;

  return (
    <>
      {/* React 19 eleva <title> ao <head>; prevalece sobre o título padrão do layout. */}
      <title>{texto}</title>
      <h1>{texto}</h1>
      <RegiaoMensagens />
      {documento === null ? (
        <p>{CARREGANDO}</p>
      ) : (
        <Conteudo documento={documento}>{children}</Conteudo>
      )}
    </>
  );
}
