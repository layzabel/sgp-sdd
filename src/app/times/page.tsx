'use client';

import { listarTimes } from '../../domain/consultas.ts';
import type { Time } from '../../domain/tipos.ts';
import { hrefDetalhes, hrefNovo } from '../../ui/cadastro/config.ts';
import { Lista } from '../../ui/Lista.tsx';
import { Pagina } from '../../ui/Pagina.tsx';

export default function ListaTimes() {
  return (
    <Pagina titulo="Times">
      {(doc) => (
        <Lista<Time>
          rotuloTabela="Times cadastrados"
          entidade="time"
          linkNovo={{ href: hrefNovo('/times'), texto: 'Novo time' }}
          rotuloBusca="Buscar por nome"
          colunas={[
            { titulo: 'Nome', valor: (t) => t.nome },
            { titulo: 'Área de atuação', valor: (t) => t.area },
          ]}
          total={doc.times.length}
          consultar={({ busca }) => listarTimes(doc, { busca })}
          hrefDetalhes={(t) => hrefDetalhes('/times', t.id)}
          chave={(t) => t.id}
        />
      )}
    </Pagina>
  );
}
