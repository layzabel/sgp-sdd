import { expect, test } from '@playwright/test';
import { semearDocumento, umProjeto, umTime } from './apoio/dados.ts';

const CADASTROS = [
  ['Projetos', 'Novo projeto'],
  ['Times', 'Novo time'],
  ['Desenvolvedores', 'Novo desenvolvedor'],
  ['Usuários', 'Novo usuário'],
  ['Administradores', 'Novo administrador'],
] as const;

test.describe('SC-002 — navegação a partir do menu', () => {
  for (const [secao, novo] of CADASTROS) {
    test(`${secao}: lista em 1 interação e "${novo}" em 2`, async ({ page }) => {
      const plataforma = umTime({ nome: 'Plataforma' });
      await semearDocumento(page, { times: [plataforma] });
      await page.goto('/');
      const menu = page.getByRole('navigation', { name: 'Menu principal' });
      await menu.getByRole('link', { name: secao, exact: true }).click(); // 1
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(secao);
      await page.getByRole('link', { name: novo }).first().click(); // 2
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(novo);
    });
  }

  test('detalhes de um projeto em 2 interações a partir do menu', async ({ page }) => {
    const plataforma = umTime({ nome: 'Plataforma' });
    await semearDocumento(page, {
      times: [plataforma],
      projetos: [umProjeto({ nome: 'Portal do Cliente', timeId: plataforma.id })],
    });
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Menu principal' })
      .getByRole('link', { name: 'Projetos' })
      .click(); // 1
    await page.getByRole('link', { name: 'Portal do Cliente' }).click(); // 2
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projeto: Portal do Cliente');
  });

  test('registro inexistente mostra "Registro não encontrado." e volta para a lista', async ({
    page,
  }) => {
    await page.goto('/projetos/detalhes/?id=inexistente');
    await expect(page.getByText('Registro não encontrado.', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: 'Voltar para Projetos' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projetos');
  });
});
