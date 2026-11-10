import { expect, test } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';
import { cenarioCompleto, semearDocumento, umTime } from './apoio/dados.ts';

test.describe('WCAG 2.1 AA (axe-core)', () => {
  test('21 rotas com dados', async ({ page }) => {
    test.setTimeout(240_000);
    const { documento, rotas } = cenarioCompleto();
    await semearDocumento(page, documento);
    for (const rota of rotas) {
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Carregando…');
      // Espera os pré-carregamentos de rota terminarem antes de navegar de novo (Firefox).
      await page.waitForLoadState('networkidle');
      await verificarAcessibilidade(page);
    }
  });

  test('estados vazios das listas e aviso de "sem times"', async ({ page }) => {
    test.setTimeout(120_000);
    for (const rota of [
      '/projetos/',
      '/times/',
      '/desenvolvedores/',
      '/usuarios/',
      '/administradores/',
      '/projetos/novo/',
      '/desenvolvedores/novo/',
    ]) {
      await page.goto(rota);
      await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Carregando…');
      // Espera os pré-carregamentos de rota terminarem antes de navegar de novo (Firefox).
      await page.waitForLoadState('networkidle');
      await verificarAcessibilidade(page);
    }
  });

  test('busca sem resultado, formulário com erros e diálogo aberto', async ({ page }) => {
    const mobile = umTime({ nome: 'Mobile' });
    await semearDocumento(page, { times: [mobile] });
    await page.goto('/times/');
    await page.getByLabel('Buscar por nome').fill('zzz');
    await expect(page.getByRole('button', { name: 'Limpar busca e filtros' })).toBeVisible();
    await verificarAcessibilidade(page);
    await page.goto('/projetos/novo/');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-nome')).toBeVisible();
    await verificarAcessibilidade(page);
    await page.goto(`/times/detalhes/?id=${mobile.id}`);
    await page.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await verificarAcessibilidade(page);
  });
});
