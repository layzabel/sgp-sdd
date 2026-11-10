// Fábricas de documento e repositório determinísticos para os testes de domínio e dados.

import { ArmazenamentoEmMemoria } from '../../../src/data/armazenamento.ts';
import { documentoVazio } from '../../../src/data/documento.ts';
import { criarRepositorio } from '../../../src/data/repositorio.ts';
import type {
  Desenvolvedor,
  Documento,
  ItemCronograma,
  Marco,
  Projeto,
  Relatorio,
  Time,
} from '../../../src/domain/tipos.ts';

type Colecoes = Omit<Documento, 'versao' | 'seq'>;

export function doc(parcial: { [K in keyof Colecoes]?: Colecoes[K] } = {}): Documento {
  const base = { ...documentoVazio(), ...parcial };
  const seqs = [
    base.administradores,
    base.usuarios,
    base.desenvolvedores,
    base.times,
    base.projetos,
    base.relatorios,
    base.marcos,
    base.itensCronograma,
  ].flatMap((lista: readonly { seq: number }[]) => lista.map((r) => r.seq));
  return { ...base, seq: Math.max(0, ...seqs) };
}

export function time(id: string, nome: string, seq: number, extra: Partial<Time> = {}): Time {
  return { id, seq, nome, descricao: '', area: '', ...extra };
}

export function dev(
  id: string,
  nome: string,
  seq: number,
  timeId: string,
  extra: Partial<Desenvolvedor> = {},
): Desenvolvedor {
  return {
    id,
    seq,
    nome,
    email: `${id}@empresa.com`,
    telefone: '',
    cargo: '',
    nivel: 'pleno',
    tecnologia: '',
    timeId,
    ...extra,
  };
}

export function projeto(
  id: string,
  nome: string,
  seq: number,
  timeId: string,
  extra: Partial<Projeto> = {},
): Projeto {
  return {
    id,
    seq,
    nome,
    descricao: '',
    inicio: '2026-03-01',
    terminoPrevisto: '',
    situacao: 'planejado',
    timeId,
    ...extra,
  };
}

export function relatorio(id: string, projetoId: string, seq: number, criadoEm: string): Relatorio {
  return { id, seq, projetoId, texto: `texto ${id}`, criadoEm };
}

export function marco(id: string, projetoId: string, seq: number, descricao: string): Marco {
  return { id, seq, projetoId, descricao };
}

export function item(
  id: string,
  projetoId: string,
  seq: number,
  dataPrevista: string,
  atividade = `atividade ${id}`,
): ItemCronograma {
  return { id, seq, projetoId, atividade, dataPrevista };
}

/** Repositório em memória sobre um documento inicial, com ids e relógio determinísticos. */
export function repo(
  inicial: Documento | null = null,
  agora = new Date('2026-03-10T12:00:00.000Z'),
) {
  const armazenamento = new ArmazenamentoEmMemoria(
    inicial === null ? null : JSON.stringify(inicial),
  );
  let n = 0;
  const repositorio = criarRepositorio({
    armazenamento,
    gerarId: () => `novo-${++n}`,
    agora: () => agora,
  });
  return { armazenamento, repositorio };
}
