'use client';

import { listarUsuarios } from '../../domain/consultas.ts';
import type { Usuario } from '../../domain/tipos.ts';
import { hrefDetalhes, hrefNovo } from '../../ui/cadastro/config.ts';
import { Lista } from '../../ui/Lista.tsx';
import { Pagina } from '../../ui/Pagina.tsx';

export default function ListaUsuarios() {
  return (
    <Pagina titulo="Usuários">
      {(doc) => (
        <Lista<Usuario>
          rotuloTabela="Usuários cadastrados"
          entidade="usuário"
          linkNovo={{ href: hrefNovo('/usuarios'), texto: 'Novo usuário' }}
          rotuloBusca="Buscar por nome ou organização"
          colunas={[
            { titulo: 'Nome', valor: (u) => u.nome },
            { titulo: 'E-mail', valor: (u) => u.email },
            { titulo: 'Organização', valor: (u) => u.organizacao },
          ]}
          total={doc.usuarios.length}
          consultar={({ busca }) => listarUsuarios(doc, { busca })}
          hrefDetalhes={(u) => hrefDetalhes('/usuarios', u.id)}
          chave={(u) => u.id}
        />
      )}
    </Pagina>
  );
}
