'use client';

import { detalharProjeto } from '../../../domain/consultas.ts';
import { PROJETO_EXCLUIDO } from '../../../domain/mensagens.ts';
import type { Documento, Projeto } from '../../../domain/tipos.ts';
import { Cronograma } from '../../../ui/acompanhamento/Cronograma.tsx';
import { Marcos } from '../../../ui/acompanhamento/Marcos.tsx';
import { Relatorios } from '../../../ui/acompanhamento/Relatorios.tsx';
import { PaginaDetalhes } from '../../../ui/cadastro/PaginaDetalhes.tsx';
import {
  PROJETOS,
  camposDetalheProjeto,
  textoExclusaoProjeto,
} from '../../../ui/cadastros/projetos.tsx';

/** Seções de acompanhamento abaixo dos dados do projeto: Relatórios, Marcos, Cronograma. */
function Acompanhamento({ doc, projeto }: { doc: Documento; projeto: Projeto }) {
  const detalhe = detalharProjeto(doc, projeto.id);
  if (detalhe === null) return null;
  return (
    <>
      <Relatorios projetoId={projeto.id} itens={detalhe.relatorios} />
      <Marcos projetoId={projeto.id} itens={detalhe.marcos} />
      <Cronograma projetoId={projeto.id} itens={detalhe.itensCronograma} />
    </>
  );
}

export default function DetalhesProjeto() {
  return (
    <PaginaDetalhes
      config={PROJETOS}
      campos={camposDetalheProjeto}
      textoAdicional={textoExclusaoProjeto}
      mensagemExcluido={PROJETO_EXCLUIDO}
      complemento={(doc, projeto) => <Acompanhamento doc={doc} projeto={projeto} />}
    />
  );
}
