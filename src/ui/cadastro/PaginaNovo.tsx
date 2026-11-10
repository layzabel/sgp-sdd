'use client';

import { useRouter } from 'next/navigation';
import { sucesso } from '../../domain/mensagens.ts';
import { Formulario } from '../Formulario.tsx';
import { useMensagens } from '../Mensagens.tsx';
import { Pagina } from '../Pagina.tsx';
import { useRepositorio } from '../RepositorioProvider.tsx';
import { SemTimes } from '../SemTimes.tsx';
import { hrefDetalhes, hrefLista, type ConfigCadastro, type RegistroComNome } from './config.ts';

/** Tela "Novo {entidade}" (contracts/rotas-e-telas.md, "Formulário"). */
export function PaginaNovo<R extends RegistroComNome>({ config }: { config: ConfigCadastro<R> }) {
  const repositorio = useRepositorio();
  const roteador = useRouter();
  const mensagens = useMensagens();

  return (
    <Pagina titulo={`Novo ${config.entidade}`}>
      {(doc) =>
        config.exigeTimes !== undefined && doc.times.length === 0 ? (
          <SemTimes cadastro={config.exigeTimes} />
        ) : (
          <Formulario<R>
            campos={config.campos(doc)}
            aoSalvar={(valores) => config.criar(repositorio, valores)}
            aoSucesso={(registro) => {
              mensagens.sucesso(sucesso('cadastrado', config.Entidade), { aposNavegacao: true });
              roteador.push(hrefDetalhes(config.base, registro.id));
            }}
            aoCancelar={() => roteador.push(hrefLista(config.base))}
          />
        )
      }
    </Pagina>
  );
}
