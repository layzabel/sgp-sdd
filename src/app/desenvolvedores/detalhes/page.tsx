'use client';

import { PaginaDetalhes } from '../../../ui/cadastro/PaginaDetalhes.tsx';
import {
  DESENVOLVEDORES,
  camposDetalheDesenvolvedor,
} from '../../../ui/cadastros/desenvolvedores.tsx';

export default function DetalhesDesenvolvedor() {
  return <PaginaDetalhes config={DESENVOLVEDORES} campos={camposDetalheDesenvolvedor} />;
}
