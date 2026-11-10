'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { ArmazenamentoEmMemoria, criarArmazenamentoNavegador } from '../data/armazenamento.ts';
import {
  criarRepositorio,
  type EstadoArmazenamento,
  type Repositorio,
} from '../data/repositorio.ts';
import type { Documento } from '../domain/tipos.ts';

let padrao: Repositorio | null = null;

/** Instância única criada sob demanda; no build (sem window) usa memória e nunca é exibida. */
function repositorioPadrao(): Repositorio {
  if (typeof window === 'undefined') {
    return criarRepositorio({ armazenamento: new ArmazenamentoEmMemoria() });
  }
  padrao ??= criarRepositorio({ armazenamento: criarArmazenamentoNavegador() });
  return padrao;
}

const Contexto = createContext<Repositorio | null>(null);

export function RepositorioProvider({
  repositorio,
  children,
}: {
  repositorio?: Repositorio;
  children: ReactNode;
}) {
  return <Contexto.Provider value={repositorio ?? null}>{children}</Contexto.Provider>;
}

export function useRepositorio(): Repositorio {
  return useContext(Contexto) ?? repositorioPadrao();
}

/** Documento atual; `null` na pré-renderização e no primeiro quadro da hidratação (research R5). */
export function useDocumento(): Documento | null {
  const repositorio = useRepositorio();
  return useSyncExternalStore<Documento | null>(
    repositorio.subscribe,
    repositorio.getSnapshot,
    () => null,
  );
}

export function useEstadoArmazenamento(): EstadoArmazenamento {
  return useRepositorio().estado;
}
