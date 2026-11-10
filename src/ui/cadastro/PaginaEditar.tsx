'use client';

import { useRouter } from 'next/navigation';
import { sucesso } from '../../domain/mensagens.ts';
import type { Documento } from '../../domain/tipos.ts';
import { ComIdDaUrl } from '../ComIdDaUrl.tsx';
import { Formulario } from '../Formulario.tsx';
import { useMensagens } from '../Mensagens.tsx';
import { NaoEncontrado } from '../NaoEncontrado.tsx';
import { Pagina } from '../Pagina.tsx';
import { useRepositorio } from '../RepositorioProvider.tsx';
import { SemTimes } from '../SemTimes.tsx';
import {
  hrefDetalhes,
  hrefLista,
  valoresDoRegistro,
  type ConfigCadastro,
  type RegistroComNome,
} from './config.ts';

type Props<R extends RegistroComNome> = { config: ConfigCadastro<R> };

function Edicao<R extends RegistroComNome>({ config, id }: Props<R> & { id: string }) {
  const repositorio = useRepositorio();
  const roteador = useRouter();
  const mensagens = useMensagens();
  const detalhes = hrefDetalhes(config.base, id);

  function conteudo(doc: Documento) {
    const registro = config.obter(doc, id);
    if (registro === undefined) {
      return <NaoEncontrado lista={config.plural} href={hrefLista(config.base)} />;
    }
    if (config.exigeTimes !== undefined && doc.times.length === 0) {
      return <SemTimes cadastro={config.exigeTimes} />;
    }
    const campos = config.campos(doc);
    return (
      <Formulario<R>
        campos={campos}
        valoresIniciais={valoresDoRegistro(registro, campos)}
        aoSalvar={(valores) => config.atualizar(repositorio, id, valores)}
        aoSucesso={() => {
          mensagens.sucesso(sucesso('atualizado', config.Entidade), { aposNavegacao: true });
          roteador.push(detalhes);
        }}
        aoCancelar={() => roteador.push(detalhes)}
      />
    );
  }

  return <Pagina titulo={`Editar ${config.entidade}`}>{conteudo}</Pagina>;
}

/** Tela "Editar {entidade}" com o registro identificado por `?id=`. */
export function PaginaEditar<R extends RegistroComNome>({ config }: Props<R>) {
  return <ComIdDaUrl>{(id) => <Edicao config={config} id={id} />}</ComIdDaUrl>;
}
