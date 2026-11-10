import { expect, test, type Page } from '@playwright/test';
import { verificarAcessibilidade } from './apoio/axe.ts';
import { lerDocumento, secao, semearDocumento, umDesenvolvedor, umTime } from './apoio/dados.ts';

const plataforma = umTime({ nome: 'Plataforma' });
const mobile = umTime({ nome: 'Mobile' });

async function preencher(
  page: Page,
  dados: { nome?: string; email?: string; nivel?: string; time?: string },
) {
  if (dados.nome !== undefined) await page.getByLabel(/^Nome/).fill(dados.nome);
  if (dados.email !== undefined) await page.getByLabel(/^E-mail/).fill(dados.email);
  if (dados.nivel !== undefined)
    await page.getByLabel(/^Nível/).selectOption({ label: dados.nivel });
  if (dados.time !== undefined) await page.getByLabel(/^Time/).selectOption({ label: dados.time });
}

test.describe('US4 — Gerenciar desenvolvedores', () => {
  test('cenário 1: cadastro aparece na lista e nos detalhes do time', async ({ page }) => {
    await semearDocumento(page, { times: [plataforma, mobile] });
    await page.goto('/desenvolvedores/novo/');
    await verificarAcessibilidade(page);
    await preencher(page, {
      nome: 'Ana Souza',
      email: 'ana@empresa.com',
      nivel: 'Pleno',
      time: 'Plataforma',
    });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Desenvolvedor: Ana Souza');
    await expect(page.getByRole('status')).toContainText('Desenvolvedor cadastrado com sucesso.');
    await verificarAcessibilidade(page);
    await page.getByRole('link', { name: 'Plataforma' }).click();
    await expect(secao(page, 'Desenvolvedores do time').getByRole('link')).toHaveText([
      'Ana Souza',
    ]);
    await page.goto('/desenvolvedores/');
    await expect(page.getByRole('link', { name: 'Ana Souza' })).toBeVisible();
    await verificarAcessibilidade(page);
  });

  test('cenários 2 e 3: obrigatórios e e-mail inválido', async ({ page }) => {
    await semearDocumento(page, { times: [plataforma] });
    await page.goto('/desenvolvedores/novo/');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-nome')).toHaveText('Informe o nome.');
    await expect(page.locator('#erro-email')).toHaveText('Informe o e-mail.');
    await expect(page.locator('#erro-nivel')).toHaveText('Selecione o nível.');
    await expect(page.locator('#erro-timeId')).toHaveText('Selecione o time.');
    await preencher(page, {
      nome: 'Ana',
      email: 'ana@empresa',
      nivel: 'Pleno',
      time: 'Plataforma',
    });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Informe um e-mail válido, como nome@empresa.com.',
    );
    expect((await lerDocumento(page))?.desenvolvedores).toEqual([]);
  });

  test('cenário 4: e-mail repetido no cadastro e na edição', async ({ page }) => {
    const ana = umDesenvolvedor({ nome: 'Ana', email: 'ana@empresa.com', timeId: plataforma.id });
    const bia = umDesenvolvedor({ nome: 'Bia', email: 'bia@empresa.com', timeId: plataforma.id });
    await semearDocumento(page, { times: [plataforma], desenvolvedores: [ana, bia] });
    await page.goto('/desenvolvedores/novo/');
    await preencher(page, {
      nome: 'Outra',
      email: 'Ana@Empresa.com',
      nivel: 'Júnior',
      time: 'Plataforma',
    });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Este e-mail já está em uso por outro desenvolvedor.',
    );
    await page.goto(`/desenvolvedores/editar/?id=${bia.id}`);
    await page.getByLabel(/^E-mail/).fill('Ana@Empresa.com');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('#erro-email')).toHaveText(
      'Este e-mail já está em uso por outro desenvolvedor.',
    );
  });

  test('cenário 5: busca, time e nível combinados', async ({ page }) => {
    await semearDocumento(page, {
      times: [plataforma, mobile],
      desenvolvedores: [
        umDesenvolvedor({ nome: 'Ana Souza', timeId: plataforma.id, nivel: 'pleno' }),
        umDesenvolvedor({ nome: 'Ana Paula', timeId: mobile.id, nivel: 'pleno' }),
        umDesenvolvedor({ nome: 'Ana Lima', timeId: plataforma.id, nivel: 'senior' }),
        umDesenvolvedor({ nome: 'Bruno', timeId: plataforma.id, nivel: 'pleno' }),
      ],
    });
    await page.goto('/desenvolvedores/');
    await page.getByLabel('Buscar por nome').fill('ana');
    await page.getByLabel('Time').selectOption({ label: 'Plataforma' });
    await page.getByLabel('Nível').selectOption({ label: 'Pleno' });
    await expect(page.getByRole('status')).toHaveText('1 registro(s) encontrado(s)');
    await expect(page.getByRole('link', { name: 'Ana Souza' })).toBeVisible();
  });

  test('cenários 6 e 7: troca de time e exclusão refletidas nos times', async ({ page }) => {
    const ana = umDesenvolvedor({ nome: 'Ana', timeId: plataforma.id });
    await semearDocumento(page, { times: [plataforma, mobile], desenvolvedores: [ana] });
    await page.goto(`/desenvolvedores/editar/?id=${ana.id}`);
    await verificarAcessibilidade(page);
    await page.getByLabel(/^Time/).selectOption({ label: 'Mobile' });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('status')).toContainText('Desenvolvedor atualizado com sucesso.');
    await page.goto(`/times/detalhes/?id=${mobile.id}`);
    await expect(secao(page, 'Desenvolvedores do time').getByRole('link')).toHaveText(['Ana']);
    await page.goto(`/times/detalhes/?id=${plataforma.id}`);
    await expect(secao(page, 'Desenvolvedores do time').getByRole('link')).toHaveCount(0);
    await page.goto(`/desenvolvedores/detalhes/?id=${ana.id}`);
    await page.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Desenvolvedores');
    await expect(page.getByRole('status').first()).toContainText(
      'Desenvolvedor excluído com sucesso.',
    );
    await page.goto(`/times/detalhes/?id=${mobile.id}`);
    await expect(secao(page, 'Desenvolvedores do time').getByRole('link')).toHaveCount(0);
  });
});
