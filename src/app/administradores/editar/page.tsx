'use client';

import { PaginaEditar } from '../../../ui/cadastro/PaginaEditar.tsx';
import { ADMINISTRADORES } from '../../../ui/cadastros/pessoas.ts';

export default function EditarAdministrador() {
  return <PaginaEditar config={ADMINISTRADORES} />;
}
