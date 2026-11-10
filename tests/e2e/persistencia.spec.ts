import { expect, test, type Page } from '@playwright/test';
import { lerDocumento, secao } from './apoio/dados.ts';

async function salvar(page: Page, tituloEsperado: string) {
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(tituloEsperado);
}

test('SC-003/FR-038: todos os registros continuam iguais ao fechar e reabrir', async ({
  page,
  context,
}) => {
  await page.goto('/times/novo/');
  await page.getByLabel(/^Nome/).fill('Plataforma');
  await page.getByLabel(/^Área de atuação/).fill('Web');
  await salvar(page, 'Time: Plataforma');

  await page.goto('/projetos/novo/');
  await page.getByLabel(/^Nome/).fill('Portal');
  await page.getByLabel(/^Data de início/).fill('2026-03-10');
  await page.getByLabel(/^Situação/).selectOption({ label: 'Em andamento' });
  await page.getByLabel(/^Time responsável/).selectOption({ label: 'Plataforma' });
  await salvar(page, 'Projeto: Portal');
  await secao(page, 'Relatórios')
    .getByLabel(/^Texto do relatório/)
    .fill('Relatório 1');
  await secao(page, 'Relatórios').getByRole('button', { name: 'Adicionar relatório' }).click();
  await expect(secao(page, 'Relatórios').getByRole('listitem')).toHaveCount(1);
  await secao(page, 'Marcos')
    .getByLabel(/^Descrição do marco/)
    .fill('Kickoff');
  await secao(page, 'Marcos').getByRole('button', { name: 'Adicionar marco' }).click();
  await expect(secao(page, 'Marcos').getByRole('listitem')).toHaveCount(1);
  await secao(page, 'Cronograma')
    .getByLabel(/^Atividade/)
    .fill('Testes');
  await secao(page, 'Cronograma')
    .getByLabel(/^Data prevista/)
    .fill('2026-04-05');
  await secao(page, 'Cronograma').getByRole('button', { name: 'Adicionar item' }).click();
  await expect(secao(page, 'Cronograma').getByRole('listitem')).toHaveCount(1);

  await page.goto('/desenvolvedores/novo/');
  await page.getByLabel(/^Nome/).fill('Ana');
  await page.getByLabel(/^E-mail/).fill('ana@empresa.com');
  await page.getByLabel(/^Nível/).selectOption({ label: 'Sênior' });
  await page.getByLabel(/^Time/).selectOption({ label: 'Plataforma' });
  await salvar(page, 'Desenvolvedor: Ana');

  await page.goto('/administradores/novo/');
  await page.getByLabel(/^Nome/).fill('João');
  await page.getByLabel(/^E-mail/).fill('joao@empresa.com');
  await page.getByLabel(/^Telefone/).fill('11 9999-0000');
  await page.getByLabel(/^Cargo/).fill('Gerente');
  await page.getByLabel(/^Setor/).fill('TI');
  await salvar(page, 'Administrador: João');

  await page.goto('/usuarios/novo/');
  await page.getByLabel(/^Nome/).fill('Maria');
  await page.getByLabel(/^E-mail/).fill('maria@cliente.com');
  await page.getByLabel(/^Organização/).fill('Cliente S.A.');
  await salvar(page, 'Usuário: Maria');

  const antes = await lerDocumento(page);
  expect(antes?.seq).toBe(8);
  await page.close();

  const reaberta = await context.newPage();
  await reaberta.goto('/');
  expect(await lerDocumento(reaberta)).toEqual(antes);
  await reaberta.goto('/projetos/');
  await reaberta.getByRole('link', { name: 'Portal' }).click();
  await expect(secao(reaberta, 'Relatórios')).toContainText('Relatório 1');
  await expect(secao(reaberta, 'Marcos')).toContainText('Kickoff');
  await expect(secao(reaberta, 'Cronograma')).toContainText('05/04/2026 — Testes');
  for (const [rota, nome] of [
    ['/times/', 'Plataforma'],
    ['/desenvolvedores/', 'Ana'],
    ['/administradores/', 'João'],
    ['/usuarios/', 'Maria'],
  ] as const) {
    await reaberta.goto(rota);
    await expect(reaberta.getByRole('link', { name: nome })).toBeVisible();
  }
});
