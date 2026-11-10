import { expect, test, type Page } from '@playwright/test';
import { lerDocumento, semearDocumento, semearTextoBruto, umTime } from './apoio/dados.ts';

/** A partir do carregamento, toda gravação no localStorage falha com cota esgotada. */
async function simularCotaEsgotada(page: Page) {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Cota excedida (simulada)', 'QuotaExceededError');
    };
  });
}

test.describe('FR-039 — falha ao gravar no navegador', () => {
  test('salvar formulário: mensagem de falha, formulário preenchido e dados intactos', async ({
    page,
  }) => {
    const mobile = umTime({ nome: 'Mobile' });
    const semeado = await semearDocumento(page, { times: [mobile] });
    await simularCotaEsgotada(page);
    await page.goto('/times/novo/');
    await page.getByLabel(/^Nome/).fill('Plataforma');
    await page.getByLabel(/^Descrição/).fill('Texto que não pode ser perdido');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Não foi possível salvar os dados no navegador (armazenamento cheio ou indisponível). Nada foi alterado.',
    );
    await expect(page.getByLabel(/^Nome/)).toHaveValue('Plataforma');
    await expect(page.getByLabel(/^Descrição/)).toHaveValue('Texto que não pode ser perdido');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Novo time');
    expect(await lerDocumento(page)).toEqual(semeado);
  });

  test('exclusão: mensagem própria e nada removido', async ({ page }) => {
    const mobile = umTime({ nome: 'Mobile' });
    const semeado = await semearDocumento(page, { times: [mobile] });
    await simularCotaEsgotada(page);
    await page.goto(`/times/detalhes/?id=${mobile.id}`);
    await page.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Não foi possível excluir: o armazenamento do navegador está cheio ou indisponível. Nada foi alterado.',
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time: Mobile');
    expect(await lerDocumento(page)).toEqual(semeado);
  });

  test('dados ilegíveis: mensagem de erro e valor preservado', async ({ page }) => {
    await semearTextoBruto(page, '{"versao": 1, ilegível');
    await page.goto('/times/');
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(
      'Os dados salvos neste navegador não puderam ser lidos. Nenhuma alteração será gravada para não perder informações.',
    );
    await page.goto('/times/novo/');
    await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar' })).toHaveCount(0);
    const bruto = await page.evaluate(() => window.localStorage.getItem('sgp:dados'));
    expect(bruto).toBe('{"versao": 1, ilegível');
  });
});
