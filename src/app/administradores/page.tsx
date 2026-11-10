'use client';

import { listarAdministradores } from '../../domain/consultas.ts';
import type { Administrador } from '../../domain/tipos.ts';
import { hrefDetalhes, hrefNovo } from '../../ui/cadastro/config.ts';
import { Lista } from '../../ui/Lista.tsx';
import { Pagina } from '../../ui/Pagina.tsx';

export default function ListaAdministradores() {
  return (
    <Pagina titulo="Administradores">
      {(doc) => (
        <Lista<Administrador>
          rotuloTabela="Administradores cadastrados"
          entidade="administrador"
          linkNovo={{ href: hrefNovo('/administradores'), texto: 'Novo administrador' }}
          rotuloBusca="Buscar por nome ou e-mail"
          colunas={[
            { titulo: 'Nome', valor: (a) => a.nome },
            { titulo: 'E-mail', valor: (a) => a.email },
            { titulo: 'Cargo', valor: (a) => a.cargo },
            { titulo: 'Setor', valor: (a) => a.setor },
          ]}
          total={doc.administradores.length}
          consultar={({ busca }) => listarAdministradores(doc, { busca })}
          hrefDetalhes={(a) => hrefDetalhes('/administradores', a.id)}
          chave={(a) => a.id}
        />
      )}
    </Pagina>
  );
}
