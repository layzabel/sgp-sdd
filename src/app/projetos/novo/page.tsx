'use client';

import { PaginaNovo } from '../../../ui/cadastro/PaginaNovo.tsx';
import { PROJETOS } from '../../../ui/cadastros/projetos.tsx';

export default function NovoProjeto() {
  return <PaginaNovo config={PROJETOS} />;
}
