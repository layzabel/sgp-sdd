'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './Mensagens.module.css';

type TipoMensagem = 'sucesso' | 'erro';
type Opcoes = { aposNavegacao?: boolean };
type Mensagem = { tipo: TipoMensagem; texto: string; aposNavegacao: boolean };

type ApiMensagens = {
  sucesso: (texto: string, opcoes?: Opcoes) => void;
  erro: (texto: string, opcoes?: Opcoes) => void;
  limpar: () => void;
};

type ValorContexto = ApiMensagens & { mensagem: Mensagem | null };

const Contexto = createContext<ValorContexto | null>(null);

/**
 * Guarda a mensagem de operação. Uma mensagem publicada com `aposNavegacao` sobrevive à próxima
 * troca de tela (aparece no destino) e some na seguinte; as demais somem na próxima troca.
 */
export function MensagensProvider({ children }: { children: ReactNode }) {
  const caminho = usePathname();
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const ultimoCaminho = useRef(caminho);

  useEffect(() => {
    if (ultimoCaminho.current === caminho) return;
    ultimoCaminho.current = caminho;
    setMensagem((atual) => (atual?.aposNavegacao ? { ...atual, aposNavegacao: false } : null));
  }, [caminho]);

  const publicar = useCallback((tipo: TipoMensagem, texto: string, opcoes?: Opcoes) => {
    setMensagem({ tipo, texto, aposNavegacao: opcoes?.aposNavegacao === true });
  }, []);

  const valor = useMemo<ValorContexto>(
    () => ({
      mensagem,
      sucesso: (texto, opcoes) => publicar('sucesso', texto, opcoes),
      erro: (texto, opcoes) => publicar('erro', texto, opcoes),
      limpar: () => setMensagem(null),
    }),
    [mensagem, publicar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

const SEM_PROVEDOR: ValorContexto = {
  mensagem: null,
  sucesso: () => undefined,
  erro: () => undefined,
  limpar: () => undefined,
};

function useContexto(): ValorContexto {
  return useContext(Contexto) ?? SEM_PROVEDOR;
}

export function useMensagens(): ApiMensagens {
  const { sucesso, erro, limpar } = useContexto();
  return useMemo(() => ({ sucesso, erro, limpar }), [sucesso, erro, limpar]);
}

/** Região de mensagens exibida logo abaixo do título de cada tela. */
export function RegiaoMensagens() {
  const { mensagem, limpar } = useContexto();
  if (mensagem === null) return null;
  const ehErro = mensagem.tipo === 'erro';
  return (
    <div
      className={`${styles.mensagem} ${ehErro ? styles.erro : styles.sucesso}`}
      role={ehErro ? 'alert' : 'status'}
    >
      <p>{mensagem.texto}</p>
      <button type="button" className={styles.fechar} onClick={limpar}>
        Fechar mensagem
      </button>
    </div>
  );
}
