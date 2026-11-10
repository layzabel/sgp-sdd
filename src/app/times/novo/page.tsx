'use client';

import { PaginaNovo } from '../../../ui/cadastro/PaginaNovo.tsx';
import { TIMES } from '../../../ui/cadastros/times.tsx';

export default function NovoTime() {
  return <PaginaNovo config={TIMES} />;
}
