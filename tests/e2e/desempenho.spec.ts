import { expect, test, type Locator, type Page } from '@playwright/test';
import { semearDocumento, umDesenvolvedor, umProjeto, umTime } from './apoio/dados.ts';
import type { Desenvolvedor, Nivel, Projeto, Situacao } from '../../src/domain/tipos.ts';

const LIMITE_MS = 1000;
const SITUACOES: Situacao[] = ['planejado', 'em_andamento', 'concluido', 'cancelado'];
const NIVEIS: Nivel[] = ['junior', 'pleno', 'senior'];

const plataforma = umTime({ nome: 'Plataforma' });
const mobile = umTime({ nome: 'Mobile' });

function numero(i: number): string {
  return String(i).padStart(3, '0');
}

const projetos: Projeto[] = Array.from({ length: 500 }, (_, i) =>
  umProjeto({
    nome: `Projeto ${numero(i + 1)}`,
    timeId: i % 2 === 0 ? plataforma.id : mobile.id,
    situacao: SITUACOES[i % SITUACOES.length] ?? 'planejado',
  }),
);

const desenvolvedores: Desenvolvedor[] = Array.from({ length: 500 }, (_, i) =>
  umDesenvolvedor({
    nome: `Pessoa ${numero(i + 1)}`,
    timeId: i % 2 === 0 ? plataforma.id : mobile.id,
    nivel: NIVEIS[i % NIVEIS.length] ?? 'pleno',
  }),
);

type Cronometro = { inicio: number | null; fim: number | null };
type JanelaComCronometro = Window & { __cronometro?: Cronometro };

/**
 * Mede, dentro da página, do evento (input/change) até a contagem em role="status" mostrar o
 * valor esperado. Medir pelo `expect` incluiria o intervalo de nova tentativa do Playwright.
 */
async function medir(page: Page, acao: () => Promise<unknown>, esperado: number): Promise<number> {
  const texto = `${esperado} registro(s) encontrado(s)`;
  await page.evaluate((alvoTexto) => {
    const janela = window as JanelaComCronometro;
    const cronometro: Cronometro = { inicio: null, fim: null };
    janela.__cronometro = cronometro;
    const marcarInicio = () => {
      cronometro.inicio ??= performance.now();
    };
    document.addEventListener('input', marcarInicio, { capture: true, once: true });
    document.addEventListener('change', marcarInicio, { capture: true, once: true });
    const status = document.querySelector('main [role="status"]');
    if (status === null) return;
    const observador = new MutationObserver(() => {
      if (status.textContent === alvoTexto && cronometro.fim === null) {
        cronometro.fim = performance.now();
        observador.disconnect();
      }
    });
    observador.observe(status, { childList: true, characterData: true, subtree: true });
  }, texto);
  await acao();
  const status: Locator = page.getByRole('status');
  await expect(status).toHaveText(texto);
  const tempo = await page.evaluate(() => {
    const c = (window as JanelaComCronometro).__cronometro;
    return c?.inicio != null && c.fim != null ? c.fim - c.inicio : Number.POSITIVE_INFINITY;
  });
  test.info().annotations.push({ type: 'tempo-ms', description: tempo.toFixed(1) });
  return tempo;
}

test.describe('SC-006 — busca e filtros com 500 registros em até 1 s', () => {
  test('projetos', async ({ page }) => {
    await semearDocumento(page, { times: [plataforma, mobile], projetos });
    await page.goto('/projetos/');
    await expect(page.getByRole('status')).toHaveText('500 registro(s) encontrado(s)');
    const busca = page.getByLabel('Buscar por nome');
    const contar = (termo: string, situacao: Situacao | '', timeId: string) =>
      projetos.filter(
        (p) =>
          p.nome.includes(termo) &&
          (situacao === '' || p.situacao === situacao) &&
          (timeId === '' || p.timeId === timeId),
      ).length;
    // Cada passo muda a contagem (a medição espera a atualização do role="status").
    const passos: [() => Promise<unknown>, number][] = [
      [() => busca.fill('Projeto 1'), contar('Projeto 1', '', '')],
      [
        () => page.getByLabel('Situação').selectOption('planejado'),
        contar('Projeto 1', 'planejado', ''),
      ],
      [
        () => page.getByLabel('Time').selectOption(mobile.id),
        contar('Projeto 1', 'planejado', mobile.id),
      ],
      [
        () => page.getByLabel('Time').selectOption(plataforma.id),
        contar('Projeto 1', 'planejado', plataforma.id),
      ],
      [() => busca.fill(''), contar('', 'planejado', plataforma.id)],
    ];
    let anterior = 500;
    for (const [acao, esperado] of passos) {
      expect(esperado, 'cada passo deve mudar a contagem').not.toBe(anterior);
      expect(await medir(page, acao, esperado)).toBeLessThan(LIMITE_MS);
      anterior = esperado;
    }
  });

  test('desenvolvedores', async ({ page }) => {
    await semearDocumento(page, { times: [plataforma, mobile], desenvolvedores });
    await page.goto('/desenvolvedores/');
    await expect(page.getByRole('status')).toHaveText('500 registro(s) encontrado(s)');
    const tempos = [
      await medir(
        page,
        () => page.getByLabel('Buscar por nome').fill('Pessoa 2'),
        desenvolvedores.filter((d) => d.nome.includes('Pessoa 2')).length,
      ),
      await medir(
        page,
        () => page.getByLabel('Nível').selectOption('senior'),
        desenvolvedores.filter((d) => d.nome.includes('Pessoa 2') && d.nivel === 'senior').length,
      ),
      await medir(
        page,
        () => page.getByLabel('Time').selectOption(plataforma.id),
        desenvolvedores.filter(
          (d) => d.nome.includes('Pessoa 2') && d.nivel === 'senior' && d.timeId === plataforma.id,
        ).length,
      ),
    ];
    for (const tempo of tempos) expect(tempo).toBeLessThan(LIMITE_MS);
  });
});
