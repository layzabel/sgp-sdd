'use client';

import { PaginaEditar } from '../../../ui/cadastro/PaginaEditar.tsx';
import { USUARIOS } from '../../../ui/cadastros/pessoas.ts';

export default function EditarUsuario() {
  return <PaginaEditar config={USUARIOS} />;
}
