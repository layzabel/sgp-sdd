import { expect, test } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';
import { lerDocumento, semearDocumento, umUsuario } from './apoio/dados.ts';

test.describe('US6 — Gerenciar usuários', () => {
  test('cenário 1: cadastro só com nome e e-mail', async ({ page }) => {
    await page.goto('/usuarios/novo/');
    await verificarAcessibilidade(page);
    await page.getByLabel(/^Nome/).fill('Maria Cliente');
    await page.getByLabel(/^E-mail/).fill('maria@cliente.com');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Usuário: Maria Cliente');
    await expect(page.getByRole('status')).toContainText('Usuário cadastrado com sucesso.');
    await expect(page.getByText('Não informado')).toHaveCount(2);
    await verificarAcessibilidade(page);
    await page.goto('/usuarios/');
    await expect(page.getByRole('link', { name: 'Maria Cliente' })).toBeVisible();
    await verificarAcessibilidade(page);
  });

  test('cenário 2: nome/e-mail vazios ou e-mail inválido', async ({ page }) => {
    await page.goto('/usuarios/novo/');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-nome')).toHaveText('Informe o nome.');
    await expect(page.locator('#erro-email')).toHaveText('Informe o e-mail.');
    await page.getByLabel(/^Nome/).fill('Maria');
    await page.getByLabel(/^E-mail/).fill('maria@cliente');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Informe um e-mail válido, como nome@empresa.com.',
    );
    await expect(page.locator('#erro-nome')).toHaveCount(0);
    expect(await lerDocumento(page)).toBeNull();
  });

  test('cenário 3: e-mail repetido no cadastro e na edição', async ({ page }) => {
    const maria = umUsuario({ nome: 'Maria', email: 'maria@cliente.com' });
    const carlos = umUsuario({ nome: 'Carlos', email: 'carlos@cliente.com' });
    await semearDocumento(page, { usuarios: [maria, carlos] });
    await page.goto('/usuarios/novo/');
    await page.getByLabel(/^Nome/).fill('Outra');
    await page.getByLabel(/^E-mail/).fill('Maria@Cliente.com');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Este e-mail já está em uso por outro usuário.',
    );
    await page.goto(`/usuarios/editar/?id=${carlos.id}`);
    await verificarAcessibilidade(page);
    await page.getByLabel(/^E-mail/).fill('maria@cliente.com');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Este e-mail já está em uso por outro usuário.',
    );
  });

  test('cenário 4: busca por nome ou organização', async ({ page }) => {
    await semearDocumento(page, {
      usuarios: [
        umUsuario({ nome: 'Maria', organizacao: 'Cliente S.A.' }),
        umUsuario({ nome: 'Carlos', organizacao: 'Fornecedora Ltda' }),
      ],
    });
    await page.goto('/usuarios/');
    await page.getByLabel('Buscar por nome ou organização').fill('fornec');
    await expect(page.getByRole('status')).toHaveText('1 registro(s) encontrado(s)');
    await expect(page.getByRole('link', { name: 'Carlos' })).toBeVisible();
    await page.getByLabel('Buscar por nome ou organização').fill('mari');
    await expect(page.getByRole('link', { name: 'Maria' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('1 registro(s) encontrado(s)');
  });

  test('cenário 5: exclusão confirmada', async ({ page }) => {
    const maria = umUsuario({ nome: 'Maria' });
    await semearDocumento(page, { usuarios: [maria] });
    await page.goto(`/usuarios/detalhes/?id=${maria.id}`);
    await verificarAcessibilidade(page);
    await page.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Usuários');
    await expect(page.getByRole('status').first()).toContainText('Usuário excluído com sucesso.');
    expect((await lerDocumento(page))?.usuarios).toEqual([]);
  });
});
