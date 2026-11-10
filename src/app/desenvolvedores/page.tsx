'use client';

import { listarDesenvolvedores } from '../../domain/consultas.ts';
import { ROTULOS_NIVEL, opcoesDe } from '../../domain/mensagens.ts';
import type { Desenvolvedor } from '../../domain/tipos.ts';
import { hrefDetalhes, hrefNovo } from '../../ui/cadastro/config.ts';
import { nomeDoTime, opcoesDeTimes } from '../../ui/cadastros/comum.tsx';
import { Lista } from '../../ui/Lista.tsx';
import { Pagina } from '../../ui/Pagina.tsx';

export default function ListaDesenvolvedores() {
  return (
    <Pagina titulo="Desenvolvedores">
      {(doc) => (
        <Lista<Desenvolvedor>
          rotuloTabela="Desenvolvedores cadastrados"
          entidade="desenvolvedor"
          linkNovo={{ href: hrefNovo('/desenvolvedores'), texto: 'Novo desenvolvedor' }}
          rotuloBusca="Buscar por nome"
          filtros={[
            { campo: 'timeId', rotulo: 'Time', opcoes: opcoesDeTimes(doc) },
            { campo: 'nivel', rotulo: 'Nível', opcoes: opcoesDe(ROTULOS_NIVEL) },
          ]}
          colunas={[
            { titulo: 'Nome', valor: (d) => d.nome },
            { titulo: 'E-mail', valor: (d) => d.email },
            { titulo: 'Nível', valor: (d) => ROTULOS_NIVEL[d.nivel] },
            { titulo: 'Time', valor: (d) => nomeDoTime(doc, d.timeId) },
          ]}
          total={doc.desenvolvedores.length}
          consultar={({ busca, filtros }) =>
            listarDesenvolvedores(doc, { busca, timeId: filtros.timeId, nivel: filtros.nivel })
          }
          hrefDetalhes={(d) => hrefDetalhes('/desenvolvedores', d.id)}
          chave={(d) => d.id}
        />
      )}
    </Pagina>
  );
}
