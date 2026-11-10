// Validação de e-mail (FR-006) sem expressão regular com retrocesso (research R6).

export function emailValido(email: string): boolean {
  if (email === '' || /\s/.test(email)) return false;
  const partes = email.split('@');
  if (partes.length !== 2) return false;
  const [local, dominio] = partes as [string, string];
  if (local === '') return false;
  const ponto = dominio.indexOf('.');
  return ponto > 0 && !dominio.endsWith('.');
}
