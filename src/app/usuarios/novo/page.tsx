'use client';

import { PaginaNovo } from '../../../ui/cadastro/PaginaNovo.tsx';
import { USUARIOS } from '../../../ui/cadastros/pessoas.ts';

export default function NovoUsuario() {
  return <PaginaNovo config={USUARIOS} />;
}
