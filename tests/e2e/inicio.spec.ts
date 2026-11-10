import { expect, test } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';

test.describe('Tela inicial', () => {
  test('carrega com título, menu na ordem do contrato e sem violações axe', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'SGP — Início' })).toBeVisible();
    await expect(page).toHaveTitle('SGP — Início');
    const menu = page.getByRole('navigation', { name: 'Menu principal' });
    await expect(menu.getByRole('link')).toHaveText([
      'Projetos',
      'Times',
      'Desenvolvedores',
      'Usuários',
      'Administradores',
    ]);
    await verificarAcessibilidade(page);
  });

  test('"Pular para o conteúdo" é o primeiro elemento focável e leva o foco ao main', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('SGP — Início');
    await page.keyboard.press('Tab');
    const pular = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(pular).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#conteudo')).toBeFocused();
  });
});
