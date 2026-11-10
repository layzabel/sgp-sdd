'use client';

import { PaginaEditar } from '../../../ui/cadastro/PaginaEditar.tsx';
import { PROJETOS } from '../../../ui/cadastros/projetos.tsx';

export default function EditarProjeto() {
  return <PaginaEditar config={PROJETOS} />;
}
