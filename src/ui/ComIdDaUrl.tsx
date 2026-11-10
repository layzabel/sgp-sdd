'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

type Props = { children: (id: string) => ReactNode };

function Leitor({ children }: Props) {
  const id = useSearchParams().get('id') ?? '';
  return <>{children(id)}</>;
}

/** Lê `?id=` da URL (rotas estáticas de detalhe/edição, research R2). */
export function ComIdDaUrl({ children }: Props) {
  return (
    <Suspense fallback={<p>Carregando…</p>}>
      <Leitor>{children}</Leitor>
    </Suspense>
  );
}
