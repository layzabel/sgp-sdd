'use client';

import { PaginaDetalhes } from '../../../ui/cadastro/PaginaDetalhes.tsx';
import { USUARIOS, camposDetalheUsuario } from '../../../ui/cadastros/pessoas.ts';

export default function DetalhesUsuario() {
  return <PaginaDetalhes config={USUARIOS} campos={camposDetalheUsuario} />;
}
