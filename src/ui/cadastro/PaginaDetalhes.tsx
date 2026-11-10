'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import {
  FALHA_GRAVACAO_EXCLUSAO,
  REGISTRO_NAO_ENCONTRADO,
  confirmarExclusao,
  sucesso,
  timeComVinculos,
} from '../../domain/mensagens.ts';
import type { Documento, ErroOperacao } from '../../domain/tipos.ts';
import { ComIdDaUrl } from '../ComIdDaUrl.tsx';
import { Detalhes, type CampoDetalhe } from '../Detalhes.tsx';
import { DialogoConfirmacao } from '../DialogoConfirmacao.tsx';
import { useMensagens } from '../Mensagens.tsx';
import { NaoEncontrado } from '../NaoEncontrado.tsx';
import { Pagina } from '../Pagina.tsx';
import { useRepositorio } from '../RepositorioProvider.tsx';
import { hrefEditar, hrefLista, type ConfigCadastro, type RegistroComNome } from './config.ts';

type Props<R extends RegistroComNome> = {
  config: ConfigCadastro<R>;
  campos: (doc: Documento, registro: R) => readonly CampoDetalhe[];
  /** Mensagem que impede a exclusão sem abrir o diálogo (ex.: time com vínculos). */
  bloqueioExclusao?: (doc: Documento, registro: R) => string | null;
  /** Texto acrescentado ao diálogo de confirmação (ex.: acompanhamento do projeto). */
  textoAdicional?: (doc: Documento, registro: R) => string;
  mensagemExcluido?: string;
  /** Conteúdo exibido abaixo dos dados (seções do time ou do projeto). */
  complemento?: (doc: Documento, registro: R) => ReactNode;
};

function mensagemFalhaExclusao(erro: ErroOperacao, nome: string): string {
  if (erro.tipo === 'vinculos') return timeComVinculos(nome, erro.desenvolvedores, erro.projetos);
  if (erro.tipo === 'nao_encontrado') return REGISTRO_NAO_ENCONTRADO;
  return FALHA_GRAVACAO_EXCLUSAO;
}

function Exibicao<R extends RegistroComNome>(props: Props<R> & { id: string }) {
  const { config, id } = props;
  const repositorio = useRepositorio();
  const roteador = useRouter();
  const mensagens = useMensagens();
  const [confirmando, setConfirmando] = useState(false);

  function solicitarExclusao(doc: Documento, registro: R) {
    const bloqueio = props.bloqueioExclusao?.(doc, registro) ?? null;
    if (bloqueio !== null) {
      mensagens.erro(bloqueio);
      return;
    }
    mensagens.limpar();
    setConfirmando(true);
  }

  function excluir(registro: R) {
    setConfirmando(false);
    const resultado = config.excluir(repositorio, id);
    if (!resultado.ok) {
      mensagens.erro(mensagemFalhaExclusao(resultado.erro, registro.nome));
      return;
    }
    const texto = props.mensagemExcluido ?? sucesso('excluído', config.Entidade);
    mensagens.sucesso(texto, { aposNavegacao: true });
    roteador.push(hrefLista(config.base));
  }

  function titulo(doc: Documento): string {
    const registro = config.obter(doc, id);
    return registro === undefined
      ? 'Registro não encontrado'
      : `${config.Entidade}: ${registro.nome}`;
  }

  function conteudo(doc: Documento) {
    const registro = config.obter(doc, id);
    if (registro === undefined) {
      return <NaoEncontrado lista={config.plural} href={hrefLista(config.base)} />;
    }
    return (
      <>
        <Detalhes
          campos={props.campos(doc, registro)}
          hrefEditar={hrefEditar(config.base, id)}
          aoExcluir={() => solicitarExclusao(doc, registro)}
        />
        <DialogoConfirmacao
          aberto={confirmando}
          titulo="Confirmar exclusão"
          texto={confirmarExclusao(config.entidade, registro.nome)}
          textoAdicional={props.textoAdicional?.(doc, registro)}
          aoConfirmar={() => excluir(registro)}
          aoCancelar={() => setConfirmando(false)}
        />
        {props.complemento?.(doc, registro)}
      </>
    );
  }

  return <Pagina titulo={titulo}>{conteudo}</Pagina>;
}

/** Tela de detalhes com exclusão confirmada (contracts/rotas-e-telas.md). */
export function PaginaDetalhes<R extends RegistroComNome>(props: Props<R>) {
  return <ComIdDaUrl>{(id) => <Exibicao {...props} id={id} />}</ComIdDaUrl>;
}
