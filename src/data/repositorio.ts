// Repositório: única camada que toca o armazenamento (contracts/repositorio.md; research R3/R4).

import { contarAcompanhamento } from '../domain/consultas.ts';
import { NOME_TIME_REPETIDO, TIME_INEXISTENTE, emailRepetido } from '../domain/mensagens.ts';
import {
  validarItemCronograma,
  validarMarco,
  validarRelatorio,
} from '../domain/regras/acompanhamento.ts';
import { validarAdministrador } from '../domain/regras/administrador.ts';
import { validarDesenvolvedor } from '../domain/regras/desenvolvedor.ts';
import { validarProjeto } from '../domain/regras/projeto.ts';
import { validarTime } from '../domain/regras/time.ts';
import { validarUsuario } from '../domain/regras/usuario.ts';
import { chaveUnicidade } from '../domain/texto.ts';
import type {
  Administrador,
  DadosAdministrador,
  DadosDesenvolvedor,
  DadosItemCronograma,
  DadosMarco,
  DadosProjeto,
  DadosRelatorio,
  DadosTime,
  DadosUsuario,
  Desenvolvedor,
  Documento,
  Entrada,
  ErrosCampo,
  Identificado,
  ItemCronograma,
  Marco,
  NomeColecao,
  Projeto,
  QuantidadesAcompanhamento,
  Relatorio,
  Resultado,
  Time,
  Usuario,
  Validado,
} from '../domain/tipos.ts';
import { semErros } from '../domain/validacao.ts';
import type { Armazenamento } from './armazenamento.ts';
import { CHAVE, documentoVazio, lerDocumento } from './documento.ts';

export type EstadoArmazenamento = 'ok' | 'corrompido' | 'indisponivel';

export type DependenciasRepositorio = {
  armazenamento: Armazenamento;
  gerarId?: () => string;
  agora?: () => Date;
};

type Alteracao<T> =
  { ok: true; documento: Documento; valor: T } | Exclude<Resultado<T>, { ok: true }>;

type Lista = readonly Identificado[];

const ERRO_GRAVACAO = { ok: false, erro: { tipo: 'gravacao' } } as const;
const NAO_ENCONTRADO = { ok: false, erro: { tipo: 'nao_encontrado' } } as const;

function falhaValidacao(campos: ErrosCampo) {
  return { ok: false, erro: { tipo: 'validacao', campos } } as const;
}

function carregar(armazenamento: Armazenamento): {
  estado: EstadoArmazenamento;
  documento: Documento;
} {
  let texto: string | null;
  try {
    texto = armazenamento.getItem(CHAVE);
  } catch {
    return { estado: 'indisponivel', documento: documentoVazio() };
  }
  const leitura = lerDocumento(texto);
  return leitura.estado === 'ok'
    ? { estado: 'ok', documento: leitura.documento }
    : { estado: 'corrompido', documento: documentoVazio() };
}

// --- Auxiliares puros sobre o documento ----------------------------------------------------------

function lista(doc: Documento, colecao: NomeColecao): Lista {
  return doc[colecao];
}

function buscar<R extends Identificado>(
  doc: Documento,
  colecao: NomeColecao,
  id: string,
): R | undefined {
  return lista(doc, colecao).find((r) => r.id === id) as R | undefined;
}

function comColecao(doc: Documento, colecao: NomeColecao, itens: Lista, seq = doc.seq): Documento {
  return { ...doc, seq, [colecao]: itens };
}

function inserirRegistro(doc: Documento, colecao: NomeColecao, registro: Identificado): Documento {
  return comColecao(doc, colecao, [...lista(doc, colecao), registro], registro.seq);
}

function substituirRegistro(
  doc: Documento,
  colecao: NomeColecao,
  registro: Identificado,
): Documento {
  return comColecao(
    doc,
    colecao,
    lista(doc, colecao).map((r) => (r.id === registro.id ? registro : r)),
  );
}

function removerRegistro(doc: Documento, colecao: NomeColecao, id: string): Documento {
  return comColecao(
    doc,
    colecao,
    lista(doc, colecao).filter((r) => r.id !== id),
  );
}

/** Existe outro registro (que não `idIgnorado`) com o mesmo valor, sem diferenciar caixa? */
function verificarUnicidade(
  doc: Documento,
  colecao: NomeColecao,
  campo: string,
  valor: string,
  idIgnorado: string | null,
): boolean {
  const chave = chaveUnicidade(valor);
  return lista(doc, colecao).some(
    (r) =>
      r.id !== idIgnorado &&
      chaveUnicidade(String((r as Record<string, unknown>)[campo])) === chave,
  );
}

// --- Cadastros genéricos -----------------------------------------------------------------------

type RegraExtra<D> = (doc: Documento, valores: D, idIgnorado: string | null) => ErrosCampo;

type ConfigCadastro<D> = {
  colecao: NomeColecao;
  validar: (entrada: Entrada<D>) => Validado<D>;
  regras?: readonly RegraExtra<D>[];
};

function regraUnica<D>(
  campo: keyof D & string,
  colecao: NomeColecao,
  mensagem: string,
): RegraExtra<D> {
  return (doc, valores, idIgnorado) =>
    verificarUnicidade(doc, colecao, campo, String(valores[campo]), idIgnorado)
      ? { [campo]: mensagem }
      : {};
}

/** O time escolhido deve existir (FR-015, FR-023). */
function regraTimeExiste<D extends { timeId: string }>(doc: Documento, valores: D): ErrosCampo {
  const existe = doc.times.some((t) => t.id === valores.timeId);
  return valores.timeId === '' || existe ? {} : { timeId: TIME_INEXISTENTE };
}

function validarCadastro<D>(
  cfg: ConfigCadastro<D>,
  doc: Documento,
  entrada: Entrada<D>,
  id: string | null,
) {
  const { valores, erros } = cfg.validar(entrada);
  const extras = (cfg.regras ?? []).reduce<ErrosCampo>(
    (acumulado, regra) => ({ ...regra(doc, valores, id), ...acumulado }),
    {},
  );
  // Erros de formato do próprio campo têm precedência sobre as regras entre registros.
  return { valores, erros: { ...extras, ...erros } };
}

export function criarRepositorio(deps: DependenciasRepositorio) {
  const { armazenamento } = deps;
  const gerarId = deps.gerarId ?? (() => crypto.randomUUID());
  const agora = deps.agora ?? (() => new Date());
  const carregado = carregar(armazenamento);
  const estado: EstadoArmazenamento = carregado.estado;
  let documento = carregado.documento;
  const ouvintes = new Set<() => void>();

  /** Serializa e grava com um único setItem; só troca o snapshot e notifica em sucesso. */
  function gravar(novo: Documento): boolean {
    try {
      armazenamento.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      return false;
    }
    documento = novo;
    for (const ouvinte of ouvintes) ouvinte();
    return true;
  }

  /** Executa uma alteração; nenhuma exceção escapa e falhas não alteram nada (FR-039). */
  function executar<T>(alterar: (doc: Documento) => Alteracao<T>): Resultado<T> {
    if (estado !== 'ok') return ERRO_GRAVACAO;
    let alteracao: Alteracao<T>;
    try {
      alteracao = alterar(documento);
    } catch {
      return ERRO_GRAVACAO;
    }
    if (!alteracao.ok) return alteracao;
    return gravar(alteracao.documento) ? { ok: true, valor: alteracao.valor } : ERRO_GRAVACAO;
  }

  function novoRegistro<R extends Identificado>(doc: Documento, valores: object): R {
    return { id: gerarId(), seq: doc.seq + 1, ...valores } as R;
  }

  function criarEm<D, R extends Identificado>(
    cfg: ConfigCadastro<D>,
    entrada: Entrada<D>,
  ): Resultado<R> {
    return executar((doc) => {
      const { valores, erros } = validarCadastro(cfg, doc, entrada, null);
      if (!semErros(erros)) return falhaValidacao(erros);
      const registro = novoRegistro<R>(doc, valores as object);
      return { ok: true, documento: inserirRegistro(doc, cfg.colecao, registro), valor: registro };
    });
  }

  function atualizarEm<D, R extends Identificado>(
    cfg: ConfigCadastro<D>,
    id: string,
    entrada: Entrada<D>,
  ): Resultado<R> {
    return executar((doc) => {
      const atual = buscar<R>(doc, cfg.colecao, id);
      if (atual === undefined) return NAO_ENCONTRADO;
      const { valores, erros } = validarCadastro(cfg, doc, entrada, id);
      if (!semErros(erros)) return falhaValidacao(erros);
      const registro = { ...atual, ...valores } as R;
      return {
        ok: true,
        documento: substituirRegistro(doc, cfg.colecao, registro),
        valor: registro,
      };
    });
  }

  function excluirEm(colecao: NomeColecao, id: string): Resultado<void> {
    return executar((doc) => {
      if (buscar(doc, colecao, id) === undefined) return NAO_ENCONTRADO;
      return { ok: true, documento: removerRegistro(doc, colecao, id), valor: undefined };
    });
  }

  // --- Times (FR-018…FR-020) -------------------------------------------------------------------

  const TIMES: ConfigCadastro<DadosTime> = {
    colecao: 'times',
    validar: validarTime,
    regras: [regraUnica<DadosTime>('nome', 'times', NOME_TIME_REPETIDO)],
  };

  function excluirTime(id: string): Resultado<void> {
    return executar((doc) => {
      if (buscar(doc, 'times', id) === undefined) return NAO_ENCONTRADO;
      const desenvolvedores = doc.desenvolvedores.filter((d) => d.timeId === id).length;
      const projetos = doc.projetos.filter((p) => p.timeId === id).length;
      if (desenvolvedores > 0 || projetos > 0) {
        return { ok: false, erro: { tipo: 'vinculos', desenvolvedores, projetos } };
      }
      return { ok: true, documento: removerRegistro(doc, 'times', id), valor: undefined };
    });
  }

  // --- Projetos (FR-021…FR-025) ----------------------------------------------------------------

  const PROJETOS: ConfigCadastro<DadosProjeto> = {
    colecao: 'projetos',
    validar: validarProjeto,
    regras: [regraTimeExiste],
  };

  /** Remove o projeto e todo o seu acompanhamento numa única gravação (FR-025). */
  function excluirProjeto(id: string): Resultado<QuantidadesAcompanhamento> {
    return executar((doc) => {
      if (buscar(doc, 'projetos', id) === undefined) return NAO_ENCONTRADO;
      const removidos = contarAcompanhamento(doc, id);
      const novo: Documento = {
        ...doc,
        projetos: doc.projetos.filter((p) => p.id !== id),
        relatorios: doc.relatorios.filter((r) => r.projetoId !== id),
        marcos: doc.marcos.filter((m) => m.projetoId !== id),
        itensCronograma: doc.itensCronograma.filter((i) => i.projetoId !== id),
      };
      return { ok: true, documento: novo, valor: removidos };
    });
  }

  // --- Desenvolvedores (FR-014…FR-017) -----------------------------------------------------------

  const DESENVOLVEDORES: ConfigCadastro<DadosDesenvolvedor> = {
    colecao: 'desenvolvedores',
    validar: validarDesenvolvedor,
    regras: [
      regraUnica<DadosDesenvolvedor>('email', 'desenvolvedores', emailRepetido('desenvolvedor')),
      regraTimeExiste,
    ],
  };

  // --- Administradores e usuários (FR-010…FR-013): sem vínculos, exclusão nunca bloqueada ---

  const ADMINISTRADORES: ConfigCadastro<DadosAdministrador> = {
    colecao: 'administradores',
    validar: validarAdministrador,
    regras: [
      regraUnica<DadosAdministrador>('email', 'administradores', emailRepetido('administrador')),
    ],
  };

  const USUARIOS: ConfigCadastro<DadosUsuario> = {
    colecao: 'usuarios',
    validar: validarUsuario,
    regras: [regraUnica<DadosUsuario>('email', 'usuarios', emailRepetido('usuário'))],
  };

  // --- Acompanhamento (FR-026…FR-030): só criação, sem edição nem exclusão individual --------

  function criarAcompanhamento<D, R extends Identificado>(
    colecao: 'relatorios' | 'marcos' | 'itensCronograma',
    projetoId: string,
    validar: (entrada: Entrada<D>) => Validado<D>,
    entrada: Entrada<D>,
    extras: object = {},
  ): Resultado<R> {
    return executar((doc) => {
      if (buscar(doc, 'projetos', projetoId) === undefined) return NAO_ENCONTRADO;
      const { valores, erros } = validar(entrada);
      if (!semErros(erros)) return falhaValidacao(erros);
      const registro = novoRegistro<R>(doc, { projetoId, ...valores, ...extras });
      return { ok: true, documento: inserirRegistro(doc, colecao, registro), valor: registro };
    });
  }

  function criarRelatorio(projetoId: string, dados: Entrada<DadosRelatorio>) {
    return criarAcompanhamento<DadosRelatorio, Relatorio>(
      'relatorios',
      projetoId,
      validarRelatorio,
      dados,
      { criadoEm: agora().toISOString() },
    );
  }

  return {
    get estado(): EstadoArmazenamento {
      return estado;
    },
    subscribe(ouvinte: () => void): () => void {
      ouvintes.add(ouvinte);
      return () => {
        ouvintes.delete(ouvinte);
      };
    },
    getSnapshot(): Documento {
      return documento;
    },

    criarTime: (dados: Entrada<DadosTime>) => criarEm<DadosTime, Time>(TIMES, dados),
    atualizarTime: (id: string, dados: Entrada<DadosTime>) =>
      atualizarEm<DadosTime, Time>(TIMES, id, dados),
    excluirTime,

    criarProjeto: (dados: Entrada<DadosProjeto>) => criarEm<DadosProjeto, Projeto>(PROJETOS, dados),
    atualizarProjeto: (id: string, dados: Entrada<DadosProjeto>) =>
      atualizarEm<DadosProjeto, Projeto>(PROJETOS, id, dados),
    excluirProjeto,

    criarDesenvolvedor: (dados: Entrada<DadosDesenvolvedor>) =>
      criarEm<DadosDesenvolvedor, Desenvolvedor>(DESENVOLVEDORES, dados),
    atualizarDesenvolvedor: (id: string, dados: Entrada<DadosDesenvolvedor>) =>
      atualizarEm<DadosDesenvolvedor, Desenvolvedor>(DESENVOLVEDORES, id, dados),
    excluirDesenvolvedor: (id: string) => excluirEm('desenvolvedores', id),

    criarAdministrador: (dados: Entrada<DadosAdministrador>) =>
      criarEm<DadosAdministrador, Administrador>(ADMINISTRADORES, dados),
    atualizarAdministrador: (id: string, dados: Entrada<DadosAdministrador>) =>
      atualizarEm<DadosAdministrador, Administrador>(ADMINISTRADORES, id, dados),
    excluirAdministrador: (id: string) => excluirEm('administradores', id),

    criarUsuario: (dados: Entrada<DadosUsuario>) => criarEm<DadosUsuario, Usuario>(USUARIOS, dados),
    atualizarUsuario: (id: string, dados: Entrada<DadosUsuario>) =>
      atualizarEm<DadosUsuario, Usuario>(USUARIOS, id, dados),
    excluirUsuario: (id: string) => excluirEm('usuarios', id),

    criarRelatorio,
    criarMarco: (projetoId: string, dados: Entrada<DadosMarco>) =>
      criarAcompanhamento<DadosMarco, Marco>('marcos', projetoId, validarMarco, dados),
    criarItemCronograma: (projetoId: string, dados: Entrada<DadosItemCronograma>) =>
      criarAcompanhamento<DadosItemCronograma, ItemCronograma>(
        'itensCronograma',
        projetoId,
        validarItemCronograma,
        dados,
      ),
  };
}

export type Repositorio = ReturnType<typeof criarRepositorio>;
