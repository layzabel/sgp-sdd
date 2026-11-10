'use client';

import { formatarData } from '../../domain/datas.ts';
import { ITEM_ADICIONADO } from '../../domain/mensagens.ts';
import { DESCRITORES_ITEM_CRONOGRAMA } from '../../domain/regras/acompanhamento.ts';
import type { ItemCronograma } from '../../domain/tipos.ts';
import { useRepositorio } from '../RepositorioProvider.tsx';
import styles from './Acompanhamento.module.css';
import { FormularioSecao } from './FormularioSecao.tsx';
import { Secao } from './Secao.tsx';

/** Itens de cronograma por data prevista crescente (FR-029). */
export function Cronograma({
  projetoId,
  itens,
}: {
  projetoId: string;
  itens: readonly ItemCronograma[];
}) {
  const repositorio = useRepositorio();
  return (
    <Secao
      titulo="Cronograma"
      vazia={itens.length === 0}
      textoVazia="Nenhum item de cronograma registrado."
      formulario={
        <FormularioSecao
          campos={DESCRITORES_ITEM_CRONOGRAMA}
          rotuloBotao="Adicionar item"
          mensagemSucesso={ITEM_ADICIONADO}
          aoSalvar={(valores) => repositorio.criarItemCronograma(projetoId, valores)}
        />
      }
    >
      <ul className={styles.lista}>
        {itens.map((item) => (
          <li key={item.id}>{`${formatarData(item.dataPrevista)} — ${item.atividade}`}</li>
        ))}
      </ul>
    </Secao>
  );
}
