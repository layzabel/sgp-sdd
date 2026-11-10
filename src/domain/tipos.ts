// Tipos do domínio (data-model.md e contracts/repositorio.md).

export type Nivel = 'junior' | 'pleno' | 'senior';
export type Situacao = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';

/** Campos internos de todo registro: identificador e ordem de criação (não exibidos). */
export type Identificado = { id: string; seq: number };

export type DadosAdministrador = {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  setor: string;
};

export type DadosUsuario = {
  nome: string;
  email: string;
  telefone: string;
  organizacao: string;
};

export type DadosDesenvolvedor = {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  nivel: Nivel;
  tecnologia: string;
  timeId: string;
};

export type DadosTime = {
  nome: string;
  descricao: string;
  area: string;
};

export type DadosProjeto = {
  nome: string;
  descricao: string;
  inicio: string;
  terminoPrevisto: string;
  situacao: Situacao;
  timeId: string;
};

export type DadosRelatorio = { texto: string };
export type DadosMarco = { descricao: string };
export type DadosItemCronograma = { atividade: string; dataPrevista: string };

export type Administrador = Identificado & DadosAdministrador;
export type Usuario = Identificado & DadosUsuario;
export type Desenvolvedor = Identificado & DadosDesenvolvedor;
export type Time = Identificado & DadosTime;
export type Projeto = Identificado & DadosProjeto;
export type Relatorio = Identificado & DadosRelatorio & { projetoId: string; criadoEm: string };
export type Marco = Identificado & DadosMarco & { projetoId: string };
export type ItemCronograma = Identificado & DadosItemCronograma & { projetoId: string };

export type Documento = {
  readonly versao: 1;
  readonly seq: number;
  readonly administradores: readonly Administrador[];
  readonly usuarios: readonly Usuario[];
  readonly desenvolvedores: readonly Desenvolvedor[];
  readonly times: readonly Time[];
  readonly projetos: readonly Projeto[];
  readonly relatorios: readonly Relatorio[];
  readonly marcos: readonly Marco[];
  readonly itensCronograma: readonly ItemCronograma[];
};

export type NomeColecao = Exclude<keyof Documento, 'versao' | 'seq'>;

/** Entrada vinda da interface: textos ainda não aparados nem validados. */
export type Entrada<D> = Partial<Record<keyof D, string>>;

export type ErrosCampo = Partial<Record<string, string>>;

export type ErroOperacao =
  | { tipo: 'validacao'; campos: ErrosCampo }
  | { tipo: 'vinculos'; desenvolvedores: number; projetos: number }
  | { tipo: 'nao_encontrado' }
  | { tipo: 'gravacao' };

export type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: ErroOperacao };

/** Resultado de uma validação de entrada: valores aparados e erros por campo. */
export type Validado<D> = { valores: D; erros: ErrosCampo };

export type QuantidadesAcompanhamento = {
  relatorios: number;
  marcos: number;
  itensCronograma: number;
};
