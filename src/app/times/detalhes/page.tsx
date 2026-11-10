'use client';

import { PaginaDetalhes } from '../../../ui/cadastro/PaginaDetalhes.tsx';
import {
  TIMES,
  VinculosDoTime,
  bloqueioExclusaoTime,
  camposDetalheTime,
} from '../../../ui/cadastros/times.tsx';

export default function DetalhesTime() {
  return (
    <PaginaDetalhes
      config={TIMES}
      campos={camposDetalheTime}
      bloqueioExclusao={bloqueioExclusaoTime}
      complemento={(doc, time) => <VinculosDoTime doc={doc} time={time} />}
    />
  );
}
