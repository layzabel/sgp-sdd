import { expect, test, type Page } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';
import {
  lerDocumento,
  secao,
  semearDocumento,
  umDesenvolvedor,
  umProjeto,
  umTime,
} from './apoio/dados.ts';

async function cadastrarTime(page: Page, nome: string, area = '') {
  await page.goto('/times/novo/');
  await page.getByLabel(/^Nome/).fill(nome);
  if (area !== '') await page.getByLabel(/^Área de atuação/).fill(area);
  await page.getByRole('button', { name: 'Salvar' }).click();
}

test.describe('US1 — Gerenciar times', () => {
  test('cenário 1: cadastro com mensagem de sucesso e time na lista', async ({ page }) => {
    await page.goto('/times/novo/');
    await verificarAcessibilidade(page);
    await page.getByLabel(/^Nome/).fill('Plataforma');
    await page.getByLabel(/^Descrição/).fill('Time de plataforma');
    await page.getByLabel(/^Área de atuação/).fill('Web');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time: Plataforma');
    await expect(page.getByRole('status')).toContainText('Time cadastrado com sucesso.');
    await verificarAcessibilidade(page);
    await page
      .getByRole('navigation', { name: 'Menu principal' })
      .getByRole('link', { name: 'Times' })
      .click();
    await expect(page.getByRole('link', { name: 'Plataforma' })).toBeVisible();
    await verificarAcessibilidade(page);
  });

  test('cenários 2 e 3: nome repetido e nome só com espaços não são salvos', async ({ page }) => {
    await semearDocumento(page, { times: [umTime({ nome: 'Plataforma' })] });
    await cadastrarTime(page, 'plataforma');
    await expect(page.locator('#erro-nome')).toHaveText(
      'Já existe um time com esse nome. Escolha outro nome.',
    );
    await expect(page.getByLabel(/^Nome/)).toHaveAttribute('aria-invalid', 'true');
    await verificarAcessibilidade(page);
    await page.getByLabel(/^Nome/).fill('    ');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-nome')).toHaveText('Informe o nome.');
    await expect(page.getByLabel(/^Nome/)).toBeFocused();
    expect((await lerDocumento(page))?.times).toHaveLength(1);
  });

  test('cenário 4: busca "plat" mostra só Plataforma', async ({ page }) => {
    await semearDocumento(page, {
      times: [umTime({ nome: 'Plataforma' }), umTime({ nome: 'Mobile' })],
    });
    await page.goto('/times/');
    await expect(page.getByRole('status')).toHaveText('2 registro(s) encontrado(s)');
    await page.getByLabel('Buscar por nome').fill('plat');
    await expect(page.getByRole('status')).toHaveText('1 registro(s) encontrado(s)');
    await expect(page.getByRole('link', { name: 'Plataforma' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mobile' })).toHaveCount(0);
  });

  test('cenários 5 e 6: detalhes com vínculos e bloqueio da exclusão', async ({ page }) => {
    const plataforma = umTime({ nome: 'Plataforma' });
    await semearDocumento(page, {
      times: [plataforma],
      desenvolvedores: [
        umDesenvolvedor({ nome: 'Ana', timeId: plataforma.id }),
        umDesenvolvedor({ nome: 'Bruno', timeId: plataforma.id }),
      ],
      projetos: [umProjeto({ nome: 'Portal do Cliente', timeId: plataforma.id })],
    });
    await page.goto(`/times/detalhes/?id=${plataforma.id}`);
    const devs = secao(page, 'Desenvolvedores do time');
    await expect(devs.getByRole('link')).toHaveText(['Ana', 'Bruno']);
    const projetos = secao(page, 'Projetos do time');
    await expect(projetos.getByRole('link')).toHaveText(['Portal do Cliente']);
    await verificarAcessibilidade(page);
    await page.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('alert')).toContainText(
      'Não é possível excluir o time "Plataforma": ele possui 2 desenvolvedor(es) e 1 projeto(s) vinculados.',
    );
    expect((await lerDocumento(page))?.times).toHaveLength(1);
  });

  test('cenário 7: exclusão cancelada e confirmada', async ({ page }) => {
    const mobile = umTime({ nome: 'Mobile' });
    await semearDocumento(page, { times: [mobile] });
    await page.goto(`/times/detalhes/?id=${mobile.id}`);
    await page.getByRole('button', { name: 'Excluir' }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toContainText('Excluir time "Mobile"? Esta ação não pode ser desfeita.');
    await verificarAcessibilidade(page);
    await dialogo.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialogo).toBeHidden();
    await expect(page.getByRole('button', { name: 'Excluir' })).toBeFocused();
    expect((await lerDocumento(page))?.times).toHaveLength(1);
    await page.getByRole('button', { name: 'Excluir' }).click();
    await dialogo.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Times');
    await expect(page.getByRole('status').first()).toContainText('Time excluído com sucesso.');
    expect((await lerDocumento(page))?.times).toHaveLength(0);
  });

  test('edição com verificação axe', async ({ page }) => {
    const mobile = umTime({ nome: 'Mobile' });
    await semearDocumento(page, { times: [mobile] });
    await page.goto(`/times/editar/?id=${mobile.id}`);
    await expect(page.getByLabel(/^Nome/)).toHaveValue('Mobile');
    await verificarAcessibilidade(page);
    await page.getByLabel(/^Área de atuação/).fill('Apps');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('status')).toContainText('Time atualizado com sucesso.');
    await expect(page.getByText('Apps')).toBeVisible();
  });

  test('cenário 8: persistência após recarregar e em nova página do mesmo contexto', async ({
    page,
    context,
  }) => {
    await cadastrarTime(page, 'Plataforma', 'Web');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time: Plataforma');
    await expect(page).toHaveURL(/\/times\/detalhes\/\?id=/);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Time: Plataforma');
    const outra = await context.newPage();
    await outra.goto('/times/');
    await expect(outra.getByRole('link', { name: 'Plataforma' })).toBeVisible();
    await outra.getByRole('link', { name: 'Plataforma' }).click();
    await expect(outra.getByText('Web')).toBeVisible();
  });
});
