'use client';

import { MARCO_ADICIONADO } from '../../domain/mensagens.ts';
import { DESCRITORES_MARCO } from '../../domain/regras/acompanhamento.ts';
import type { Marco } from '../../domain/tipos.ts';
import { useRepositorio } from '../RepositorioProvider.tsx';
import styles from './Acompanhamento.module.css';
import { FormularioSecao } from './FormularioSecao.tsx';
import { Secao } from './Secao.tsx';

/** Marcos do projeto na ordem de criação (FR-028). */
export function Marcos({ projetoId, itens }: { projetoId: string; itens: readonly Marco[] }) {
  const repositorio = useRepositorio();
  return (
    <Secao
      titulo="Marcos"
      vazia={itens.length === 0}
      textoVazia="Nenhum marco registrado."
      formulario={
        <FormularioSecao
          campos={DESCRITORES_MARCO}
          rotuloBotao="Adicionar marco"
          mensagemSucesso={MARCO_ADICIONADO}
          aoSalvar={(valores) => repositorio.criarMarco(projetoId, valores)}
        />
      }
    >
      <ol className={styles.lista}>
        {itens.map((marco) => (
          <li key={marco.id}>{marco.descricao}</li>
        ))}
      </ol>
    </Secao>
  );
}
