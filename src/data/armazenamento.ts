// Interface de armazenamento injetável (contracts/repositorio.md).

export interface Armazenamento {
  /** Pode lançar (ex.: acesso negado). */
  getItem(chave: string): string | null;
  /** Pode lançar (ex.: QuotaExceededError). */
  setItem(chave: string, valor: string): void;
}

/** Implementação de produção sobre window.localStorage; exceções são tratadas no repositório. */
export function criarArmazenamentoNavegador(): Armazenamento {
  return {
    getItem: (chave) => window.localStorage.getItem(chave),
    setItem: (chave, valor) => window.localStorage.setItem(chave, valor),
  };
}

/** Implementação em memória para testes, com falhas simuláveis. */
export class ArmazenamentoEmMemoria implements Armazenamento {
  private readonly valores = new Map<string, string>();
  private erroGravacao: unknown = null;
  private leituraFalha = false;
  gravacoes = 0;

  constructor(valorInicial: string | null = null, chave = 'sgp:dados') {
    if (valorInicial !== null) this.valores.set(chave, valorInicial);
  }

  falharProximaGravacao(erro: unknown = new Error('armazenamento cheio')): void {
    this.erroGravacao = erro;
  }

  falharLeitura(): void {
    this.leituraFalha = true;
  }

  getItem(chave: string): string | null {
    if (this.leituraFalha) throw new Error('acesso negado');
    return this.valores.get(chave) ?? null;
  }

  setItem(chave: string, valor: string): void {
    this.gravacoes += 1;
    if (this.erroGravacao !== null) {
      const erro = this.erroGravacao;
      this.erroGravacao = null;
      throw erro;
    }
    this.valores.set(chave, valor);
  }
}
