import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Justificativa (Princípio III) para não executar o axe no Firefox: no Firefox do Playwright
 * 1.65, a análise do axe-core (modo padrão e modo legado) derruba o processo da página
 * ("Page crashed") em telas com consultas por papel/nome feitas antes ou navegação feita
 * depois. As regras WCAG do axe avaliam DOM e CSS calculado, que são os mesmos nos três
 * navegadores; a verificação continua obrigatória em Chromium e Edge. Os demais passos de cada
 * teste continuam sendo executados no Firefox.
 */
const JUSTIFICATIVA_FIREFOX =
  'axe-core não executado no Firefox: derruba a página no Firefox do Playwright 1.65; verificação WCAG coberta por Chromium e Edge (tests/e2e/apoio/axe.ts).';

/** Verifica WCAG 2.1 A/AA na página atual e falha listando as violações. */
export async function verificarAcessibilidade(page: Page): Promise<void> {
  if (test.info().project.name === 'firefox') {
    const anotacoes = test.info().annotations;
    if (!anotacoes.some((a) => a.type === 'axe-ignorado')) {
      anotacoes.push({ type: 'axe-ignorado', description: JUSTIFICATIVA_FIREFOX });
    }
    return;
  }
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const violacoes = resultado.violations.map(
    (v) =>
      `${v.id} (${v.impact ?? 'sem impacto'}): ${v.help} — ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(violacoes, `Violações de acessibilidade em ${page.url()}`).toEqual([]);
}
