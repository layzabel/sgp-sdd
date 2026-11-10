import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ArmazenamentoEmMemoria } from '../../../src/data/armazenamento.ts';
import { criarRepositorio } from '../../../src/data/repositorio.ts';
import type { Documento } from '../../../src/domain/tipos.ts';
import { MensagensProvider } from '../../../src/ui/Mensagens.tsx';
import { RepositorioProvider } from '../../../src/ui/RepositorioProvider.tsx';

/** Renderiza uma tela com repositório em memória e região de mensagens. */
export function renderizar(ui: ReactElement, documento: Documento | null = null) {
  const armazenamento = new ArmazenamentoEmMemoria(
    documento === null ? null : JSON.stringify(documento),
  );
  let n = 0;
  const repositorio = criarRepositorio({
    armazenamento,
    gerarId: () => `novo-${++n}`,
    agora: () => new Date('2026-03-10T12:00:00.000Z'),
  });
  const resultado = render(
    <RepositorioProvider repositorio={repositorio}>
      <MensagensProvider>{ui}</MensagensProvider>
    </RepositorioProvider>,
  );
  return { ...resultado, repositorio, armazenamento };
}
