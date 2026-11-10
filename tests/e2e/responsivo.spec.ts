import { expect, test } from '@playwright/test';
import { cenarioCompleto, semearDocumento } from './apoio/dados.ts';

test.use({ viewport: { width: 360, height: 740 } });

test('SC-007/FR-034: 21 rotas a 360 px sem rolagem horizontal', async ({ page }) => {
  const { documento, rotas } = cenarioCompleto();
  await semearDocumento(page, documento);
  expect(rotas).toHaveLength(21);
  for (const rota of rotas) {
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Carregando…');
    // Espera os pré-carregamentos de rota terminarem antes de navegar de novo (Firefox).
    await page.waitForLoadState('networkidle');
    const larguras = await page.evaluate(() => ({
      rolagem: document.documentElement.scrollWidth,
      visivel: document.documentElement.clientWidth,
    }));
    expect(larguras.rolagem, `rolagem horizontal em ${rota}`).toBeLessThanOrEqual(larguras.visivel);
  }
});

test('abaixo de 640 px as listas viram cartões e abaixo de 768 px o menu fica no topo', async ({
  page,
}) => {
  const { documento } = cenarioCompleto();
  await semearDocumento(page, documento);
  await page.goto('/projetos/');
  const linha = page.locator('tbody tr').first();
  await expect(linha).toBeVisible();
  expect(await linha.evaluate((el) => getComputedStyle(el).display)).toBe('block');
  await expect(page.locator('thead')).toHaveCSS('position', 'absolute');
  const menu = await page.getByRole('navigation', { name: 'Menu principal' }).boundingBox();
  const principal = await page.locator('main').boundingBox();
  expect(menu).not.toBeNull();
  expect(principal).not.toBeNull();
  if (menu !== null && principal !== null) {
    expect(principal.y).toBeGreaterThanOrEqual(menu.y + menu.height);
    expect(menu.width).toBeGreaterThan(300);
  }
});
