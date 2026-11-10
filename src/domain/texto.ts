// Normalização de texto, busca e ordenação (FR-005, FR-007, FR-008; research R7).

const COLLATOR = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export function aparar(texto: string): string {
  return texto.trim();
}

/** Remove acentos e diferenças de maiúsculas/minúsculas. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
}

/** O campo contém o termo em qualquer posição? Termo vazio (após trim) casa tudo. */
export function contem(campo: string, termo: string): boolean {
  const alvo = normalizar(aparar(termo));
  return alvo === '' || normalizar(campo).includes(alvo);
}

/** Ordem alfabética por nome sem acento/caixa; empate pela ordem de criação. */
export function compararPorNome(
  a: { nome: string; seq: number },
  b: { nome: string; seq: number },
): number {
  return COLLATOR.compare(a.nome, b.nome) || a.seq - b.seq;
}

/** Chave usada para comparar unicidade (e-mail, nome de time). */
export function chaveUnicidade(valor: string): string {
  return valor.trim().toLocaleLowerCase('pt-BR');
}
