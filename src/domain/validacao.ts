// Motor de validação dirigido por descritores de campo (research R6).

import { dataValida } from './datas.ts';
import { emailValido } from './email.ts';
import { DATA_INVALIDA, EMAIL_INVALIDO, obrigatorio, selecione, tamanho } from './mensagens.ts';
import type { ErrosCampo, Validado } from './tipos.ts';

export type TipoCampo = 'texto' | 'email' | 'enum' | 'data' | 'referencia';
export type ControleCampo = 'texto' | 'textarea' | 'email' | 'tel' | 'select' | 'date';
export type Opcao = { valor: string; rotulo: string };

export type CampoDescritor = {
  campo: string;
  /** Rótulo exibido, com inicial maiúscula ("Nome"). */
  rotulo: string;
  /** Rótulo com artigo, para "Informe {…}." / "Selecione {…}." ("o nome"). */
  rotuloComArtigo: string;
  obrigatorio: boolean;
  max?: number;
  tipo: TipoCampo;
  opcoes?: readonly Opcao[];
  /** Controle de formulário a usar (padrão derivado do tipo). */
  controle?: ControleCampo;
};

type EntradaBruta = Readonly<Record<string, string | undefined>>;

function ehSelecao(d: CampoDescritor): boolean {
  return d.tipo === 'enum' || d.tipo === 'referencia';
}

function erroVazio(d: CampoDescritor): string | undefined {
  if (!d.obrigatorio) return undefined;
  return ehSelecao(d) ? selecione(d.rotuloComArtigo) : obrigatorio(d.rotuloComArtigo);
}

function erroFormato(d: CampoDescritor, valor: string): string | undefined {
  if (d.tipo === 'email' && !emailValido(valor)) return EMAIL_INVALIDO;
  if (d.tipo === 'data' && !dataValida(valor)) return DATA_INVALIDA;
  if (d.tipo === 'enum' && !(d.opcoes ?? []).some((o) => o.valor === valor)) {
    return selecione(d.rotuloComArtigo);
  }
  return undefined;
}

/** Valida um campo já aparado. Ordem: obrigatório, tamanho (após trim), formato. */
function validarCampo(d: CampoDescritor, valor: string): string | undefined {
  if (valor === '') return erroVazio(d);
  if (d.max !== undefined && valor.length > d.max) return tamanho(d.rotulo, d.max);
  return erroFormato(d, valor);
}

/**
 * Apara todos os campos (FR-005) e aplica as regras de cada descritor. Regras entre campos
 * ficam nos módulos de `regras/`.
 */
export function validarCampos(
  descritores: readonly CampoDescritor[],
  entrada: EntradaBruta,
): { valores: Record<string, string>; erros: ErrosCampo } {
  const valores: Record<string, string> = {};
  const erros: ErrosCampo = {};
  for (const d of descritores) {
    const valor = (entrada[d.campo] ?? '').trim();
    valores[d.campo] = valor;
    const erro = validarCampo(d, valor);
    if (erro !== undefined) erros[d.campo] = erro;
  }
  return { valores, erros };
}

/** `validarCampos` tipado para os dados de uma entidade. */
export function validarCom<D>(
  descritores: readonly CampoDescritor[],
  entrada: EntradaBruta,
): Validado<D> {
  const { valores, erros } = validarCampos(descritores, entrada);
  return { valores: valores as D, erros };
}

export function semErros(erros: ErrosCampo): boolean {
  return Object.keys(erros).length === 0;
}
