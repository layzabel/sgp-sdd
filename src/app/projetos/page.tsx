'use client';

import { listarProjetos } from '../../domain/consultas.ts';
import { formatarData } from '../../domain/datas.ts';
import { NAO_INFORMADO, ROTULOS_SITUACAO, opcoesDe } from '../../domain/mensagens.ts';
import type { Projeto } from '../../domain/tipos.ts';
import { hrefDetalhes, hrefNovo } from '../../ui/cadastro/config.ts';
import { nomeDoTime, opcoesDeTimes } from '../../ui/cadastros/comum.tsx';
import { Lista } from '../../ui/Lista.tsx';
import { Pagina } from '../../ui/Pagina.tsx';

export default function ListaProjetos() {
  return (
    <Pagina titulo="Projetos">
      {(doc) => (
        <Lista<Projeto>
          rotuloTabela="Projetos cadastrados"
          entidade="projeto"
          linkNovo={{ href: hrefNovo('/projetos'), texto: 'Novo projeto' }}
          rotuloBusca="Buscar por nome"
          filtros={[
            { campo: 'situacao', rotulo: 'Situação', opcoes: opcoesDe(ROTULOS_SITUACAO) },
            { campo: 'timeId', rotulo: 'Time', opcoes: opcoesDeTimes(doc) },
          ]}
          colunas={[
            { titulo: 'Nome', valor: (p) => p.nome },
            { titulo: 'Situação', valor: (p) => ROTULOS_SITUACAO[p.situacao] },
            { titulo: 'Time', valor: (p) => nomeDoTime(doc, p.timeId) },
            { titulo: 'Início', valor: (p) => formatarData(p.inicio) },
            {
              titulo: 'Término previsto',
              valor: (p) =>
                p.terminoPrevisto === '' ? NAO_INFORMADO : formatarData(p.terminoPrevisto),
            },
          ]}
          total={doc.projetos.length}
          consultar={({ busca, filtros }) =>
            listarProjetos(doc, { busca, situacao: filtros.situacao, timeId: filtros.timeId })
          }
          hrefDetalhes={(p) => hrefDetalhes('/projetos', p.id)}
          chave={(p) => p.id}
        />
      )}
    </Pagina>
  );
}
