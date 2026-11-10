'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { FALHA_GRAVACAO, REGISTRO_NAO_ENCONTRADO, RESUMO_VALIDACAO } from '../domain/mensagens.ts';
import type { ErroOperacao, ErrosCampo, Resultado } from '../domain/tipos.ts';
import type { CampoDescritor, ControleCampo } from '../domain/validacao.ts';
import styles from './Formulario.module.css';

export type CampoFormulario = CampoDescritor;
export type Valores = Record<string, string>;

type Props<T> = {
  campos: readonly CampoFormulario[];
  valoresIniciais?: Readonly<Partial<Valores>>;
  aoSalvar: (valores: Valores) => Resultado<T>;
  aoSucesso: (valor: T) => void;
  aoCancelar?: () => void;
  rotuloSalvar?: string;
  /** Limpa os campos após salvar com sucesso (formulários de acompanhamento). */
  limparAoSalvar?: boolean;
};

const CONTROLE_POR_TIPO: Readonly<Record<CampoDescritor['tipo'], ControleCampo>> = {
  texto: 'texto',
  email: 'email',
  data: 'date',
  enum: 'select',
  referencia: 'select',
};

function controleDe(campo: CampoFormulario): ControleCampo {
  return campo.controle ?? CONTROLE_POR_TIPO[campo.tipo];
}

export function idCampo(campo: string): string {
  return `campo-${campo}`;
}

function valoresDe(
  campos: readonly CampoFormulario[],
  iniciais: Readonly<Partial<Valores>>,
): Valores {
  return Object.fromEntries(campos.map((c) => [c.campo, iniciais[c.campo] ?? '']));
}

function mensagemDeErro(erro: ErroOperacao): string {
  if (erro.tipo === 'validacao') return RESUMO_VALIDACAO;
  if (erro.tipo === 'nao_encontrado') return REGISTRO_NAO_ENCONTRADO;
  return FALHA_GRAVACAO;
}

type PropsControle = {
  campo: CampoFormulario;
  valor: string;
  erro: string | undefined;
  aoAlterar: (campo: string, valor: string) => void;
};

function Controle({ campo, valor, erro, aoAlterar }: PropsControle) {
  const comuns = {
    id: idCampo(campo.campo),
    name: campo.campo,
    value: valor,
    'aria-invalid': erro === undefined ? undefined : true,
    'aria-describedby': erro === undefined ? undefined : `erro-${campo.campo}`,
    'aria-required': campo.obrigatorio ? true : undefined,
    onChange: (evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      aoAlterar(campo.campo, evento.target.value),
  };
  const controle = controleDe(campo);
  if (controle === 'textarea') return <textarea {...comuns} rows={5} />;
  if (controle === 'select') {
    return (
      <select {...comuns}>
        <option value="">Selecione…</option>
        {(campo.opcoes ?? []).map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    );
  }
  const tipo = controle === 'texto' ? 'text' : controle;
  return <input {...comuns} type={tipo} />;
}

/** Formulário genérico dirigido por descritores de campo (contracts/rotas-e-telas.md). */
export function Formulario<T>({
  campos,
  valoresIniciais = {},
  aoSalvar,
  aoSucesso,
  aoCancelar,
  rotuloSalvar = 'Salvar',
  limparAoSalvar = false,
}: Props<T>) {
  const [valores, setValores] = useState<Valores>(() => valoresDe(campos, valoresIniciais));
  const [erros, setErros] = useState<ErrosCampo>({});
  const [resumo, setResumo] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const formulario = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const primeiro = campos.find((c) => erros[c.campo] !== undefined);
    if (primeiro === undefined) return;
    formulario.current?.querySelector<HTMLElement>(`#${idCampo(primeiro.campo)}`)?.focus();
  }, [tentativa, campos, erros]);

  function alterar(campo: string, valor: string) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }));
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const resultado = aoSalvar(valores);
    if (resultado.ok) {
      setErros({});
      setResumo(null);
      if (limparAoSalvar) setValores(valoresDe(campos, {}));
      aoSucesso(resultado.valor);
      return;
    }
    setErros(resultado.erro.tipo === 'validacao' ? resultado.erro.campos : {});
    setResumo(mensagemDeErro(resultado.erro));
    setTentativa((n) => n + 1);
  }

  return (
    <form ref={formulario} noValidate onSubmit={enviar} className={styles.formulario}>
      <p className={styles.legenda}>* campo obrigatório</p>
      {resumo === null ? null : (
        <p role="alert" className={styles.resumo}>
          {resumo}
        </p>
      )}
      {campos.map((campo) => {
        const erro = erros[campo.campo];
        return (
          <div key={campo.campo} className={styles.campo}>
            <label htmlFor={idCampo(campo.campo)}>
              {campo.rotulo}
              {campo.obrigatorio ? <span aria-hidden="true"> *</span> : null}
            </label>
            <Controle
              campo={campo}
              valor={valores[campo.campo] ?? ''}
              erro={erro}
              aoAlterar={alterar}
            />
            {erro === undefined ? null : (
              <p id={`erro-${campo.campo}`} className={styles.erro}>
                {erro}
              </p>
            )}
          </div>
        );
      })}
      <div className={styles.acoes}>
        <button type="submit" className="botao-primario">
          {rotuloSalvar}
        </button>
        {aoCancelar === undefined ? null : (
          <button type="button" onClick={aoCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
