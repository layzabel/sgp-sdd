'use client';

import type { Resultado } from '../../domain/tipos.ts';
import { Formulario, type CampoFormulario, type Valores } from '../Formulario.tsx';
import { useMensagens } from '../Mensagens.tsx';

type Props = {
  campos: readonly CampoFormulario[];
  rotuloBotao: string;
  mensagemSucesso: string;
  aoSalvar: (valores: Valores) => Resultado<unknown>;
};

/**
 * Formulário curto de uma seção de acompanhamento: limpa após salvar e anuncia o sucesso; em
 * erro mantém o texto digitado e indica os campos (mesmo comportamento acessível do Formulario).
 */
export function FormularioSecao({ campos, rotuloBotao, mensagemSucesso, aoSalvar }: Props) {
  const mensagens = useMensagens();
  return (
    <Formulario<unknown>
      campos={campos}
      rotuloSalvar={rotuloBotao}
      limparAoSalvar
      aoSalvar={aoSalvar}
      aoSucesso={() => mensagens.sucesso(mensagemSucesso)}
    />
  );
}
