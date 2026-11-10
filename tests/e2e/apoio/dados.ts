import type { Page } from '@playwright/test';
import type {
  Administrador,
  Desenvolvedor,
  Documento,
  ItemCronograma,
  Marco,
  Projeto,
  Relatorio,
  Time,
  Usuario,
} from '../../../src/domain/tipos.ts';

export const CHAVE = 'sgp:dados';

type Colecoes = Omit<Documento, 'versao' | 'seq'>;
export type DocumentoParcial = { [K in keyof Colecoes]?: Colecoes[K] };

let contador = 0;

function proximo(prefixo: string): { id: string; seq: number } {
  contador += 1;
  return { id: `${prefixo}-${contador}`, seq: contador };
}

export function umTime(dados: Partial<Time> = {}): Time {
  return { ...proximo('time'), nome: 'Time', descricao: '', area: '', ...dados };
}

export function umProjeto(dados: Partial<Projeto> & { timeId: string }): Projeto {
  return {
    ...proximo('projeto'),
    nome: 'Projeto',
    descricao: '',
    inicio: '2026-03-01',
    terminoPrevisto: '',
    situacao: 'planejado',
    ...dados,
  };
}

export function umDesenvolvedor(dados: Partial<Desenvolvedor> & { timeId: string }): Desenvolvedor {
  const base = proximo('dev');
  return {
    ...base,
    nome: 'Dev',
    email: `dev${base.seq}@empresa.com`,
    telefone: '',
    cargo: '',
    nivel: 'pleno',
    tecnologia: '',
    ...dados,
  };
}

export function umAdministrador(dados: Partial<Administrador> = {}): Administrador {
  const base = proximo('adm');
  return {
    ...base,
    nome: 'Administrador',
    email: `adm${base.seq}@empresa.com`,
    telefone: '11 99999-0000',
    cargo: 'Gerente',
    setor: 'TI',
    ...dados,
  };
}

export function umUsuario(dados: Partial<Usuario> = {}): Usuario {
  const base = proximo('usr');
  return {
    ...base,
    nome: 'Usuário',
    email: `usr${base.seq}@cliente.com`,
    telefone: '',
    organizacao: '',
    ...dados,
  };
}

export function umRelatorio(dados: Partial<Relatorio> & { projetoId: string }): Relatorio {
  return { ...proximo('rel'), texto: 'Relatório', criadoEm: '2026-03-10T12:00:00.000Z', ...dados };
}

export function umMarco(dados: Partial<Marco> & { projetoId: string }): Marco {
  return { ...proximo('marco'), descricao: 'Marco', ...dados };
}

export function umItem(dados: Partial<ItemCronograma> & { projetoId: string }): ItemCronograma {
  return { ...proximo('item'), atividade: 'Atividade', dataPrevista: '2026-04-01', ...dados };
}

/** Monta um documento versão 1 completo a partir das coleções informadas. */
export function documentoCompleto(parcial: DocumentoParcial): Documento {
  const doc: Documento = {
    versao: 1,
    seq: 0,
    administradores: parcial.administradores ?? [],
    usuarios: parcial.usuarios ?? [],
    desenvolvedores: parcial.desenvolvedores ?? [],
    times: parcial.times ?? [],
    projetos: parcial.projetos ?? [],
    relatorios: parcial.relatorios ?? [],
    marcos: parcial.marcos ?? [],
    itensCronograma: parcial.itensCronograma ?? [],
  };
  const seqs = Object.values(doc)
    .filter(Array.isArray)
    .flatMap((lista: readonly { seq: number }[]) => lista.map((r) => r.seq));
  return { ...doc, seq: Math.max(0, ...seqs) };
}

/**
 * Grava o documento em `sgp:dados` antes do primeiro carregamento da aplicação. A gravação
 * acontece uma única vez por contexto, para não desfazer alterações feitas depois (recarregar a
 * página ou abrir outra aba do mesmo contexto preserva os dados).
 */
export async function semearDocumento(page: Page, parcial: DocumentoParcial): Promise<Documento> {
  const documento = documentoCompleto(parcial);
  await page.addInitScript(
    ({ chave, texto }) => {
      if (window.localStorage.getItem('e2e:semeado') !== null) return;
      window.localStorage.setItem(chave, texto);
      window.localStorage.setItem('e2e:semeado', '1');
    },
    { chave: CHAVE, texto: JSON.stringify(documento) },
  );
  return documento;
}

/** Grava um valor bruto (ex.: ilegível) em `sgp:dados` antes do carregamento. */
export async function semearTextoBruto(page: Page, texto: string): Promise<void> {
  await page.addInitScript(
    ({ chave, valor }) => {
      window.localStorage.setItem(chave, valor);
    },
    { chave: CHAVE, valor: texto },
  );
}

export async function limparDados(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.clear());
}

export async function lerDocumento(page: Page): Promise<Documento | null> {
  const texto = await page.evaluate((chave) => window.localStorage.getItem(chave), CHAVE);
  return texto === null ? null : (JSON.parse(texto) as Documento);
}

/**
 * Seção (`<section aria-labelledby>`) localizada pelo título. Equivale a
 * `getByRole('region', { name })`, que não é usado porque, no Firefox do Playwright 1.65, essa
 * consulta seguida da verificação do axe derruba o processo da página ("Page crashed").
 */
export function secao(page: Page, titulo: string) {
  return page.locator('section').filter({ has: page.getByRole('heading', { name: titulo }) });
}

/** Um registro de cada cadastro, com acompanhamento, e as 21 rotas da aplicação para eles. */
export function cenarioCompleto() {
  const time = umTime({ nome: 'Plataforma', descricao: 'Time de plataforma web', area: 'Web' });
  const projeto = umProjeto({
    nome: 'Portal do Cliente com um nome bastante longo para testar quebras',
    timeId: time.id,
    terminoPrevisto: '2026-06-30',
    situacao: 'em_andamento',
  });
  const desenvolvedor = umDesenvolvedor({ nome: 'Ana Souza', timeId: time.id });
  const administrador = umAdministrador({ nome: 'João Silva' });
  const usuario = umUsuario({ nome: 'Maria Cliente', organizacao: 'Cliente S.A.' });
  const documento: DocumentoParcial = {
    times: [time],
    projetos: [projeto],
    desenvolvedores: [desenvolvedor],
    administradores: [administrador],
    usuarios: [usuario],
    relatorios: [umRelatorio({ projetoId: projeto.id, texto: 'Linha 1\nLinha 2' })],
    marcos: [umMarco({ projetoId: projeto.id, descricao: 'Kickoff' })],
    itensCronograma: [umItem({ projetoId: projeto.id, atividade: 'Testes' })],
  };
  const ids: Record<string, string> = {
    projetos: projeto.id,
    times: time.id,
    desenvolvedores: desenvolvedor.id,
    usuarios: usuario.id,
    administradores: administrador.id,
  };
  const rotas = ['/'];
  for (const [base, id] of Object.entries(ids)) {
    rotas.push(
      `/${base}/`,
      `/${base}/novo/`,
      `/${base}/detalhes/?id=${id}`,
      `/${base}/editar/?id=${id}`,
    );
  }
  return { documento, rotas };
}
