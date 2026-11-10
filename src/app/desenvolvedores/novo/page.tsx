'use client';

import { PaginaNovo } from '../../../ui/cadastro/PaginaNovo.tsx';
import { DESENVOLVEDORES } from '../../../ui/cadastros/desenvolvedores.tsx';

export default function NovoDesenvolvedor() {
  return <PaginaNovo config={DESENVOLVEDORES} />;
}
