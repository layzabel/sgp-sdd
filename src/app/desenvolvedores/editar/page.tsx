'use client';

import { PaginaEditar } from '../../../ui/cadastro/PaginaEditar.tsx';
import { DESENVOLVEDORES } from '../../../ui/cadastros/desenvolvedores.tsx';

export default function EditarDesenvolvedor() {
  return <PaginaEditar config={DESENVOLVEDORES} />;
}
