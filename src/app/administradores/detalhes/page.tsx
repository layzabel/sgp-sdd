'use client';

import { PaginaDetalhes } from '../../../ui/cadastro/PaginaDetalhes.tsx';
import { ADMINISTRADORES, camposDetalheAdministrador } from '../../../ui/cadastros/pessoas.ts';

export default function DetalhesAdministrador() {
  return <PaginaDetalhes config={ADMINISTRADORES} campos={camposDetalheAdministrador} />;
}
