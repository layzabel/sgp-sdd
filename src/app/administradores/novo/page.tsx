'use client';

import { PaginaNovo } from '../../../ui/cadastro/PaginaNovo.tsx';
import { ADMINISTRADORES } from '../../../ui/cadastros/pessoas.ts';

export default function NovoAdministrador() {
  return <PaginaNovo config={ADMINISTRADORES} />;
}
