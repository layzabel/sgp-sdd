// Formato do documento armazenado (contracts/repositorio.md; research R3).

import type { Documento, NomeColecao } from '../domain/tipos.ts';

export const CHAVE = 'sgp:dados';

export const COLECOES: readonly NomeColecao[] = [
  'administradores',
  'usuarios',
  'desenvolvedores',
  'times',
  'projetos',
  'relatorios',
  'marcos',
  'itensCronograma',
];

export function documentoVazio(): Documento {
  return {
    versao: 1,
    seq: 0,
    administradores: [],
    usuarios: [],
    desenvolvedores: [],
    times: [],
    projetos: [],
    relatorios: [],
    marcos: [],
    itensCronograma: [],
  };
}

export type Leitura = { estado: 'ok'; documento: Documento } | { estado: 'corrompido' };

function formatoValido(valor: unknown): valor is Documento {
  if (typeof valor !== 'object' || valor === null) return false;
  const registro = valor as Record<string, unknown>;
  return (
    registro.versao === 1 &&
    typeof registro.seq === 'number' &&
    COLECOES.every((colecao) => Array.isArray(registro[colecao]))
  );
}

/** Interpreta o texto armazenado; ausente → documento vazio; ilegível → corrompido. */
export function lerDocumento(texto: string | null): Leitura {
  if (texto === null) return { estado: 'ok', documento: documentoVazio() };
  try {
    const valor: unknown = JSON.parse(texto);
    return formatoValido(valor) ? { estado: 'ok', documento: valor } : { estado: 'corrompido' };
  } catch {
    return { estado: 'corrompido' };
  }
}
