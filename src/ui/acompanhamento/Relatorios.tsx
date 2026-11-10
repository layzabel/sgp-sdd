'use client';

import { formatarDataDeMomento } from '../../domain/datas.ts';
import { RELATORIO_ADICIONADO } from '../../domain/mensagens.ts';
import { DESCRITORES_RELATORIO } from '../../domain/regras/acompanhamento.ts';
import type { Relatorio } from '../../domain/tipos.ts';
import { useRepositorio } from '../RepositorioProvider.tsx';
import styles from './Acompanhamento.module.css';
import { FormularioSecao } from './FormularioSecao.tsx';
import { Secao } from './Secao.tsx';

/** Relatórios do projeto, mais recentes primeiro, com a data dd/mm/aaaa (FR-026, FR-027). */
export function Relatorios({
  projetoId,
  itens,
}: {
  projetoId: string;
  itens: readonly Relatorio[];
}) {
  const repositorio = useRepositorio();
  return (
    <Secao
      titulo="Relatórios"
      vazia={itens.length === 0}
      textoVazia="Nenhum relatório registrado."
      formulario={
        <FormularioSecao
          campos={DESCRITORES_RELATORIO}
          rotuloBotao="Adicionar relatório"
          mensagemSucesso={RELATORIO_ADICIONADO}
          aoSalvar={(valores) => repositorio.criarRelatorio(projetoId, valores)}
        />
      }
    >
      <ul className={`${styles.lista} ${styles.relatorios}`}>
        {itens.map((relatorio) => (
          <li key={relatorio.id} className={styles.relatorio}>
            <p className={styles.data}>{formatarDataDeMomento(relatorio.criadoEm)}</p>
            <p className={styles.texto}>{relatorio.texto}</p>
          </li>
        ))}
      </ul>
    </Secao>
  );
}
