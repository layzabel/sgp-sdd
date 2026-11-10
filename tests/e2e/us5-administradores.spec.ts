import { expect, test } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';
import { lerDocumento, semearDocumento, umAdministrador } from './apoio/dados.ts';

test.describe('US5 — Gerenciar administradores', () => {
  test('cenário 1: cadastro com todos os campos aparece na lista', async ({ page }) => {
    await page.goto('/administradores/novo/');
    await verificarAcessibilidade(page);
    await page.getByLabel(/^Nome/).fill('João Silva');
    await page.getByLabel(/^E-mail/).fill('joao@empresa.com');
    await page.getByLabel(/^Telefone/).fill('(11) 98888-7777');
    await page.getByLabel(/^Cargo/).fill('Gerente de Projetos');
    await page.getByLabel(/^Setor/).fill('TI');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Administrador: João Silva');
    await expect(page.getByRole('status')).toContainText('Administrador cadastrado com sucesso.');
    await verificarAcessibilidade(page);
    await page.goto('/administradores/');
    const linha = page.getByRole('row', { name: /João Silva/ });
    await expect(linha).toContainText('joao@empresa.com');
    await expect(linha).toContainText('Gerente de Projetos');
    await expect(linha).toContainText('TI');
    await verificarAcessibilidade(page);
  });

  test('cenário 2: os cinco campos obrigatórios', async ({ page }) => {
    await page.goto('/administradores/novo/');
    await page.getByRole('button', { name: 'Salvar' }).click();
    for (const [campo, texto] of [
      ['nome', 'Informe o nome.'],
      ['email', 'Informe o e-mail.'],
      ['telefone', 'Informe o telefone.'],
      ['cargo', 'Informe o cargo.'],
      ['setor', 'Informe o setor.'],
    ] as const) {
      await expect(page.locator(`#erro-${campo}`)).toHaveText(texto);
    }
    await expect(page.getByLabel(/^Nome/)).toBeFocused();
    await verificarAcessibilidade(page);
  });

  test('cenário 3: e-mail repetido no cadastro e na edição', async ({ page }) => {
    const joao = umAdministrador({ nome: 'João', email: 'joao@empresa.com' });
    const maria = umAdministrador({ nome: 'Maria', email: 'maria@empresa.com' });
    await semearDocumento(page, { administradores: [joao, maria] });
    await page.goto('/administradores/novo/');
    await page.getByLabel(/^Nome/).fill('Outro');
    await page.getByLabel(/^E-mail/).fill('JOAO@empresa.com');
    await page.getByLabel(/^Telefone/).fill('1');
    await page.getByLabel(/^Cargo/).fill('c');
    await page.getByLabel(/^Setor/).fill('s');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Este e-mail já está em uso por outro administrador.',
    );
    await page.goto(`/administradores/editar/?id=${maria.id}`);
    await verificarAcessibilidade(page);
    await page.getByLabel(/^E-mail/).fill('joao@empresa.com');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Este e-mail já está em uso por outro administrador.',
    );
  });

  test('cenário 4: busca por parte do nome ou do e-mail', async ({ page }) => {
    await semearDocumento(page, {
      administradores: [
        umAdministrador({ nome: 'João Silva', email: 'jsilva@empresa.com' }),
        umAdministrador({ nome: 'Maria', email: 'maria@financeiro.com' }),
      ],
    });
    await page.goto('/administradores/');
    await page.getByLabel('Buscar por nome ou e-mail').fill('silva');
    await expect(page.getByRole('status')).toHaveText('1 registro(s) encontrado(s)');
    await expect(page.getByRole('link', { name: 'João Silva' })).toBeVisible();
    await page.getByLabel('Buscar por nome ou e-mail').fill('financeiro');
    await expect(page.getByRole('link', { name: 'Maria' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('1 registro(s) encontrado(s)');
  });

  test('cenário 5: exclusão cancelada e confirmada', async ({ page }) => {
    const joao = umAdministrador({ nome: 'João' });
    await semearDocumento(page, { administradores: [joao] });
    await page.goto(`/administradores/detalhes/?id=${joao.id}`);
    await page.getByRole('button', { name: 'Excluir' }).click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toContainText('Excluir administrador "João"?');
    await verificarAcessibilidade(page);
    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
    expect((await lerDocumento(page))?.administradores).toHaveLength(1);
    await page.getByRole('button', { name: 'Excluir' }).click();
    await dialogo.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Administradores');
    await expect(page.getByRole('status').first()).toContainText(
      'Administrador excluído com sucesso.',
    );
    expect((await lerDocumento(page))?.administradores).toEqual([]);
  });
});
