// Datas sem hora em texto AAAA-MM-DD e exibição dd/mm/aaaa (research R8).

const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const SO_DIGITOS = /^\d+$/;

function bissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

function diasNoMes(ano: number, mes: number): number {
  if (mes === 2 && bissexto(ano)) return 29;
  return DIAS_POR_MES[mes - 1] ?? 0;
}

/** Valida uma data AAAA-MM-DD existente no calendário (sem usar Date). */
export function dataValida(texto: string): boolean {
  const partes = texto.split('-');
  if (partes.length !== 3) return false;
  const [ano, mes, dia] = partes as [string, string, string];
  const tamanhosOk = ano.length === 4 && mes.length === 2 && dia.length === 2;
  if (!tamanhosOk || !partes.every((p) => SO_DIGITOS.test(p))) return false;
  const m = Number(mes);
  const d = Number(dia);
  return m >= 1 && m <= 12 && d >= 1 && d <= diasNoMes(Number(ano), m);
}

/** AAAA-MM-DD → dd/mm/aaaa. */
export function formatarData(texto: string): string {
  const [ano = '', mes = '', dia = ''] = texto.split('-');
  return `${dia}/${mes}/${ano}`;
}

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

/** Instante ISO 8601 → data local dd/mm/aaaa (sem hora, FR-027). */
export function formatarDataDeMomento(iso: string): string {
  const momento = new Date(iso);
  return `${doisDigitos(momento.getDate())}/${doisDigitos(momento.getMonth() + 1)}/${momento.getFullYear()}`;
}
